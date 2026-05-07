import { describe, expect, it } from 'vitest';
import { TranscriptionResult } from '../../lib/music';
import { arrangementToMusicXml } from '../export/musicxml';
import { createArrangement } from './orchestrator';
import { ARRANGEMENT_PRESETS } from './presets';

const transcription: TranscriptionResult = {
  bpm: 108,
  key: 'C',
  confidence: 0.94,
  durationSeconds: 4,
  frames: [],
  notes: [
    { id: 'n1', midi: 60, name: 'C4', start: 0, duration: 1, velocity: 0.7, confidence: 0.95 },
    { id: 'n2', midi: 64, name: 'E4', start: 1, duration: 1, velocity: 0.7, confidence: 0.95 },
    { id: 'n3', midi: 67, name: 'G4', start: 2, duration: 1, velocity: 0.7, confidence: 0.95 },
    { id: 'n4', midi: 72, name: 'C5', start: 3, duration: 1, velocity: 0.7, confidence: 0.95 }
  ]
};

describe('createArrangement', () => {
  it('creates every requested orchestration style', () => {
    for (const preset of ARRANGEMENT_PRESETS) {
      const arrangement = createArrangement(preset.id, transcription);
      expect(arrangement.tracks.length).toBeGreaterThanOrEqual(4);
      expect(arrangement.tracks.every((track) => track.notes.length > 0)).toBe(true);
    }
  });

  it('exports MusicXML for notation and Music21-compatible workflows', () => {
    const arrangement = createArrangement('string-quartet', transcription);
    const xml = arrangementToMusicXml(arrangement);

    expect(xml).toContain('<score-partwise version="3.1">');
    expect(xml).toContain('<part-name>Violin I</part-name>');
    expect(xml).toContain('<step>C</step>');
  });
});
