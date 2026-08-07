import * as z from "zod";
import { Denominator } from "./denominator";
import { Grouping } from "./grouping";
import { RehearsalMark } from "./rehearsal-mark";
import { SectionId } from "./section-id";

/** A block of measures sharing the same time signature and accent grouping. */
const SectionSchema = z.object({
  id: SectionId.schema,
  // Free-form label combined with the rehearsal mark for display, e.g. "Verse-A".
  name: z.string().default(""),
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
    name: "",
    numerator: 4,
    denominator: 4,
    grouping: Grouping.default(4),
    measureCount: 4,
    rehearsalMark: null,
    ...overrides,
  }),
  /** Display label: "{name}-{rehearsalMark}", falling back gracefully when either part is missing. */
  label: (section: Section): string => {
    if (section.name && section.rehearsalMark) {
      return `${section.name}-${section.rehearsalMark}`;
    }
    return section.name || section.rehearsalMark || `${section.numerator}/${section.denominator}`;
  },
  /** Copies a section's settings under a fresh id, for the "duplicate" action. */
  duplicate: (section: Section): Section => ({
    ...section,
    id: SectionId.generate(),
  }),
} as const;
