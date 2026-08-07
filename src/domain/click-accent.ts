/** Classification of a single click within a measure, used to pick its accent volume/pitch. */
export type ClickAccent = "downbeat" | "subaccent" | "weak";

export const ClickAccent = {
  isDownbeat: (accent: ClickAccent) => accent === "downbeat",
  isSubaccent: (accent: ClickAccent) => accent === "subaccent",
} as const;
