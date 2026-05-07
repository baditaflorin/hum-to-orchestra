import { midiToFrequency } from '../../lib/music';

export const DEMO_MELODY_MIDI = [60, 62, 64, 67, 69, 67, 64, 62, 60, 64, 67, 72];
const DEMO_DURATIONS = [0.45, 0.45, 0.55, 0.7, 0.45, 0.45, 0.55, 0.55, 0.7, 0.45, 0.45, 0.9];

export function createDemoHumBuffer(): AudioBuffer {
  const sampleRate = 44_100;
  const totalSeconds = DEMO_DURATIONS.reduce((sum, duration) => sum + duration + 0.08, 0) + 0.3;
  const context = new OfflineAudioContext(1, Math.ceil(totalSeconds * sampleRate), sampleRate);
  const channel = context.createBuffer(1, context.length, sampleRate);
  const data = channel.getChannelData(0);
  let cursor = Math.floor(0.12 * sampleRate);

  DEMO_MELODY_MIDI.forEach((midi, index) => {
    const duration = DEMO_DURATIONS[index] ?? 0.5;
    const samples = Math.floor(duration * sampleRate);
    const frequency = midiToFrequency(midi);

    for (let sampleIndex = 0; sampleIndex < samples; sampleIndex += 1) {
      const time = sampleIndex / sampleRate;
      const envelope = Math.min(1, sampleIndex / 800, (samples - sampleIndex) / 1200);
      const vibrato = Math.sin(2 * Math.PI * 5.2 * time) * 3.2;
      const sungTone = Math.sin(2 * Math.PI * (frequency + vibrato) * time);
      const breath = Math.sin(2 * Math.PI * frequency * 0.5 * time) * 0.08;
      data[cursor + sampleIndex] = (sungTone * 0.44 + breath) * envelope;
    }

    cursor += samples + Math.floor(0.08 * sampleRate);
  });

  return channel;
}
