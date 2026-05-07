import { ReactElement } from 'react';
import { Arrangement, arrangementLengthBeats, formatBeatDuration } from '../lib/music';

interface ScorePreviewProps {
  arrangement: Arrangement | null;
}

export function ScorePreview({ arrangement }: ScorePreviewProps): ReactElement {
  if (!arrangement) {
    return (
      <section className="panel empty-panel" aria-label="Score preview">
        <div>
          <p className="eyebrow">Score</p>
          <h2>Record or load a hum to orchestrate it.</h2>
        </div>
      </section>
    );
  }

  const length = arrangementLengthBeats(arrangement);

  return (
    <section className="panel score-panel" aria-label="Score preview">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Score</p>
          <h2>{arrangement.name}</h2>
        </div>
        <div className="score-meta">
          <span>{arrangement.key}</span>
          <span>{arrangement.bpm} BPM</span>
          <span>{formatBeatDuration(length)}</span>
        </div>
      </div>

      <div className="score-grid" style={{ ['--score-length' as string]: length }}>
        {arrangement.tracks.map((track) => (
          <div className="score-row" key={track.id}>
            <div className="track-label">
              <span className="track-dot" style={{ backgroundColor: track.color }} />
              <span>{track.name}</span>
              <small>{track.role}</small>
            </div>
            <div className="note-lane">
              <div className="staff-lines" />
              {track.notes.map((note) => (
                <span
                  className={`note-pill ${note.drum ? 'drum' : ''}`}
                  key={note.id}
                  title={`${track.name}: ${note.name}`}
                  style={{
                    left: `${(note.start / length) * 100}%`,
                    width: `${Math.max(1.3, (note.duration / length) * 100)}%`,
                    backgroundColor: track.color,
                    top: `${note.drum ? 42 : 12 + (1 - (note.midi - 36) / 60) * 46}%`
                  }}
                >
                  <span>{note.name}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
