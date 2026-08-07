import { PencilIcon, TrashIcon } from "lucide-react";
import { BeatGrid } from "@/components/beat-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { Section } from "@/domain";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: Section;
  isActive: boolean;
  activeClickIndex: number | null;
  onEdit: () => void;
  onDelete: () => void;
  onMeasureCountChange: (measureCount: number) => void;
}

/** A single time-signature block: signature, rehearsal mark, beat grid, and controls. */
export function SectionCard({
  section,
  isActive,
  activeClickIndex,
  onEdit,
  onDelete,
  onMeasureCountChange,
}: SectionCardProps) {
  return (
    <Card className={cn("transition-colors", isActive && "border-primary ring-1 ring-primary/40")}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold">
            {section.numerator}/{section.denominator}
          </span>
          {section.rehearsalMark ? (
            <Badge variant="secondary">{section.rehearsalMark}</Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" aria-label="編集" onClick={onEdit}>
            <PencilIcon />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="削除" onClick={onDelete}>
            <TrashIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <BeatGrid
          grouping={section.grouping}
          activeClickIndex={isActive ? activeClickIndex : null}
        />
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-muted-foreground">
            {section.measureCount} 小節
          </span>
          <Slider
            className="flex-1"
            value={section.measureCount}
            min={1}
            max={99}
            step={1}
            onValueChange={(value) => onMeasureCountChange(Array.isArray(value) ? value[0] : value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
