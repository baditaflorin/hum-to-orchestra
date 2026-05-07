export const PITCH_CLASS_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const STEP_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export interface MelodyNote {
  id: string;
  midi: number;
  name: string;
  start: number;
  duration: number;
  velocity: number;
  confidence: number;
}

export interface TrackNote extends MelodyNote {
  drum?: 'kick' | 'snare' | 'hat' | 'clap' | 'timpani';
}

export interface PitchFrame {
  time: number;
  frequency: number;
  midi: number;
  clarity: number;
  volume: number;
}

export interface TranscriptionResult {
  notes: MelodyNote[];
  frames: PitchFrame[];
  bpm: number;
  key: string;
  confidence: number;
  durationSeconds: number;
}

export type TrackFamily = 'strings' | 'brass' | 'woodwinds' | 'keys' | 'synth' | 'percussion';

export interface ArrangementTrack {
  id: string;
  name: string;
  family: TrackFamily;
  color: string;
  role: string;
  notes: TrackNote[];
}

export interface Arrangement {
  id: string;
  presetId: ArrangementPresetId;
  name: string;
  description: string;
  bpm: number;
  key: string;
  timeSignature: '4/4';
  tracks: ArrangementTrack[];
  generatedAt: string;
}

export type ArrangementPresetId =
  | 'string-quartet'
  | 'brass-ensemble'
  | 'baroque-consort'
  | 'electronic-four-on-the-floor'
  | 'full-orchestra';

export interface ArrangementPreset {
  id: ArrangementPresetId;
  name: string;
  shortName: string;
  description: string;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function midiToNoteName(midi: number): string {
  const pitchClass = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${PITCH_CLASS_NAMES[pitchClass]}${octave}`;
}

export function pitchClassOf(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function quantizeBeat(value: number, grid = 0.25): number {
  return Math.max(grid, Math.round(value / grid) * grid);
}

export function transposeNote(note: MelodyNote, semitones: number, idSuffix: string): TrackNote {
  const midi = clamp(note.midi + semitones, 24, 96);
  return {
    ...note,
    id: `${note.id}-${idSuffix}`,
    midi,
    name: midiToNoteName(midi),
    velocity: clamp(note.velocity, 0.18, 1)
  };
}

export function arrangementLengthBeats(arrangement: Arrangement): number {
  return Math.max(
    4,
    ...arrangement.tracks.flatMap((track) =>
      track.notes.map((note) => note.start + Math.max(note.duration, 0.25))
    )
  );
}

export function formatBeatDuration(beats: number): string {
  if (beats >= 4) return `${beats / 4} bar${beats === 4 ? '' : 's'}`;
  if (beats >= 1) return `${beats} beat${beats === 1 ? '' : 's'}`;
  return `${beats * 4} sixteenth${beats === 0.25 ? '' : 's'}`;
}

export function noteToStepAlterOctave(midi: number): {
  step: string;
  alter: number;
  octave: number;
} {
  const name = midiToNoteName(midi);
  const step = name[0] ?? 'C';
  const alter = name.includes('#') ? 1 : 0;
  const octave = Number.parseInt(name.slice(alter ? 2 : 1), 10);
  return { step, alter, octave };
}
