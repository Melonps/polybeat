import { ACCENT_COLORS } from "@/components/accent-colors";
import { ClickAccent, Grouping } from "@/domain";
import { cn } from "@/lib/utils";

interface BeatGridProps {
  grouping: readonly number[];
  activeClickIndex?: number | null;
  className?: string;
}

/**
 * Renders one cell per click in a measure, colored by accent (downbeat/subaccent/weak).
 * When `activeClickIndex` matches a cell during playback, that cell blinks.
 */
export function BeatGrid({ grouping, activeClickIndex, className }: BeatGridProps) {
  const accents = Grouping.computeAccents(grouping);

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {accents.map((accent, index) => (
        <div
          // Beat positions are stable within a measure, so index is an acceptable key.
          // biome-ignore lint/suspicious/noArrayIndexKey: beat order within a measure never reorders.
          key={index}
          className={cn(
            "size-3.5 rounded-sm transition-transform",
            ACCENT_COLORS[accent],
            ClickAccent.isDownbeat(accent) && "size-4",
            activeClickIndex === index && "scale-125 animate-pulse ring-2 ring-foreground/60",
          )}
        />
      ))}
    </div>
  );
}
