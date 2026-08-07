import type { ClickAccent } from "@/domain";

/** Tailwind classes for each click accent, per the spec's amber/sky/gray legend. */
export const ACCENT_COLORS: Readonly<Record<ClickAccent, string>> = {
  downbeat: "bg-amber-500",
  subaccent: "bg-sky-500",
  weak: "bg-zinc-600",
};

export const ACCENT_LABELS: Readonly<Record<ClickAccent, string>> = {
  downbeat: "ダウンビート",
  subaccent: "サブアクセント",
  weak: "弱拍",
};
