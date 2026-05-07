import { useCallback, useRef, useState } from 'react';
import { Arrangement, arrangementLengthBeats, TrackNote } from '../../lib/music';

interface PlaybackHandle {
  stop: () => void;
}

export function useTonePlayback(): {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (arrangement: Arrangement) => Promise<void>;
  stop: () => void;
} {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<PlaybackHandle | null>(null);

  const stop = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    async (arrangement: Arrangement) => {
      setIsLoading(true);
      setError(null);
      stop();

      try {
        const Tone = await import('tone');
        await Tone.start();

        const transport = Tone.getTransport();
        transport.stop();
        transport.cancel();
        transport.bpm.value = arrangement.bpm;

        const destination = Tone.getDestination();
        destination.volume.value = -10;

        const master = new Tone.Limiter(-1).toDestination();
        const synths = arrangement.tracks.map((track) => ({
          track,
          synth: createSynth(Tone, track.family).connect(master)
        }));
        const disposables = [master, ...synths.map(({ synth }) => synth)];
        const beatSeconds = 60 / arrangement.bpm;

        for (const { track, synth } of synths) {
          for (const note of track.notes) {
            transport.schedule((time) => {
              triggerNote(Tone, synth, note, time, note.duration * beatSeconds);
            }, note.start * beatSeconds);
          }
        }

        const endTimer = window.setTimeout(
          () => {
            stop();
          },
          (arrangementLengthBeats(arrangement) * beatSeconds + 1) * 1000
        );

        handleRef.current = {
          stop: () => {
            window.clearTimeout(endTimer);
            transport.stop();
            transport.cancel();
            disposables.forEach((node) => node.dispose());
          }
        };

        transport.start('+0.05');
        setIsPlaying(true);
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : 'Playback failed.';
        setError(message);
        stop();
      } finally {
        setIsLoading(false);
      }
    },
    [stop]
  );

  return { isPlaying, isLoading, error, play, stop };
}

type ToneModule = typeof import('tone');

function createSynth(Tone: ToneModule, family: Arrangement['tracks'][number]['family']) {
  if (family === 'percussion') {
    return new Tone.PolySynth(Tone.MembraneSynth, {
      volume: -6,
      envelope: { attack: 0.001, decay: 0.18, sustain: 0.02, release: 0.1 }
    });
  }

  if (family === 'brass') {
    return new Tone.PolySynth(Tone.FMSynth, {
      volume: -11,
      harmonicity: 1.5,
      modulationIndex: 3,
      envelope: { attack: 0.04, decay: 0.2, sustain: 0.48, release: 0.7 }
    });
  }

  if (family === 'strings') {
    return new Tone.PolySynth(Tone.AMSynth, {
      volume: -13,
      harmonicity: 1.2,
      envelope: { attack: 0.08, decay: 0.15, sustain: 0.62, release: 0.8 }
    });
  }

  if (family === 'keys') {
    return new Tone.PolySynth(Tone.Synth, {
      volume: -14,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.004, decay: 0.22, sustain: 0.2, release: 0.18 }
    });
  }

  return new Tone.PolySynth(Tone.Synth, {
    volume: -12,
    oscillator: { type: family === 'woodwinds' ? 'sine' : 'sawtooth' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.42, release: 0.35 }
  });
}

function triggerNote(
  Tone: ToneModule,
  synth: ReturnType<typeof createSynth>,
  note: TrackNote,
  time: number,
  durationSeconds: number
): void {
  if (note.drum === 'hat') {
    synth.triggerAttackRelease('C5', Math.min(0.08, durationSeconds), time, note.velocity * 0.45);
    return;
  }

  if (note.drum === 'snare') {
    synth.triggerAttackRelease('D2', Math.min(0.14, durationSeconds), time, note.velocity * 0.7);
    return;
  }

  if (note.drum === 'kick') {
    synth.triggerAttackRelease('C1', Math.min(0.18, durationSeconds), time, note.velocity);
    return;
  }

  synth.triggerAttackRelease(
    Tone.Frequency(note.midi, 'midi').toNote(),
    Math.max(0.06, durationSeconds),
    time,
    note.velocity
  );
}
