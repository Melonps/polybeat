import { useMemo } from "react";
import { ACCENT_COLORS } from "@/components/accent-colors";
import { Grouping } from "@/domain";
import { cn } from "@/lib/utils";

interface GroupingEditorProps {
  numerator: number;
  grouping: readonly number[];
  onChange: (grouping: readonly number[]) => void;
}

/** Converts a grouping (e.g. [3, 2]) into the set of beat positions where a new group starts. */
function boundariesFromGrouping(grouping: readonly number[]): Set<number> {
  const boundaries = new Set<number>();
  let position = 0;
  for (const size of grouping) {
    boundaries.add(position);
    position += size;
  }
  return boundaries;
}

/** Converts boundary positions back into a grouping array, e.g. {0, 3} over 5 beats -> [3, 2]. */
function groupingFromBoundaries(boundaries: ReadonlySet<number>, numerator: number): number[] {
  const positions = [...boundaries].filter((p) => p > 0 && p < numerator).sort((a, b) => a - b);
  const allPositions = [0, ...positions, numerator];
  const grouping: number[] = [];
  for (let i = 0; i < allPositions.length - 1; i++) {
    grouping.push(allPositions[i + 1] - allPositions[i]);
  }
  return grouping;
}

/**
 * Interactive accent-grouping editor: click the divider between two beat cells to toggle
 * whether a group boundary exists there. Sub-accents are derived automatically from the
 * resulting grouping (each group's first beat becomes a sub-accent, except the very first).
 */
export function GroupingEditor({ numerator, grouping, onChange }: GroupingEditorProps) {
  const boundaries = useMemo(() => boundariesFromGrouping(grouping), [grouping]);
  const accents = Grouping.computeAccents(grouping);

  const toggleBoundary = (position: number) => {
    const next = new Set(boundaries);
    if (next.has(position)) {
      next.delete(position);
    } else {
      next.add(position);
    }
    onChange(groupingFromBoundaries(next, numerator));
  };

  return (
    <div className="flex flex-wrap items-center">
      {Array.from({ length: numerator }, (_, position) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positions are fixed slots (0..numerator-1), not reorderable list items
        <div key={position} className="flex items-center">
          {position > 0 ? (
            <button
              type="button"
              aria-label={
                boundaries.has(position) ? `拍 ${position} で分割を解除` : `拍 ${position} で分割`
              }
              onClick={() => toggleBoundary(position)}
              className={cn(
                "mx-0.5 h-6 w-2 shrink-0 rounded-full transition-colors",
                boundaries.has(position)
                  ? "bg-primary"
                  : "bg-transparent hover:bg-muted-foreground/30",
              )}
            />
          ) : null}
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-xs font-medium text-background",
              ACCENT_COLORS[accents[position]],
            )}
          >
            {position + 1}
          </div>
        </div>
      ))}
      <span className="ml-3 text-xs text-muted-foreground">{grouping.join("+")}</span>
    </div>
  );
}
