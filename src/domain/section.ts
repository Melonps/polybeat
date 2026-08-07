import * as z from "zod";
import { Denominator } from "./denominator";
import { Grouping } from "./grouping";
import { RehearsalMark } from "./rehearsal-mark";
import { SectionId } from "./section-id";

/** A block of measures sharing the same time signature and accent grouping. */
const SectionSchema = z.object({
  id: SectionId.schema,
  numerator: z.number().int().min(1).max(32),
  denominator: Denominator.schema,
  grouping: Grouping.schema,
  measureCount: z.number().int().min(1).max(99),
  rehearsalMark: RehearsalMark.schema.nullable(),
});
export type Section = z.infer<typeof SectionSchema>;

export const Section = {
  schema: SectionSchema,
  /** Builds a new 4/4 section with sensible defaults, overridable per field. */
  create: (overrides: Partial<Omit<Section, "id">> = {}): Section => ({
    id: SectionId.generate(),
    numerator: 4,
    denominator: 4,
    grouping: Grouping.default(4),
    measureCount: 4,
    rehearsalMark: null,
    ...overrides,
  }),
} as const;
