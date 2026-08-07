import * as z from "zod";
import { MeasurePattern } from "./measure-pattern";
import { RehearsalMark } from "./rehearsal-mark";
import { SectionId } from "./section-id";

/**
 * A block of measures. `pattern` is a sequence of one or more time signatures that
 * repeats `repeatCount` times, e.g. `pattern: [12/8, 4/8], repeatCount: 8` expands to
 * 16 measures alternating 12/8, 4/8, 12/8, 4/8, ... This lets an alternating-meter
 * passage be authored as a single section instead of one section per measure.
 *
 * The common case of a single, unchanging time signature is just `pattern.length === 1`.
 */
const SectionSchema = z.object({
  id: SectionId.schema,
  // Free-form label combined with the rehearsal mark for display, e.g. "Verse-A".
  name: z.string().default(""),
  pattern: z.array(MeasurePattern.schema).min(1),
  repeatCount: z.number().int().min(1).max(99),
  rehearsalMark: RehearsalMark.schema.nullable(),
});

/**
 * Songs saved before the multi-pattern model existed stored a single time signature
 * directly on the section (`numerator`/`denominator`/`grouping`/`measureCount`). This
 * preprocesses that legacy shape into `pattern: [{ numerator, denominator, grouping }]`,
 * `repeatCount: measureCount`, so old localStorage data and pasted YAML keep working.
 */
const LegacySectionShape = z.object({
  id: SectionId.schema,
  name: z.string().default(""),
  numerator: z.number().int().min(1).max(32),
  denominator: MeasurePattern.schema.shape.denominator,
  grouping: MeasurePattern.schema.shape.grouping,
  measureCount: z.number().int().min(1).max(99),
  rehearsalMark: RehearsalMark.schema.nullable(),
});

const SectionWithMigrationSchema = z.preprocess((raw) => {
  const legacy = LegacySectionShape.safeParse(raw);
  if (!legacy.success) {
    return raw;
  }
  return {
    id: legacy.data.id,
    name: legacy.data.name,
    pattern: [
      {
        numerator: legacy.data.numerator,
        denominator: legacy.data.denominator,
        grouping: legacy.data.grouping,
      },
    ],
    repeatCount: legacy.data.measureCount,
    rehearsalMark: legacy.data.rehearsalMark,
  };
}, SectionSchema);

export type Section = z.infer<typeof SectionSchema>;

export const Section = {
  schema: SectionWithMigrationSchema,
  /** Builds a new single-pattern section with sensible 4/4 defaults, overridable per field. */
  create: (
    overrides: Partial<Omit<Section, "id" | "pattern">> & { pattern?: MeasurePattern[] } = {},
  ): Section => ({
    id: SectionId.generate(),
    name: "",
    pattern: overrides.pattern ?? [MeasurePattern.create()],
    repeatCount: 4,
    rehearsalMark: null,
    ...overrides,
  }),
  /** Display label: "{name}-{rehearsalMark}", falling back gracefully when either part is missing. */
  label: (section: Section): string => {
    if (section.name && section.rehearsalMark) {
      return `${section.name}-${section.rehearsalMark}`;
    }
    return (
      section.name || section.rehearsalMark || section.pattern.map(MeasurePattern.label).join(", ")
    );
  },
  /** True when this section cycles through more than one time signature. */
  isAlternating: (section: Section): boolean => section.pattern.length > 1,
  /** Total measures this section expands to: `pattern.length * repeatCount`. */
  measureCount: (section: Section): number => section.pattern.length * section.repeatCount,
  /** Compact signature summary for display, e.g. "12/8, 4/8" or "7/8". */
  signatureLabel: (section: Section): string =>
    section.pattern.map(MeasurePattern.label).join(", "),
  /** Copies a section's settings under a fresh id, for the "duplicate" action. */
  duplicate: (section: Section): Section => ({
    ...section,
    id: SectionId.generate(),
  }),
} as const;
