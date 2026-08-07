import * as z from "zod";

const DenominatorSchema = z.union([z.literal(4), z.literal(8), z.literal(16)]);
export type Denominator = z.infer<typeof DenominatorSchema>;

export const Denominator = {
  schema: DenominatorSchema,
  values: [4, 8, 16] as const satisfies readonly Denominator[],
} as const;
