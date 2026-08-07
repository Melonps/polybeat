import { ACCENT_COLORS, ACCENT_LABELS } from "@/components/accent-colors";
import type { ClickAccent } from "@/domain";

const LEGEND_ORDER: readonly ClickAccent[] = ["downbeat", "subaccent", "weak"];

/** Explains what each beat cell color means. */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {LEGEND_ORDER.map((accent) => (
        <div key={accent} className="flex items-center gap-1.5">
          <span className={`size-3 rounded-sm ${ACCENT_COLORS[accent]}`} />
          <span>{ACCENT_LABELS[accent]}</span>
        </div>
      ))}
    </div>
  );
}
