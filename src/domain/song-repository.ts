import * as z from "zod";
import { CountIn } from "./count-in";
import { Section } from "./section";
import { Song } from "./song";
import { SongId } from "./song-id";

const STORAGE_KEY = "polybeat.songs.v1";

/**
 * The persisted representation is validated at the localStorage boundary with
 * `safeParse`; nothing past this file trusts unvalidated data.
 */
const SongListSchema = z.array(Song.schema);

function createSampleSong(): Song {
  return {
    id: SongId.generate(),
    name: "Odd Meter Etude",
    bpm: 120,
    tempoUnit: "quarter",
    loop: { enabled: false, startMeasure: 1, endMeasure: 12 },
    countIn: CountIn.default(),
    sections: [
      Section.create({
        name: "Intro",
        numerator: 9,
        denominator: 8,
        grouping: [2, 2, 2, 3],
        measureCount: 4,
        rehearsalMark: "A",
      }),
      Section.create({
        name: "Bridge",
        numerator: 3,
        denominator: 8,
        grouping: [3],
        measureCount: 4,
        rehearsalMark: "B",
      }),
      Section.create({
        name: "Verse",
        numerator: 5,
        denominator: 8,
        grouping: [3, 2],
        measureCount: 4,
        rehearsalMark: "C",
      }),
    ],
  };
}

function createBlankSong(name = "New Song"): Song {
  return {
    id: SongId.generate(),
    name,
    bpm: 120,
    tempoUnit: "quarter",
    loop: { enabled: false, startMeasure: 1, endMeasure: 4 },
    countIn: CountIn.default(),
    sections: [Section.create()],
  };
}

/** Loads the saved song list, seeding the sample song on first run or on parse failure. */
function load(): Song[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return seedSample();
  }

  const result = SongListSchema.safeParse(safeJsonParse(raw));
  if (!result.success || result.data.length === 0) {
    return seedSample();
  }

  return result.data;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function seedSample(): Song[] {
  const sample = createSampleSong();
  save([sample]);
  return [sample];
}

function save(songs: readonly Song[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export const SongRepository = {
  load,
  save,
  createSampleSong,
  createBlankSong,
} as const;
