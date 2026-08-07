import * as z from "zod";
import type { ClickAccent } from "./click-accent";

/** How a measure's beats are split into accent groups, e.g. [3, 2, 2] for 7/8 grouped 3+2+2. */
const GroupingSchema = z.array(z.number().int().positive()).min(1);
export type Grouping = z.infer<typeof GroupingSchema>;

/**
 * Produces a conventional accent grouping for a given numerator, preferring groups of
 * three followed by groups of two (e.g. 7 -> [3, 2, 2], 5 -> [3, 2], 9 -> [3, 3, 3]).
 */
function defaultGrouping(numerator: number): Grouping {
  if (numerator <= 0) {
    return [numerator];
  }

  if (numerator % 3 === 0 && numerator / 3 <= 4) {
    return new Array(numerator / 3).fill(3);
  }

  const groups: number[] = [];
  let remaining = numerator;

  if (remaining % 2 !== 0) {
    groups.push(3);
    remaining -= 3;
  }

  while (remaining > 0) {
    groups.push(2);
    remaining -= 2;
  }

  return groups;
}

/**
 * Returns the accent type for every click within a measure. The first click of the measure
 * is always the downbeat; the first click of every subsequent group is a subaccent; every
 * other click is a weak beat.
 */
function computeAccents(grouping: readonly number[]): ClickAccent[] {
  const total = Grouping.sum(grouping);
  const accents: ClickAccent[] = new Array(total).fill("weak");

  let position = 0;
  grouping.forEach((size, groupIndex) => {
    accents[position] = groupIndex === 0 ? "downbeat" : "subaccent";
    position += size;
  });

  return accents;
}

export const Grouping = {
  schema: GroupingSchema,
  sum: (grouping: readonly number[]) => grouping.reduce((total, size) => total + size, 0),
  default: defaultGrouping,
  computeAccents,
} as const;
