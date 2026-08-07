import * as z from "zod";

/** Pre-count clicks played at the song's BPM before playback of the song itself begins. */
const CountInSchema = z.object({
  enabled: z.boolean(),
  beats: z.number().int().min(1).max(8),
});
export type CountIn = z.infer<typeof CountInSchema>;

const DEFAULT_COUNT_IN: CountIn = { enabled: false, beats: 4 };

export const CountIn = {
  schema: CountInSchema,
  default: (): CountIn => DEFAULT_COUNT_IN,
} as const;
