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
 * Expands every section's `pattern` (cycled `repeatCount` times) into individual
 * measures, producing a flat, globally-indexed list the audio engine and UI can both
 * walk through sequentially. A section with `pattern: [12/8, 4/8]` and
 * `repeatCount: 8` yields 16 measures alternating 12/8, 4/8, 12/8, 4/8, ...
 */
function flatten(sections: readonly Section[]): FlatMeasure[] {
  const measures: FlatMeasure[] = [];
  let index = 0;

  sections.forEach((section, sectionIndex) => {
    let measureInSection = 0;
    for (let repeat = 0; repeat < section.repeatCount; repeat++) {
      for (const step of section.pattern) {
        measures.push({
          index,
          measureNumber: index + 1,
          sectionId: section.id,
          sectionIndex,
          measureInSection,
          numerator: step.numerator,
          denominator: step.denominator,
          grouping: step.grouping,
          // The rehearsal mark only applies to the first measure of the section.
          rehearsalMark: measureInSection === 0 ? section.rehearsalMark : null,
        });
        index += 1;
        measureInSection += 1;
      }
    }
  });

  return measures;
}

export const FlatMeasure = {
  flatten,
} as const;
