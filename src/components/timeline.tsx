import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import type { PlaybackPosition, Section, Song } from "@/domain";
import { FlatMeasure } from "@/domain";

interface TimelineProps {
  song: Song;
  isPlaying: boolean;
  position: PlaybackPosition;
  loopRangeStartId: Section["id"] | null;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: Section["id"]) => void;
  onDuplicateSection: (sectionId: Section["id"]) => void;
  onReorderSections: (fromId: Section["id"], toId: Section["id"]) => void;
  onRepeatCountChange: (sectionId: Section["id"], repeatCount: number) => void;
  onTapSectionForLoop: (sectionId: Section["id"]) => void;
}

/** Lists every section as a `SectionCard`, plus a button to append a new one and an edit-mode toggle. */
export function Timeline({
  song,
  isPlaying,
  position,
  loopRangeStartId,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onDuplicateSection,
  onReorderSections,
  onRepeatCountChange,
  onTapSectionForLoop,
}: TimelineProps) {
  const [editMode, setEditMode] = useState(false);
  const [draggingId, setDraggingId] = useState<Section["id"] | null>(null);
  const [dropTargetId, setDropTargetId] = useState<Section["id"] | null>(null);
  const activeSectionRef = useRef<HTMLDivElement | null>(null);

  const activeSectionIndex = isPlaying && position.kind === "Active" ? position.sectionIndex : null;

  useEffect(() => {
    if (activeSectionIndex === null) {
      return;
    }
    activeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSectionIndex]);

  const startIndex = loopRangeStartId
    ? song.sections.findIndex((section) => section.id === loopRangeStartId)
    : -1;

  const loopStartIndex = song.loop.enabled
    ? FlatMeasure.flatten(song.sections).find(
        (measure) => measure.measureNumber === song.loop.startMeasure,
      )?.sectionIndex
    : undefined;
  const loopEndIndex = song.loop.enabled
    ? FlatMeasure.flatten(song.sections).find(
        (measure) => measure.measureNumber === song.loop.endMeasure,
      )?.sectionIndex
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">セクション</span>
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setEditMode((prev) => !prev);
            setDraggingId(null);
            setDropTargetId(null);
          }}
        >
          {editMode ? (
            <>
              <CheckIcon data-icon="inline-start" />
              完了
            </>
          ) : (
            <>
              <PencilIcon data-icon="inline-start" />
              編集モード
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {song.sections.map((section, index) => {
          const loopRangeState: "none" | "pending-start" | "in-range" =
            startIndex >= 0 && index === startIndex
              ? "pending-start"
              : loopStartIndex !== undefined &&
                  loopEndIndex !== undefined &&
                  index >= Math.min(loopStartIndex, loopEndIndex) &&
                  index <= Math.max(loopStartIndex, loopEndIndex)
                ? "in-range"
                : "none";

          const isActive = activeSectionIndex === index;
          const isLoopStart =
            loopStartIndex !== undefined &&
            index === Math.min(loopStartIndex, loopEndIndex ?? loopStartIndex);
          const isLoopEnd =
            loopEndIndex !== undefined &&
            index === Math.max(loopEndIndex, loopStartIndex ?? loopEndIndex);

          return (
            <div key={section.id} ref={isActive ? activeSectionRef : undefined}>
              <SectionCard
                section={section}
                isActive={isActive}
                activeMeasureInSection={
                  isPlaying && position.kind === "Active" ? position.measureInSection : null
                }
                activeClickIndex={
                  isPlaying && position.kind === "Active" ? position.clickIndex : null
                }
                loopRangeState={loopRangeState}
                isLoopStart={isLoopStart}
                isLoopEnd={isLoopEnd}
                editMode={editMode}
                isDragging={draggingId === section.id}
                isDropTarget={editMode && dropTargetId === section.id && draggingId !== section.id}
                onEdit={() => onEditSection(section)}
                onDelete={() => onDeleteSection(section.id)}
                onDuplicate={() => onDuplicateSection(section.id)}
                onRepeatCountChange={(repeatCount) => onRepeatCountChange(section.id, repeatCount)}
                onTapForLoop={() => onTapSectionForLoop(section.id)}
                onDragStart={() => setDraggingId(section.id)}
                onDragOver={() => setDropTargetId(section.id)}
                onDrop={() => {
                  if (draggingId && draggingId !== section.id) {
                    onReorderSections(draggingId, section.id);
                  }
                  setDraggingId(null);
                  setDropTargetId(null);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropTargetId(null);
                }}
              />
            </div>
          );
        })}
      </div>
      <Button variant="outline" onClick={onAddSection} className="self-start">
        <PlusIcon data-icon="inline-start" />
        Add section
      </Button>
    </div>
  );
}
