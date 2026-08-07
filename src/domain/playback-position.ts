import type { ClickAccent } from "./click-accent";
import type { RehearsalMark } from "./rehearsal-mark";
import type { SectionId } from "./section-id";

/** No click has played yet (engine stopped or not started). */
type Idle = Readonly<{ kind: "Idle" }>;

/** Pre-roll clicks playing before the song itself starts. */
type CountingIn = Readonly<{
  kind: "CountingIn";
  beatIndex: number;
  totalBeats: number;
}>;

/** The most recently played click's location within the song. */
type Active = Readonly<{
  kind: "Active";
  measureNumber: number;
  sectionId: SectionId;
  sectionIndex: number;
  rehearsalMark: RehearsalMark | null;
  clickIndex: number;
  accent: ClickAccent;
  totalMeasures: number;
}>;

export type PlaybackPosition = Idle | CountingIn | Active;

export const PlaybackPosition = {
  idle: { kind: "Idle" } as const satisfies Idle,
  countingIn: (fields: Omit<CountingIn, "kind">): CountingIn => ({
    kind: "CountingIn",
    ...fields,
  }),
  active: (fields: Omit<Active, "kind">): Active => ({ kind: "Active", ...fields }),
  isActive: (position: PlaybackPosition) => position.kind === "Active",
  isCountingIn: (position: PlaybackPosition) => position.kind === "CountingIn",
} as const;
