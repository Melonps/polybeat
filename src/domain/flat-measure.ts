import type { Denominator } from "./denominator";
import type { Section } from "./section";

/** A single measure after all of a song's sections have been expanded (flattened). */
export type FlatMeasure = Readonly<{
  /** 0-based index into the flattened measure list. */
  index: number;
  /** 1-based measure number shown to the user. */
  measureNumber: number;
  sectionId: Section["id"];
  sectionIndex: number;
  /** 0-based index of this measure within its section. */
  measureInSection: number;
  numerator: number;
  denominator: Denominator;
  grouping: readonly number[];
  rehearsalMark: Section["rehearsalMark"];
}>;

/**
 * Expands every section's `measureCount` into individual measures, producing a flat,
 * globally-indexed list the audio engine and UI can both walk through sequentially.
 */
function flatten(sections: readonly Section[]): FlatMeasure[] {
  const measures: FlatMeasure[] = [];
  let index = 0;

  sections.forEach((section, sectionIndex) => {
    for (let measureInSection = 0; measureInSection < section.measureCount; measureInSection++) {
      measures.push({
        index,
        measureNumber: index + 1,
        sectionId: section.id,
        sectionIndex,
        measureInSection,
        numerator: section.numerator,
        denominator: section.denominator,
        grouping: section.grouping,
        // The rehearsal mark only applies to the first measure of the section.
        rehearsalMark: measureInSection === 0 ? section.rehearsalMark : null,
      });
      index += 1;
    }
  });

  return measures;
}

export const FlatMeasure = {
  flatten,
} as const;
