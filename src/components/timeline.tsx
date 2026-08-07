import { PlusIcon } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import type { PlaybackPosition, Section, Song } from "@/domain";

interface TimelineProps {
  song: Song;
  isPlaying: boolean;
  position: PlaybackPosition;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: Section["id"]) => void;
  onMeasureCountChange: (sectionId: Section["id"], measureCount: number) => void;
}

/** Lists every section as a `SectionCard`, plus a button to append a new one. */
export function Timeline({
  song,
  isPlaying,
  position,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onMeasureCountChange,
}: TimelineProps) {
  const activeSectionIndex = isPlaying && position.kind === "Active" ? position.sectionIndex : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {song.sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            isActive={activeSectionIndex === index}
            activeClickIndex={isPlaying && position.kind === "Active" ? position.clickIndex : null}
            onEdit={() => onEditSection(section)}
            onDelete={() => onDeleteSection(section.id)}
            onMeasureCountChange={(measureCount) => onMeasureCountChange(section.id, measureCount)}
          />
        ))}
      </div>
      <Button variant="outline" onClick={onAddSection} className="self-start">
        <PlusIcon data-icon="inline-start" />
        Add section
      </Button>
    </div>
  );
}
