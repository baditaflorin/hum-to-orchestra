import { ReactElement } from 'react';
import { PitchFrame, TranscriptionResult } from '../lib/music';

interface PitchTraceProps {
  transcription: TranscriptionResult | null;
}

export function PitchTrace({ transcription }: PitchTraceProps): ReactElement {
  const frames = transcription?.frames.slice(0, 360) ?? [];

  return (
    <section className="panel trace-panel" aria-label="Pitch trace">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transcription</p>
          <h2>
            {transcription ? `${transcription.notes.length} notes detected` : 'No melody loaded'}
          </h2>
        </div>
        {transcription && (
          <div className="score-meta">
            <span>{Math.round(transcription.confidence * 100)}% confidence</span>
            <span>{transcription.durationSeconds.toFixed(1)}s</span>
          </div>
        )}
      </div>

      <div className="pitch-trace">
        {frames.length ? (
          frames.map((frame, index) => <PitchPoint frame={frame} key={`${frame.time}-${index}`} />)
        ) : (
          <span className="trace-placeholder">Pitch contour appears here after analysis.</span>
        )}
      </div>

      {transcription && (
        <div className="detected-notes" aria-label="Detected notes">
          {transcription.notes.map((note) => (
            <span key={note.id}>{note.name}</span>
          ))}
        </div>
      )}
    </section>
  );
}

function PitchPoint({ frame }: { frame: PitchFrame }): ReactElement {
  const normalizedMidi = (frame.midi - 36) / 48;
  return (
    <span
      className="pitch-point"
      style={{
        left: `${Math.min(99, frame.time * 18)}%`,
        bottom: `${Math.max(8, Math.min(88, normalizedMidi * 80))}%`,
        opacity: 0.35 + frame.clarity * 0.6,
        transform: `scale(${0.7 + frame.volume * 4})`
      }}
    />
  );
}
