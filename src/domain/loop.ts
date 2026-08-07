import * as z from "zod";

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

export const Loop = {
  schema: LoopSchema,
  clampToMeasureCount,
} as const;
