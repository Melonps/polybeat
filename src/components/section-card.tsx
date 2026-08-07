import {
  CopyIcon,
  Flag,
  FlagTriangleRight,
  GripVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
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
  activeMeasureInSection: number | null;
  activeClickIndex: number | null;
  loopRangeState: "none" | "pending-start" | "in-range";
  isLoopStart: boolean;
  isLoopEnd: boolean;
  editMode: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRepeatCountChange: (repeatCount: number) => void;
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
  activeMeasureInSection,
  activeClickIndex,
  loopRangeState,
  isLoopStart,
  isLoopEnd,
  editMode,
  isDragging,
  isDropTarget,
  onEdit,
  onDelete,
  onDuplicate,
  onRepeatCountChange,
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
        "relative transition-colors",
        editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isActive && "border-primary ring-1 ring-primary/40",
        loopRangeState === "pending-start" && "border-amber-500 ring-2 ring-amber-500/60",
        loopRangeState === "in-range" && "border-sky-500 ring-1 ring-sky-500/40",
        isDragging && "opacity-40",
        isDropTarget && "border-primary border-dashed",
      )}
    >
      {isLoopStart || isLoopEnd ? (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          {isLoopStart ? (
            <span title="ループ開始" className="text-sky-500">
              <Flag className="size-3.5" />
            </span>
          ) : null}
          {isLoopEnd ? (
            <span title="ループ終了" className="text-sky-500">
              <FlagTriangleRight className="size-3.5" />
            </span>
          ) : null}
        </div>
      ) : null}
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          {editMode ? <GripVerticalIcon className="size-4 text-muted-foreground" /> : null}
          <span className="font-semibold">{Section.label(section)}</span>
          <span className="font-mono text-sm text-muted-foreground">
            {Section.signatureLabel(section)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {editMode ? (
            <>
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
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 flex-col gap-2">
            {section.pattern.map((step, stepIndex) => {
              const isStepActive =
                isActive &&
                activeMeasureInSection !== null &&
                activeMeasureInSection % section.pattern.length === stepIndex;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: pattern steps are a fixed-order sequence, not a reorderable list
                  key={`${stepIndex}-${step.numerator}-${step.denominator}`}
                  className="flex items-center gap-2"
                >
                  {Section.isAlternating(section) ? (
                    <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">
                      {step.numerator}/{step.denominator}
                    </span>
                  ) : null}
                  <BeatGrid
                    grouping={step.grouping}
                    activeClickIndex={isStepActive ? activeClickIndex : null}
                  />
                </div>
              );
            })}
          </div>
          {!editMode ? (
            <span className="shrink-0 text-xs text-muted-foreground">× {section.repeatCount}</span>
          ) : null}
        </div>
        {editMode ? (
          <div className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-muted-foreground">
              {section.repeatCount} loop
            </span>
            <Slider
              className="flex-1"
              value={section.repeatCount}
              min={1}
              max={99}
              step={1}
              onValueChange={(value) =>
                onRepeatCountChange(Array.isArray(value) ? value[0] : value)
              }
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        ) : null}
        {loopRangeState === "pending-start" ? (
          <Badge variant="outline" className="w-fit border-amber-500 text-amber-500">
            タップして終了セクションを選択
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
