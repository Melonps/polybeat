import * as z from "zod";

export const SectionIdBrand = Symbol();
const SectionIdSchema = z.string().min(1).brand<typeof SectionIdBrand>();
export type SectionId = z.infer<typeof SectionIdSchema>;

export const SectionId = {
  schema: SectionIdSchema,
  parse: (raw: unknown) => SectionIdSchema.safeParse(raw),
  generate: (): SectionId => SectionIdSchema.parse(crypto.randomUUID()),
} as const;
