import * as z from "zod";

export const SongIdBrand = Symbol();
const SongIdSchema = z.string().min(1).brand<typeof SongIdBrand>();
export type SongId = z.infer<typeof SongIdSchema>;

export const SongId = {
  schema: SongIdSchema,
  parse: (raw: unknown) => SongIdSchema.safeParse(raw),
  generate: (): SongId => SongIdSchema.parse(crypto.randomUUID()),
} as const;
