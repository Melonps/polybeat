import * as z from "zod";
import type { Denominator } from "./denominator";

/** The note value that a song's BPM is measured against. */
const TempoUnitSchema = z.enum([
  "sixteenth",
  "eighth",
  "dotted_eighth",
  "quarter",
  "dotted_quarter",
  "half",
  "dotted_half",
]);
export type TempoUnit = z.infer<typeof TempoUnitSchema>;

const LABELS: Readonly<Record<TempoUnit, string>> = {
  sixteenth: "♬",
  eighth: "♪",
  dotted_eighth: "♪.",
  quarter: "♩",
  dotted_quarter: "♩.",
  half: "𝅗𝅥",
  dotted_half: "𝅗𝅥.",
};

const ORDER: readonly TempoUnit[] = [
  "sixteenth",
  "eighth",
  "dotted_eighth",
  "quarter",
  "dotted_quarter",
  "half",
  "dotted_half",
];

/** How many quarter notes each tempo unit is worth, used to convert BPM into click intervals. */
const QUARTER_EQUIVALENT: Readonly<Record<TempoUnit, number>> = {
  sixteenth: 0.25,
  eighth: 0.5,
  dotted_eighth: 0.75,
  quarter: 1,
  dotted_quarter: 1.5,
  half: 2,
  dotted_half: 3,
};

export const TempoUnit = {
  schema: TempoUnitSchema,
  label: (unit: TempoUnit) => LABELS[unit],
  order: ORDER,
  /** Duration, in seconds, of a single click (one denominator-note) at the given tempo. */
  secondsPerClick: (bpm: number, unit: TempoUnit, denominator: Denominator): number => {
    const clicksPerBeat = (QUARTER_EQUIVALENT[unit] * denominator) / 4;
    return 60 / bpm / clicksPerBeat;
  },
} as const;
