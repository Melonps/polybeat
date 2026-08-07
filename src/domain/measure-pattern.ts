import * as z from "zod";
import { Denominator } from "./denominator";
import { Grouping } from "./grouping";

/**
 * One measure's time signature + accent grouping, used as a repeatable unit inside a
 * `Section`. Letting a section hold a *list* of these (instead of a single signature)
 * is what allows e.g. "12/8 then 4/8, alternating" to be expressed as one section with
 * `pattern: [12/8, 4/8]` and `repeatCount: 8`, rather than needing 16 separate sections.
 */
const MeasurePatternSchema = z.object({
  numerator: z.number().int().min(1).max(32),
  denominator: Denominator.schema,
  grouping: Grouping.schema,
});
export type MeasurePattern = z.infer<typeof MeasurePatternSchema>;

export const MeasurePattern = {
  schema: MeasurePatternSchema,
  create: (overrides: Partial<MeasurePattern> = {}): MeasurePattern => {
    const numerator = overrides.numerator ?? 4;
    return {
      numerator,
      denominator: overrides.denominator ?? 4,
      grouping: overrides.grouping ?? Grouping.default(numerator),
    };
  },
  label: (pattern: MeasurePattern) => `${pattern.numerator}/${pattern.denominator}`,
} as const;
