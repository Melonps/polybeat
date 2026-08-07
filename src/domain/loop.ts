import * as z from "zod";
import type { FlatMeasure } from "./flat-measure";

/** Loop playback range, expressed as 1-based inclusive measure numbers. */
const LoopSchema = z.object({
  enabled: z.boolean(),
  startMeasure: z.number().int().min(1),
  endMeasure: z.number().int().min(1),
});
export type Loop = z.infer<typeof LoopSchema>;

/** Clamps a loop's start/end measures so they stay within [1, measureCount]. */
function clampToMeasureCount(loop: Loop, measureCount: number): Loop {
  const max = Math.max(1, measureCount);
  const startMeasure = Math.min(Math.max(1, loop.startMeasure), max);
  const endMeasure = Math.min(Math.max(startMeasure, loop.endMeasure), max);
  return { ...loop, startMeasure, endMeasure };
}

/**
 * Computes the 1-based measure range spanned by a run of sections (by index, inclusive),
 * so the UI can let users pick a loop range by section rather than raw measure numbers.
 */
function measureRangeForSections(
  measures: readonly FlatMeasure[],
  startSectionIndex: number,
  endSectionIndex: number,
): { startMeasure: number; endMeasure: number } | null {
  const inRange = measures.filter(
    (measure) =>
      measure.sectionIndex >= Math.min(startSectionIndex, endSectionIndex) &&
      measure.sectionIndex <= Math.max(startSectionIndex, endSectionIndex),
  );
  if (inRange.length === 0) {
    return null;
  }
  return {
    startMeasure: inRange[0].measureNumber,
    endMeasure: inRange[inRange.length - 1].measureNumber,
  };
}

export const Loop = {
  schema: LoopSchema,
  clampToMeasureCount,
  measureRangeForSections,
} as const;
