import { Arrangement, ArrangementTrack, noteToStepAlterOctave, TrackNote } from '../../lib/music';

const DIVISIONS = 4;
const MEASURE_BEATS = 4;

export function arrangementToMusicXml(arrangement: Arrangement): string {
  const appVersion = typeof __APP_VERSION__ === 'undefined' ? '0.1.0' : __APP_VERSION__;
  const partList = arrangement.tracks
    .map(
      (track) => `
      <score-part id="${escapeXml(track.id)}">
        <part-name>${escapeXml(track.name)}</part-name>
      </score-part>`
    )
    .join('');

  const parts = arrangement.tracks.map((track) => trackToMusicXml(track)).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXml(arrangement.name)}</work-title>
  </work>
  <identification>
    <creator type="software">Hum-to-Orchestra</creator>
    <encoding>
      <software>Hum-to-Orchestra ${escapeXml(appVersion)}</software>
      <encoding-date>${new Date().toISOString().slice(0, 10)}</encoding-date>
    </encoding>
  </identification>
  <part-list>${partList}
  </part-list>
  ${parts}
</score-partwise>`;
}

function trackToMusicXml(track: ArrangementTrack): string {
  const measures = splitIntoMeasures(track.notes.filter((note) => !note.drum));
  const measureXml = measures
    .map((notes, index) => {
      const attributes =
        index === 0
          ? `
      <attributes>
        <divisions>${DIVISIONS}</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>${track.family === 'brass' || track.name.includes('Bass') || track.name.includes('Cello') ? 'F' : 'G'}</sign><line>${track.family === 'brass' || track.name.includes('Bass') || track.name.includes('Cello') ? '4' : '2'}</line></clef>
      </attributes>`
          : '';

      return `
    <measure number="${index + 1}">${attributes}
      ${notes.map(noteToXml).join('\n      ')}
    </measure>`;
    })
    .join('');

  return `
  <part id="${escapeXml(track.id)}">${measureXml}
  </part>`;
}

function splitIntoMeasures(notes: TrackNote[]): TrackNote[][] {
  const measureCount = Math.max(
    1,
    Math.ceil(Math.max(4, ...notes.map((note) => note.start + note.duration)) / MEASURE_BEATS)
  );
  return Array.from({ length: measureCount }, (_, measureIndex) =>
    notes
      .filter((note) => Math.floor(note.start / MEASURE_BEATS) === measureIndex)
      .map((note) => ({
        ...note,
        start: note.start - measureIndex * MEASURE_BEATS
      }))
  );
}

function noteToXml(note: TrackNote): string {
  const { step, alter, octave } = noteToStepAlterOctave(note.midi);
  const duration = Math.max(1, Math.round(note.duration * DIVISIONS));
  const type =
    duration >= 16
      ? 'whole'
      : duration >= 8
        ? 'half'
        : duration >= 4
          ? 'quarter'
          : duration >= 2
            ? 'eighth'
            : '16th';

  return `<note>
        <pitch>
          <step>${step}</step>${alter ? `\n          <alter>${alter}</alter>` : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>${duration}</duration>
        <type>${type}</type>
      </note>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
