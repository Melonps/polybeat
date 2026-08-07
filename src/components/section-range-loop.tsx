import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlatMeasure, Loop, type Song } from "@/domain";

interface SectionRangeLoopProps {
  song: Song;
  onLoopChange: (loop: Loop) => void;
}

function sectionLabel(section: Song["sections"][number], index: number): string {
  const mark = section.rehearsalMark ? ` [${section.rehearsalMark}]` : "";
  return `${index + 1}: ${section.numerator}/${section.denominator}${mark}`;
}

/** Lets the user pick a start/end section and apply that range as the loop, instead of raw measure numbers. */
export function SectionRangeLoop({ song, onLoopChange }: SectionRangeLoopProps) {
  const sections = song.sections;
  const [startSectionIndex, setStartSectionIndex] = useState(0);
  const [endSectionIndex, setEndSectionIndex] = useState(0);

  if (sections.length === 0) {
    return null;
  }

  const clampedStart = Math.min(startSectionIndex, sections.length - 1);
  const clampedEnd = Math.min(endSectionIndex, sections.length - 1);

  const apply = () => {
    const measures = FlatMeasure.flatten(sections);
    const range = Loop.measureRangeForSections(measures, clampedStart, clampedEnd);
    if (!range) {
      return;
    }
    onLoopChange({ enabled: true, ...range });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className="text-sm font-medium">区間ループ</span>
      <Select
        value={String(clampedStart)}
        onValueChange={(value) => setStartSectionIndex(Number(value))}
      >
        <SelectTrigger aria-label="開始セクション" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sections.map((section, index) => (
              <SelectItem key={section.id} value={String(index)}>
                {sectionLabel(section, index)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">〜</span>
      <Select
        value={String(clampedEnd)}
        onValueChange={(value) => setEndSectionIndex(Number(value))}
      >
        <SelectTrigger aria-label="終了セクション" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sections.map((section, index) => (
              <SelectItem key={section.id} value={String(index)}>
                {sectionLabel(section, index)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={apply}>
        この範囲でループ
      </Button>
    </div>
  );
}
