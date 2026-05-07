import { PitchDetector } from 'pitchy';
import {
  clamp,
  frequencyToMidi,
  MelodyNote,
  midiToNoteName,
  PitchFrame,
  pitchClassOf,
  PITCH_CLASS_NAMES,
  quantizeBeat,
  TranscriptionResult
} from '../../lib/music';

export interface TranscriptionOptions {
  frameSize?: number;
  hopSize?: number;
  clarityThreshold?: number;
  minFrequency?: number;
  maxFrequency?: number;
  minNoteDurationSeconds?: number;
  bpm?: number;
}

interface RawSegment {
  midi: number;
  startSeconds: number;
  endSeconds: number;
  confidence: number;
  volume: number;
}

const DEFAULT_OPTIONS: Required<TranscriptionOptions> = {
  frameSize: 2048,
  hopSize: 512,
  clarityThreshold: 0.86,
  minFrequency: 72,
  maxFrequency: 1120,
  minNoteDurationSeconds: 0.09,
  bpm: 104
};

export function transcribeAudioBuffer(
  audioBuffer: AudioBuffer,
  options: TranscriptionOptions = {}
): TranscriptionResult {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const mono = downmix(audioBuffer);
  const frames = extractPitchFrames(mono, audioBuffer.sampleRate, resolved);
  const segments = segmentFrames(frames, resolved);
  const notes = segmentsToNotes(segments, resolved.bpm);
  const confidence = frames.length
    ? frames.reduce((sum, frame) => sum + frame.clarity, 0) / frames.length
    : 0;

  return {
    notes,
    frames,
    bpm: resolved.bpm,
    key: estimateKey(notes),
    confidence: Number(confidence.toFixed(2)),
    durationSeconds: audioBuffer.duration
  };
}

function downmix(audioBuffer: AudioBuffer): Float32Array {
  const output = new Float32Array(audioBuffer.length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      output[index] += data[index] / audioBuffer.numberOfChannels;
    }
  }

  return output;
}

function extractPitchFrames(
  samples: Float32Array,
  sampleRate: number,
  options: Required<TranscriptionOptions>
): PitchFrame[] {
  const detector = PitchDetector.forFloat32Array(options.frameSize);
  detector.clarityThreshold = options.clarityThreshold;
  detector.minVolumeDecibels = -48;

  const frames: PitchFrame[] = [];
  const frame = new Float32Array(options.frameSize);

  for (let offset = 0; offset + options.frameSize < samples.length; offset += options.hopSize) {
    frame.set(samples.subarray(offset, offset + options.frameSize));
    const [frequency, clarity] = detector.findPitch(frame, sampleRate);
    const volume = rootMeanSquare(frame);

    if (
      clarity >= options.clarityThreshold &&
      frequency >= options.minFrequency &&
      frequency <= options.maxFrequency
    ) {
      frames.push({
        time: offset / sampleRate,
        frequency,
        midi: frequencyToMidi(frequency),
        clarity,
        volume
      });
    }
  }

  return medianSmooth(frames);
}

function rootMeanSquare(frame: Float32Array): number {
  let sum = 0;
  for (const sample of frame) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / frame.length);
}

function medianSmooth(frames: PitchFrame[]): PitchFrame[] {
  return frames.map((frame, index) => {
    const window = frames
      .slice(Math.max(0, index - 1), Math.min(frames.length, index + 2))
      .map((candidate) => candidate.midi)
      .sort((a, b) => a - b);
    const midi = window[Math.floor(window.length / 2)] ?? frame.midi;
    return { ...frame, midi, frequency: frame.frequency };
  });
}

function segmentFrames(
  frames: PitchFrame[],
  options: Required<TranscriptionOptions>
): RawSegment[] {
  if (!frames.length) return [];

  const hopDurationSeconds = frames[1] ? frames[1].time - frames[0].time : 0.012;
  const maxGapSeconds = hopDurationSeconds * 4;
  const segments: RawSegment[] = [];
  let active = startSegment(frames[0], hopDurationSeconds);

  for (const frame of frames.slice(1)) {
    const samePitch = Math.abs(frame.midi - active.midi) <= 1;
    const closeEnough = frame.time - active.endSeconds <= maxGapSeconds;

    if (samePitch && closeEnough) {
      active.endSeconds = frame.time + hopDurationSeconds;
      active.confidence = Math.max(active.confidence, frame.clarity);
      active.volume = Math.max(active.volume, frame.volume);
      active.midi = Math.round((active.midi + frame.midi) / 2);
      continue;
    }

    pushIfLongEnough(segments, active, options.minNoteDurationSeconds);
    active = startSegment(frame, hopDurationSeconds);
  }

  pushIfLongEnough(segments, active, options.minNoteDurationSeconds);
  return mergeAdjacentSegments(segments);
}

function startSegment(frame: PitchFrame, hopDurationSeconds: number): RawSegment {
  return {
    midi: frame.midi,
    startSeconds: frame.time,
    endSeconds: frame.time + hopDurationSeconds,
    confidence: frame.clarity,
    volume: frame.volume
  };
}

function pushIfLongEnough(
  segments: RawSegment[],
  segment: RawSegment,
  minNoteDurationSeconds: number
): void {
  if (segment.endSeconds - segment.startSeconds >= minNoteDurationSeconds) {
    segments.push(segment);
  }
}

function mergeAdjacentSegments(segments: RawSegment[]): RawSegment[] {
  const merged: RawSegment[] = [];

  for (const segment of segments) {
    const previous = merged.at(-1);
    if (
      previous &&
      previous.midi === segment.midi &&
      segment.startSeconds - previous.endSeconds < 0.12
    ) {
      previous.endSeconds = segment.endSeconds;
      previous.confidence = Math.max(previous.confidence, segment.confidence);
      previous.volume = Math.max(previous.volume, segment.volume);
      continue;
    }

    merged.push({ ...segment });
  }

  return merged;
}

function segmentsToNotes(segments: RawSegment[], bpm: number): MelodyNote[] {
  if (!segments.length) return [];

  const firstStart = segments[0].startSeconds;
  const beatsPerSecond = bpm / 60;

  return segments.map((segment, index) => {
    const start = quantizeBeat((segment.startSeconds - firstStart) * beatsPerSecond);
    const duration = quantizeBeat((segment.endSeconds - segment.startSeconds) * beatsPerSecond);
    const midi = clamp(segment.midi, 36, 84);

    return {
      id: `melody-${index + 1}`,
      midi,
      name: midiToNoteName(midi),
      start,
      duration,
      velocity: clamp(0.35 + segment.volume * 2.2, 0.35, 0.95),
      confidence: Number(segment.confidence.toFixed(2))
    };
  });
}

function estimateKey(notes: MelodyNote[]): string {
  if (!notes.length) return 'C';

  const counts = Array.from({ length: 12 }, () => 0);
  for (const note of notes) {
    counts[pitchClassOf(note.midi)] += Math.max(0.25, note.duration);
  }

  const bestPitchClass = counts.indexOf(Math.max(...counts));
  return PITCH_CLASS_NAMES[bestPitchClass] ?? 'C';
}
