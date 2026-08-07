import * as z from "zod";

const RehearsalMarkSchema = z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
export type RehearsalMark = z.infer<typeof RehearsalMarkSchema>;

export const RehearsalMark = {
  schema: RehearsalMarkSchema,
  all: RehearsalMarkSchema.options,
} as const;
