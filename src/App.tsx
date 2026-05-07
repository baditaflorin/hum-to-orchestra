import {
  BadgeDollarSign,
  Download,
  GitFork,
  Mic,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Upload
} from 'lucide-react';
import { ChangeEvent, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { createDemoHumBuffer } from './features/audio/demo';
import { transcribeAudioBuffer } from './features/audio/transcription';
import { arrangementToMusicXml } from './features/export/musicxml';
import { createArrangement, summarizeHarmony } from './features/orchestration/orchestrator';
import { ARRANGEMENT_PRESETS } from './features/orchestration/presets';
import { useTonePlayback } from './features/playback/useTonePlayback';
import { loadLastProject, saveLastProject } from './features/storage/projectStore';
import { buildInfo } from './lib/buildInfo';
import { fetchLiveMainCommit, LiveCommit } from './lib/github';
import { Arrangement, ArrangementPresetId, TranscriptionResult } from './lib/music';
import { PitchTrace } from './components/PitchTrace';
import { ScorePreview } from './components/ScorePreview';

const DEFAULT_PRESET: ArrangementPresetId = 'string-quartet';

export function App(): ReactElement {
  const [presetId, setPresetId] = useState<ArrangementPresetId>(DEFAULT_PRESET);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLabel, setAudioLabel] = useState('No take loaded');
  const [message, setMessage] = useState<string | null>(null);
  const [liveCommit, setLiveCommit] = useState<LiveCommit | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const playback = useTonePlayback();

  const activePreset = useMemo(
    () => ARRANGEMENT_PRESETS.find((preset) => preset.id === presetId) ?? ARRANGEMENT_PRESETS[0],
    [presetId]
  );
  const arrangement = useMemo<Arrangement | null>(
    () => (transcription ? createArrangement(presetId, transcription) : null),
    [presetId, transcription]
  );

  useEffect(() => {
    loadLastProject()
      .then((snapshot) => {
        if (!snapshot) return;
        setTranscription(snapshot.transcription);
        setPresetId(snapshot.arrangement.presetId);
        setAudioLabel(`Restored take from ${new Date(snapshot.savedAt).toLocaleString()}`);
      })
      .catch(() => {
        setMessage('Local restore failed. You can still record a new take.');
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLiveMainCommit(controller.signal)
      .then(setLiveCommit)
      .catch(() => setLiveCommit(null));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!transcription || !arrangement) return;
    saveLastProject({ transcription, arrangement }).catch(() => {
      setMessage('Arrangement made, but local autosave failed.');
    });
  }, [arrangement, transcription]);

  async function startRecording(): Promise<void> {
    setMessage(null);
    playback.stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((track) => track.stop());
        void analyzeBlob(new Blob(chunksRef.current, { type: 'audio/webm' }), 'Recorded hum');
      });

      recorder.start();
      setIsRecording(true);
      setAudioLabel('Recording...');
    } catch {
      setMessage('Microphone access was not available. Try the demo hum or import an audio file.');
    }
  }

  function stopRecording(): void {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    await analyzeBlob(file, file.name);
  }

  async function loadDemo(): Promise<void> {
    setMessage(null);
    playback.stop();
    setIsAnalyzing(true);
    setAudioLabel('Demo hum');

    try {
      analyzeBuffer(createDemoHumBuffer(), 'Demo hum');
    } catch {
      setMessage('Demo audio could not be generated in this browser.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function analyzeBlob(blob: Blob, label: string): Promise<void> {
    setMessage(null);
    playback.stop();
    setIsAnalyzing(true);
    setAudioLabel(label);

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const context = new AudioContext();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      analyzeBuffer(audioBuffer, label);
      await context.close();
    } catch {
      setMessage('That audio could not be decoded. WAV, MP3, M4A, WebM, and OGG usually work.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function analyzeBuffer(audioBuffer: AudioBuffer, label: string): void {
    const nextTranscription = transcribeAudioBuffer(audioBuffer);

    if (nextTranscription.notes.length === 0) {
      setMessage('No stable melody was detected. Try a slightly longer, clearer hum.');
      return;
    }

    setTranscription(nextTranscription);
    setAudioLabel(label);
  }

  async function playArrangement(): Promise<void> {
    if (!arrangement) return;
    await playback.play(arrangement);
  }

  function reset(): void {
    playback.stop();
    setTranscription(null);
    setAudioLabel('No take loaded');
    setMessage(null);
  }

  function downloadMusicXml(): void {
    if (!arrangement) return;
    downloadText(
      `${arrangement.presetId}.musicxml`,
      arrangementToMusicXml(arrangement),
      'application/vnd.recordare.musicxml+xml'
    );
  }

  function downloadJson(): void {
    if (!arrangement || !transcription) return;
    downloadText(
      `${arrangement.presetId}.json`,
      JSON.stringify({ transcription, arrangement }, null, 2),
      'application/json'
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Music2 aria-hidden="true" />
          <div>
            <h1>Hum-to-Orchestra</h1>
            <p>
              v{buildInfo.version} · commit {liveCommit?.shortSha ?? buildInfo.buildCommit}
            </p>
          </div>
        </div>
        <nav aria-label="Project links">
          <a className="icon-link" href={buildInfo.repositoryUrl} rel="noreferrer" target="_blank">
            <GitFork aria-hidden="true" />
            <span>Star on GitHub</span>
          </a>
          <a
            className="icon-link support"
            href={buildInfo.paypalUrl}
            rel="noreferrer"
            target="_blank"
          >
            <BadgeDollarSign aria-hidden="true" />
            <span>Support</span>
          </a>
        </nav>
      </header>

      <section className="workspace">
        <aside className="panel control-panel" aria-label="Recording and arrangement controls">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Input</p>
              <h2>{audioLabel}</h2>
            </div>
          </div>

          <div className="button-grid">
            {!isRecording ? (
              <button className="primary-action" onClick={startRecording} type="button">
                <Mic aria-hidden="true" />
                Record Hum
              </button>
            ) : (
              <button className="danger-action" onClick={stopRecording} type="button">
                <Pause aria-hidden="true" />
                Stop
              </button>
            )}
            <label className="secondary-action">
              <Upload aria-hidden="true" />
              Import Audio
              <input accept="audio/*" onChange={handleFile} type="file" />
            </label>
            <button className="secondary-action" onClick={loadDemo} type="button">
              <Play aria-hidden="true" />
              Demo Hum
            </button>
            <button className="secondary-action" onClick={reset} type="button">
              <RotateCcw aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="preset-list" role="radiogroup" aria-label="Arrangement style">
            <p className="eyebrow">Arrangement</p>
            {ARRANGEMENT_PRESETS.map((preset) => (
              <button
                aria-checked={preset.id === presetId}
                className="preset-option"
                key={preset.id}
                onClick={() => setPresetId(preset.id)}
                role="radio"
                type="button"
              >
                <span>{preset.shortName}</span>
                <small>{preset.description}</small>
              </button>
            ))}
          </div>

          <div className="transport">
            <button
              className="primary-action"
              disabled={!arrangement || isAnalyzing || playback.isLoading}
              onClick={playback.isPlaying ? playback.stop : playArrangement}
              type="button"
            >
              {playback.isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {playback.isPlaying
                ? 'Stop Playback'
                : playback.isLoading
                  ? 'Loading Tone.js'
                  : 'Play'}
            </button>
            <button
              className="secondary-action"
              disabled={!arrangement}
              onClick={downloadMusicXml}
              type="button"
            >
              <Download aria-hidden="true" />
              MusicXML
            </button>
            <button
              className="secondary-action"
              disabled={!arrangement}
              onClick={downloadJson}
              type="button"
            >
              <Download aria-hidden="true" />
              JSON
            </button>
          </div>

          <div className="status-card" aria-live="polite">
            <span>{isAnalyzing ? 'Analyzing pitch contour...' : activePreset.name}</span>
            <p>
              {transcription
                ? `${transcription.notes.length} notes · key center ${transcription.key} · pitch classes ${summarizeHarmony(transcription.notes)}`
                : 'Hum, import, or load the demo to create the first score.'}
            </p>
          </div>

          {(message || playback.error) && <p className="toast">{message ?? playback.error}</p>}

          <div className="build-card">
            <span>Live commit</span>
            {liveCommit ? (
              <a href={liveCommit.url} rel="noreferrer" target="_blank">
                {liveCommit.shortSha}
              </a>
            ) : (
              <span>offline</span>
            )}
          </div>
        </aside>

        <div className="main-stage">
          <PitchTrace transcription={transcription} />
          <ScorePreview arrangement={arrangement} />
        </div>
      </section>
    </main>
  );
}

function downloadText(filename: string, body: string, type: string): void {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
