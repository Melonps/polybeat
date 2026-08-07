import * as YAML from "yaml";
import { Song } from "./song";
import { SongId } from "./song-id";

export type SongYamlParseResult =
  | { success: true; song: Song }
  | { success: false; message: string };

/** Serializes a song to a human-editable YAML string for export/copy-paste. */
function stringify(song: Song): string {
  return YAML.stringify(song);
}

/**
 * Parses a YAML string back into a `Song`, validating every field at this boundary.
 * A fresh `id` is always generated so pasting a config never silently overwrites
 * an existing song with the same id.
 */
function parse(yamlText: string): SongYamlParseResult {
  let raw: unknown;
  try {
    raw = YAML.parse(yamlText);
  } catch (error) {
    return { success: false, message: `YAMLの解析に失敗しました: ${(error as Error).message}` };
  }

  const result = Song.schema.safeParse(raw);
  if (!result.success) {
    return { success: false, message: result.error.issues.map((issue) => issue.message).join(", ") };
  }

  return { success: true, song: { ...result.data, id: SongId.generate() } };
}

export const SongYaml = {
  stringify,
  parse,
} as const;
