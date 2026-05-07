import { describe, expect, it } from 'vitest';
import { midiToFrequency } from '../../lib/music';
import { transcribeAudioBuffer } from './transcription';

describe('transcribeAudioBuffer', () => {
  it('extracts stable notes from a hummed sine melody', () => {
    const buffer = makeTestAudioBuffer([60, 64, 67]);
    const result = transcribeAudioBuffer(buffer, {
      bpm: 100,
      clarityThreshold: 0.82,
      minNoteDurationSeconds: 0.08
    });

    expect(result.notes.length).toBeGreaterThanOrEqual(3);
    expect(result.notes.slice(0, 3).map((note) => note.name)).toEqual(['C4', 'E4', 'G4']);
    expect(result.confidence).toBeGreaterThan(0.85);
  });
});

function makeTestAudioBuffer(midiNotes: number[]): AudioBuffer {
  const sampleRate = 44_100;
  const noteSeconds = 0.42;
  const silenceSeconds = 0.08;
  const totalSamples = Math.ceil(midiNotes.length * (noteSeconds + silenceSeconds) * sampleRate);
  const samples = new Float32Array(totalSamples);
  let cursor = 0;

  for (const midi of midiNotes) {
    const frequency = midiToFrequency(midi);
    const noteSamples = Math.floor(noteSeconds * sampleRate);
    for (let index = 0; index < noteSamples; index += 1) {
      const envelope = Math.min(1, index / 800, (noteSamples - index) / 800);
      samples[cursor + index] =
        Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 0.5 * envelope;
    }
    cursor += noteSamples + Math.floor(silenceSeconds * sampleRate);
  }

  return {
    length: samples.length,
    numberOfChannels: 1,
    sampleRate,
    duration: samples.length / sampleRate,
    getChannelData: () => samples
  } as unknown as AudioBuffer;
}
