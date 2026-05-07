import {
  Arrangement,
  ArrangementPresetId,
  ArrangementTrack,
  clamp,
  MelodyNote,
  midiToNoteName,
  pitchClassOf,
  PITCH_CLASS_NAMES,
  quantizeBeat,
  TrackNote,
  TranscriptionResult,
  transposeNote
} from '../../lib/music';
import { getPreset } from './presets';

const COLORS = {
  strings: '#e66b5b',
  brass: '#d2a738',
  woodwinds: '#4e9f8f',
  keys: '#9a78d0',
  synth: '#4f8bea',
  percussion: '#e15a88'
};

export function createArrangement(
  presetId: ArrangementPresetId,
  transcription: TranscriptionResult
): Arrangement {
  const preset = getPreset(presetId);
  const melody = transcription.notes.length ? transcription.notes : fallbackMelody();
  const factories: Record<ArrangementPresetId, () => ArrangementTrack[]> = {
    'string-quartet': () => stringQuartet(melody),
    'brass-ensemble': () => brassEnsemble(melody),
    'baroque-consort': () => baroqueConsort(melody),
    'electronic-four-on-the-floor': () => electronicFourOnTheFloor(melody),
    'full-orchestra': () => fullOrchestra(melody)
  };

  return {
    id: `${presetId}-${Date.now()}`,
    presetId,
    name: preset.name,
    description: preset.description,
    bpm: transcription.bpm,
    key: transcription.key,
    timeSignature: '4/4',
    tracks: factories[presetId](),
    generatedAt: new Date().toISOString()
  };
}

function stringQuartet(melody: MelodyNote[]): ArrangementTrack[] {
  return [
    track('violin-1', 'Violin I', 'strings', 'melody', COLORS.strings, melody.map(toTrackNote)),
    track(
      'violin-2',
      'Violin II',
      'strings',
      'thirds',
      '#f19b73',
      melody.map((note, index) => transposeNote(note, index % 2 === 0 ? -3 : -4, 'vln2'))
    ),
    track('viola', 'Viola', 'strings', 'inner pedal', '#c75f84', padLine(melody, -12, 2)),
    track('cello', 'Cello', 'strings', 'bass roots', '#b3484d', bassLine(melody, -24, 4))
  ];
}

function brassEnsemble(melody: MelodyNote[]): ArrangementTrack[] {
  return [
    track('trumpet', 'Trumpet', 'brass', 'bright lead', COLORS.brass, melody.map(toTrackNote)),
    track('horns', 'Horns', 'brass', 'chorale pads', '#c98d2d', chordPads(melody, -7, 2)),
    track('trombone', 'Trombone', 'brass', 'counterline', '#b77928', counterLine(melody, -12)),
    track('tuba', 'Tuba', 'brass', 'low pulse', '#8f6826', bassLine(melody, -31, 2))
  ];
}

function baroqueConsort(melody: MelodyNote[]): ArrangementTrack[] {
  return [
    track(
      'recorder',
      'Recorder',
      'woodwinds',
      'ornamented line',
      COLORS.woodwinds,
      ornament(melody)
    ),
    track('viol', 'Treble Viol', 'strings', 'imitation', '#62b6a3', delayedLine(melody, 1, -5)),
    track(
      'harpsichord',
      'Harpsichord',
      'keys',
      'continuo chords',
      COLORS.keys,
      arpeggios(melody, -12)
    ),
    track(
      'continuo',
      'Continuo Bass',
      'strings',
      'ground bass',
      '#8969b4',
      bassLine(melody, -24, 2)
    )
  ];
}

function electronicFourOnTheFloor(melody: MelodyNote[]): ArrangementTrack[] {
  const length = melodyLength(melody);
  return [
    track('lead-synth', 'Lead Synth', 'synth', 'melody', COLORS.synth, melody.map(toTrackNote)),
    track('sub-bass', 'Sub Bass', 'synth', 'sidechain bass', '#44b8d5', electronicBass(melody)),
    track('pluck', 'Arp Pluck', 'synth', 'eighth arpeggio', '#8e7af0', arpeggios(melody, 0, 0.5)),
    track(
      'drums',
      'Drum Machine',
      'percussion',
      'four-on-the-floor',
      COLORS.percussion,
      drumPattern(length)
    )
  ];
}

function fullOrchestra(melody: MelodyNote[]): ArrangementTrack[] {
  return [
    track('violins', 'Violins', 'strings', 'melody mass', COLORS.strings, melody.map(toTrackNote)),
    track(
      'woodwinds',
      'Woodwinds',
      'woodwinds',
      'octave color',
      COLORS.woodwinds,
      octaveDoubles(melody)
    ),
    track(
      'violas-cellos',
      'Violas & Cellos',
      'strings',
      'harmonic bed',
      '#c75f84',
      chordPads(melody, -12, 2)
    ),
    track('brass', 'Brass', 'brass', 'hero swells', COLORS.brass, brassSwells(melody)),
    track('basses', 'Basses', 'strings', 'foundation', '#91434d', bassLine(melody, -36, 4)),
    track('timpani', 'Timpani', 'percussion', 'cadence hits', '#c54576', timpaniHits(melody))
  ];
}

function track(
  id: string,
  name: string,
  family: ArrangementTrack['family'],
  role: string,
  color: string,
  notes: TrackNote[]
): ArrangementTrack {
  return { id, name, family, role, color, notes: notes.sort((a, b) => a.start - b.start) };
}

function toTrackNote(note: MelodyNote): TrackNote {
  return { ...note };
}

function padLine(melody: MelodyNote[], semitones: number, everyBeats: number): TrackNote[] {
  return anchors(melody, everyBeats).map((note, index) => ({
    ...transposeNote(note, semitones + (index % 2 === 0 ? 0 : -2), `pad-${index}`),
    start: quantizeBeat(note.start),
    duration: Math.max(everyBeats, quantizeBeat(note.duration + everyBeats)),
    velocity: 0.38
  }));
}

function chordPads(melody: MelodyNote[], semitones: number, everyBeats = 2): TrackNote[] {
  return anchors(melody, everyBeats).flatMap((note, index) => {
    const root = clamp(note.midi + semitones, 36, 78);
    const intervals = index % 2 === 0 ? [0, 4, 7] : [0, 3, 7];
    return intervals.map((interval, chordIndex) =>
      makeNote(note, root + interval, `chord-${index}-${chordIndex}`, everyBeats, 0.34)
    );
  });
}

function bassLine(melody: MelodyNote[], semitones: number, everyBeats: number): TrackNote[] {
  return anchors(melody, everyBeats).map((note, index) => {
    const bassMidi = clamp(note.midi + semitones + (index % 4 === 3 ? -5 : 0), 24, 55);
    return makeNote(note, bassMidi, `bass-${index}`, everyBeats, 0.58);
  });
}

function counterLine(melody: MelodyNote[], semitones: number): TrackNote[] {
  return melody.map((note, index) => {
    const direction = index % 2 === 0 ? 2 : -2;
    return makeNote(
      note,
      note.midi + semitones + direction,
      `counter-${index}`,
      note.duration,
      0.46
    );
  });
}

function ornament(melody: MelodyNote[]): TrackNote[] {
  return melody.flatMap((note, index) => {
    if (note.duration < 0.75 || index % 3 !== 1) return [{ ...note, id: `${note.id}-orn-base` }];
    const first = makeNote(note, note.midi, `orn-${index}-a`, note.duration / 2, 0.66);
    const second = makeNote(
      { ...note, start: note.start + note.duration / 2 },
      note.midi + 2,
      `orn-${index}-b`,
      note.duration / 2,
      0.58
    );
    return [first, second];
  });
}

function delayedLine(melody: MelodyNote[], delayBeats: number, semitones: number): TrackNote[] {
  return melody.slice(0, Math.max(1, melody.length - 1)).map((note, index) => ({
    ...transposeNote(note, semitones, `delay-${index}`),
    start: note.start + delayBeats,
    velocity: 0.38
  }));
}

function arpeggios(melody: MelodyNote[], semitones: number, step = 0.5): TrackNote[] {
  return anchors(melody, 1).flatMap((note, index) => {
    const base = clamp(note.midi + semitones - 12, 36, 76);
    const intervals = [0, 7, 12, 7];
    return intervals.map((interval, intervalIndex) =>
      makeNote(
        { ...note, start: note.start + intervalIndex * step, duration: step },
        base + interval,
        `arp-${index}-${intervalIndex}`,
        step,
        0.32
      )
    );
  });
}

function electronicBass(melody: MelodyNote[]): TrackNote[] {
  return anchors(melody, 1).map((note, index) =>
    makeNote(
      note,
      clamp(note.midi - 24 - (index % 2 === 0 ? 0 : 5), 28, 52),
      `sub-${index}`,
      0.75,
      0.72
    )
  );
}

function octaveDoubles(melody: MelodyNote[]): TrackNote[] {
  return melody.map((note, index) =>
    transposeNote(note, index % 2 === 0 ? 12 : 0, `winds-${index}`)
  );
}

function brassSwells(melody: MelodyNote[]): TrackNote[] {
  return anchors(melody, 4).flatMap((note, index) =>
    [0, 7, 12].map((interval, chordIndex) =>
      makeNote(
        note,
        clamp(note.midi - 12 + interval, 42, 76),
        `swell-${index}-${chordIndex}`,
        3.5,
        0.42
      )
    )
  );
}

function timpaniHits(melody: MelodyNote[]): TrackNote[] {
  return anchors(melody, 4).map((note, index) => ({
    ...makeNote(note, clamp(note.midi - 31, 35, 48), `timpani-${index}`, 0.5, 0.72),
    drum: 'timpani'
  }));
}

function drumPattern(lengthBeats: number): TrackNote[] {
  const notes: TrackNote[] = [];
  const totalBeats = Math.ceil(lengthBeats);

  for (let beat = 0; beat <= totalBeats; beat += 1) {
    notes.push(percussionNote('kick', beat, `kick-${beat}`, 0.25, 0.95));
    if (beat % 2 === 1) notes.push(percussionNote('snare', beat, `snare-${beat}`, 0.25, 0.72));
    notes.push(percussionNote('hat', beat + 0.5, `hat-${beat}`, 0.12, 0.42));
  }

  return notes;
}

function percussionNote(
  drum: NonNullable<TrackNote['drum']>,
  start: number,
  id: string,
  duration: number,
  velocity: number
): TrackNote {
  const midi = drum === 'kick' ? 36 : drum === 'snare' ? 38 : 42;
  return {
    id,
    midi,
    name: drum,
    start,
    duration,
    velocity,
    confidence: 1,
    drum
  };
}

function anchors(melody: MelodyNote[], everyBeats: number): MelodyNote[] {
  const seen = new Set<number>();
  return melody.filter((note) => {
    const bucket = Math.floor(note.start / everyBeats);
    if (seen.has(bucket)) return false;
    seen.add(bucket);
    return true;
  });
}

function makeNote(
  source: MelodyNote,
  midi: number,
  idSuffix: string,
  duration: number,
  velocity: number
): TrackNote {
  const clampedMidi = clamp(Math.round(midi), 24, 96);
  return {
    ...source,
    id: `${source.id}-${idSuffix}`,
    midi: clampedMidi,
    name: midiToNoteName(clampedMidi),
    duration: quantizeBeat(duration),
    velocity
  };
}

function melodyLength(melody: MelodyNote[]): number {
  return Math.max(4, ...melody.map((note) => note.start + note.duration));
}

function fallbackMelody(): MelodyNote[] {
  const midi = [60, 62, 64, 67, 69, 67, 64, 62];
  return midi.map((value, index) => ({
    id: `fallback-${index}`,
    midi: value,
    name: midiToNoteName(value),
    start: index * 0.75,
    duration: 0.65,
    velocity: 0.65,
    confidence: 1
  }));
}

export function summarizeHarmony(notes: MelodyNote[]): string {
  if (!notes.length) return 'No melody yet';
  const pitchClasses = [
    ...new Set(notes.map((note) => PITCH_CLASS_NAMES[pitchClassOf(note.midi)]))
  ];
  return pitchClasses.slice(0, 6).join(', ');
}
