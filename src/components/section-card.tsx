import { CopyIcon, GripVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { BeatGrid } from "@/components/beat-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Section } from "@/domain";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: Section;
  isActive: boolean;
  activeClickIndex: number | null;
  loopRangeState: "none" | "pending-start" | "in-range";
  editMode: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMeasureCountChange: (measureCount: number) => void;
  onTapForLoop: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

/** A single time-signature block: signature, rehearsal mark, beat grid, and controls. */
export function SectionCard({
  section,
  isActive,
  activeClickIndex,
  loopRangeState,
  editMode,
  isDragging,
  isDropTarget,
  onEdit,
  onDelete,
  onDuplicate,
  onMeasureCountChange,
  onTapForLoop,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SectionCardProps) {
  return (
    <Card
      draggable={editMode}
      onClick={editMode ? undefined : onTapForLoop}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        if (editMode) {
          event.preventDefault();
          onDragOver();
        }
      }}
      onDrop={(event) => {
        if (editMode) {
          event.preventDefault();
          onDrop();
        }
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "transition-colors",
        editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isActive && "border-primary ring-1 ring-primary/40",
        loopRangeState === "pending-start" && "border-amber-500 ring-2 ring-amber-500/60",
        loopRangeState === "in-range" && "border-sky-500 ring-1 ring-sky-500/40",
        isDragging && "opacity-40",
        isDropTarget && "border-primary border-dashed",
      )}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          {editMode ? <GripVerticalIcon className="size-4 text-muted-foreground" /> : null}
          <span className="font-semibold">{Section.label(section)}</span>
          <span className="font-mono text-sm text-muted-foreground">
            {section.numerator}/{section.denominator}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="複製"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
          >
            <CopyIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="編集"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="削除"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
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
            onClick={(event) => event.stopPropagation()}
          />
        </div>
        {loopRangeState === "pending-start" ? (
          <Badge variant="outline" className="w-fit border-amber-500 text-amber-500">
            タップして終了セクションを選択
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
