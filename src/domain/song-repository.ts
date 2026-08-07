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
    name: "15分の名声（前半Jまで）",
    bpm: 110,
    tempoUnit: "dotted_quarter",
    loop: { enabled: true, startMeasure: 1, endMeasure: 94 },
    countIn: CountIn.default(),
    sections: [
      Section.create({
        name: "予備拍",
        pattern: [{ numerator: 4, denominator: 4, grouping: [2, 2] }],
        repeatCount: 1,
        rehearsalMark: null,
      }),
      Section.create({
        name: "イントロ",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 10,
        rehearsalMark: null,
      }),
      Section.create({
        name: "Aのはいり",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 2,
        rehearsalMark: "A",
      }),
      Section.create({
        name: "",
        pattern: [{ numerator: 3, denominator: 8, grouping: [3] }],
        repeatCount: 1,
        rehearsalMark: "A",
      }),
      Section.create({
        name: "",
        pattern: [{ numerator: 5, denominator: 8, grouping: [3, 2] }],
        repeatCount: 1,
        rehearsalMark: "A",
      }),
      Section.create({
        name: "9/8に戻ったとこ",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 4,
        rehearsalMark: "A",
      }),
      Section.create({
        name: "Bのはいり",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 8,
        rehearsalMark: "B",
      }),
      Section.create({
        name: "",
        pattern: [
          { numerator: 12, denominator: 8, grouping: [3, 3, 3, 3] },
          { numerator: 4, denominator: 8, grouping: [2, 2] },
        ],
        repeatCount: 6,
        rehearsalMark: "C",
      }),
      Section.create({
        name: "D全体",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 10,
        rehearsalMark: "D",
      }),
      Section.create({
        name: "E全体",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 9,
        rehearsalMark: "E",
      }),
      Section.create({
        name: "Eの4/8まで",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 3, 3] }],
        repeatCount: 11,
        rehearsalMark: "E",
      }),
      Section.create({
        name: "Eの4/8のとこ",
        pattern: [{ numerator: 4, denominator: 8, grouping: [2, 2] }],
        repeatCount: 1,
        rehearsalMark: "E",
      }),
      Section.create({
        name: "Eの9/8のとこ",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 1,
        rehearsalMark: "E",
      }),
      Section.create({
        name: "G入り",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 2,
        rehearsalMark: "G",
      }),
      Section.create({
        name: "Gの変拍子",
        pattern: [
          { numerator: 3, denominator: 8, grouping: [3] },
          { numerator: 5, denominator: 8, grouping: [3, 2] },
        ],
        repeatCount: 1,
        rehearsalMark: "G",
      }),
      Section.create({
        name: "Gの9/8の戻り",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 4,
        rehearsalMark: null,
      }),
      Section.create({
        name: "Gの5/8のとこ",
        pattern: [{ numerator: 5, denominator: 8, grouping: [3, 2] }],
        repeatCount: 1,
        rehearsalMark: null,
      }),
      Section.create({
        name: "H",
        pattern: [
          { numerator: 12, denominator: 8, grouping: [3, 3, 3, 3] },
          { numerator: 4, denominator: 8, grouping: [2, 2] },
        ],
        repeatCount: 6,
        rehearsalMark: "H",
      }),
      Section.create({
        name: "Hの9/8に戻ったとこ",
        pattern: [{ numerator: 9, denominator: 8, grouping: [3, 2, 2, 2] }],
        repeatCount: 2,
        rehearsalMark: "I",
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
