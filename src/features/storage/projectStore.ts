import { openDB } from 'idb';
import { z } from 'zod';
import { Arrangement, TranscriptionResult } from '../../lib/music';

const DB_NAME = 'hum-to-orchestra';
const STORE_NAME = 'projects';
const LAST_PROJECT_KEY = 'last-project';

const projectSnapshotSchema = z.object({
  transcription: z.custom<TranscriptionResult>(),
  arrangement: z.custom<Arrangement>(),
  savedAt: z.string()
});

export type ProjectSnapshot = z.infer<typeof projectSnapshotSchema>;

async function database() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    }
  });
}

export async function saveLastProject(snapshot: Omit<ProjectSnapshot, 'savedAt'>): Promise<void> {
  const db = await database();
  await db.put(
    STORE_NAME,
    projectSnapshotSchema.parse({
      ...snapshot,
      savedAt: new Date().toISOString()
    }),
    LAST_PROJECT_KEY
  );
}

export async function loadLastProject(): Promise<ProjectSnapshot | null> {
  const db = await database();
  const snapshot = await db.get(STORE_NAME, LAST_PROJECT_KEY);
  const parsed = projectSnapshotSchema.safeParse(snapshot);
  return parsed.success ? parsed.data : null;
}
