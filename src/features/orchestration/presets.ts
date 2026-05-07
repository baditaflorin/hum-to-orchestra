import { ArrangementPreset } from '../../lib/music';

export const ARRANGEMENT_PRESETS: ArrangementPreset[] = [
  {
    id: 'string-quartet',
    name: 'String Quartet',
    shortName: 'Quartet',
    description: 'Violin-led melody, inner counterline, viola warmth, and cello roots.'
  },
  {
    id: 'brass-ensemble',
    name: 'Brass Ensemble',
    shortName: 'Brass',
    description: 'Trumpet melody, horn pads, trombone support, and tuba punctuation.'
  },
  {
    id: 'baroque-consort',
    name: 'Baroque Consort',
    shortName: 'Baroque',
    description: 'Recorder-style doubling, continuo bass, clipped chords, and light imitation.'
  },
  {
    id: 'electronic-four-on-the-floor',
    name: 'Electronic Four-on-the-Floor',
    shortName: 'Electronic',
    description: 'Lead synth, side-stepped bass, kick on every beat, backbeat, and hats.'
  },
  {
    id: 'full-orchestra',
    name: 'Full Orchestra',
    shortName: 'Orchestra',
    description:
      'Strings carry the line while winds, brass, basses, and percussion widen the sketch.'
  }
];

export function getPreset(id: string): ArrangementPreset {
  return ARRANGEMENT_PRESETS.find((preset) => preset.id === id) ?? ARRANGEMENT_PRESETS[0];
}
