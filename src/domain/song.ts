import * as z from "zod";
import { CountIn } from "./count-in";
import { Loop } from "./loop";
import { Section } from "./section";
import { SongId } from "./song-id";
import { TempoUnit } from "./tempo-unit";

/** A saved practice song: a tempo plus a sequence of time-signature sections. */
const SongSchema = z.object({
  id: SongId.schema,
  name: z.string().min(1),
  bpm: z.number().min(30).max(280),
  // Songs saved before `tempoUnit` existed default to "quarter" at the parse boundary.
  tempoUnit: TempoUnit.schema.default("quarter"),
  sections: z.array(Section.schema),
  loop: Loop.schema,
  // Songs saved before `countIn` existed default to disabled at the parse boundary.
  countIn: CountIn.schema.default(CountIn.default()),
});
export type Song = z.infer<typeof SongSchema>;

export const Song = {
  schema: SongSchema,
  totalMeasures: (song: Song) =>
    song.sections.reduce((sum, section) => sum + section.measureCount, 0),
} as const;
