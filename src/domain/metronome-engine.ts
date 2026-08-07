import type { ClickAccent } from "./click-accent";
import { FlatMeasure } from "./flat-measure";
import { Grouping } from "./grouping";
import { PlaybackPosition } from "./playback-position";
import type { Song } from "./song";
import { TempoUnit } from "./tempo-unit";

const LOOKAHEAD_INTERVAL_MS = 25;
const SCHEDULE_AHEAD_TIME_S = 0.1;

interface ScheduledClick {
  time: number;
  phase: "count-in" | "playing";
  measureIndex: number;
  clickIndex: number;
  accent: ClickAccent;
}

type PositionListener = (position: PlaybackPosition) => void;
type PlayStateListener = (playing: boolean) => void;

const CLICK_FREQUENCIES: Readonly<Record<ClickAccent, number>> = {
  downbeat: 1600,
  subaccent: 1100,
  weak: 700,
};

/**
 * Look-ahead scheduling metronome engine built on the Web Audio API.
 *
 * Deviation from Kamae's "pure function state transitions" guidance: the Web Audio
 * scheduler is inherently a stateful controller (it owns an `AudioContext`, a running
 * `setInterval` timer, and a `requestAnimationFrame` loop), so it is modeled as a class
 * rather than pure functions over an immutable state value. Its *output* — the position
 * reported to listeners — is still a plain discriminated union (`PlaybackPosition`).
 *
 * Every 25ms it schedules any clicks that fall within the next 100ms window, so audio
 * timing is governed entirely by the audio clock rather than the (much less precise)
 * JS timer.
 */
export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private animationFrame: number | null = null;

  private song: Song;
  private measures: FlatMeasure[];

  private phase: "count-in" | "playing" = "playing";
  private countInBeatsRemaining = 0;
  private countInTotalBeats = 0;

  private currentMeasureIndex = 0;
  private currentClickIndex = 0;
  private nextNoteTime = 0;

  private scheduledClicks: ScheduledClick[] = [];
  private lastReportedKey = "";

  private playing = false;
  private positionListeners = new Set<PositionListener>();
  private playStateListeners = new Set<PlayStateListener>();

  constructor(song: Song) {
    this.song = song;
    this.measures = FlatMeasure.flatten(song.sections);
  }

  /** Replaces the song definition. Safe to call while playing (e.g. after editing sections). */
  setSong(song: Song) {
    this.song = song;
    this.measures = FlatMeasure.flatten(song.sections);

    if (this.currentMeasureIndex >= this.measures.length) {
      this.currentMeasureIndex = 0;
      this.currentClickIndex = 0;
    }
  }

  setBpm(bpm: number) {
    this.song = { ...this.song, bpm };
  }

  setTempoUnit(tempoUnit: Song["tempoUnit"]) {
    this.song = { ...this.song, tempoUnit };
  }

  onPositionChange(listener: PositionListener): () => void {
    this.positionListeners.add(listener);
    return () => this.positionListeners.delete(listener);
  }

  onPlayStateChange(listener: PlayStateListener): () => void {
    this.playStateListeners.add(listener);
    return () => this.playStateListeners.delete(listener);
  }

  isPlaying() {
    return this.playing;
  }

  start() {
    if (this.playing || this.measures.length === 0) {
      return;
    }

    if (!this.audioContext) {
      // Safari <14.1 only exposes the vendor-prefixed constructor.
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextCtor();
    }

    // iOS Safari (and some Android WebViews) suspend the context whenever the tab is
    // backgrounded/locked, and only allow resuming it synchronously inside a user
    // gesture. `start()` is always called from the Play button's click handler, so this
    // runs inside that gesture — but we resume unconditionally (not just when
    // `state === "suspended"`) because iOS has been observed reporting a stale state.
    void this.audioContext.resume();
    this.unlockAudioContext(this.audioContext);

    this.currentMeasureIndex = Math.min(
      Math.max(0, this.song.loop.enabled ? this.song.loop.startMeasure - 1 : 0),
      this.measures.length - 1,
    );
    this.currentClickIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.scheduledClicks = [];
    this.lastReportedKey = "";

    if (this.song.countIn.enabled) {
      this.phase = "count-in";
      this.countInTotalBeats = this.song.countIn.beats;
      this.countInBeatsRemaining = this.song.countIn.beats;
    } else {
      this.phase = "playing";
    }

    this.playing = true;
    this.playStateListeners.forEach((listener) => {
      listener(true);
    });

    this.schedulerTimer = setInterval(() => this.scheduler(), LOOKAHEAD_INTERVAL_MS);
    this.animationFrame = requestAnimationFrame(() => this.draw());
  }

  stop() {
    if (!this.playing) {
      return;
    }

    this.playing = false;

    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.scheduledClicks = [];
    this.playStateListeners.forEach((listener) => {
      listener(false);
    });
  }

  /**
   * Plays a near-silent, essentially instantaneous buffer synchronously within the
   * calling user-gesture handler. On iOS Safari, `resume()` alone is not always enough
   * to fully unlock audio output — actually starting a source node (even a silent one)
   * inside the gesture is what reliably flips the context into a state where later,
   * lookahead-scheduled clicks (which run outside any gesture) are still audible.
   * Idempotent/cheap enough to call on every `start()`.
   */
  private unlockAudioContext(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  }

  private scheduleClick(
    time: number,
    phase: "count-in" | "playing",
    measureIndex: number,
    clickIndex: number,
    accent: ClickAccent,
  ) {
    const ctx = this.audioContext;
    if (!ctx) {
      return;
    }

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value =
      phase === "count-in" ? CLICK_FREQUENCIES.subaccent : CLICK_FREQUENCIES[accent];

    const peak = accent === "downbeat" ? 0.9 : accent === "subaccent" ? 0.6 : 0.35;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.06);

    this.scheduledClicks.push({ time, phase, measureIndex, clickIndex, accent });
  }

  private advanceClick() {
    if (this.phase === "count-in") {
      const clickDuration = TempoUnit.secondsPerClick(this.song.bpm, this.song.tempoUnit, 4);
      this.nextNoteTime += clickDuration;
      this.countInBeatsRemaining -= 1;
      if (this.countInBeatsRemaining <= 0) {
        this.phase = "playing";
      }
      return;
    }

    const measure = this.measures[this.currentMeasureIndex];
    const clickDuration = TempoUnit.secondsPerClick(
      this.song.bpm,
      this.song.tempoUnit,
      measure.denominator,
    );
    this.nextNoteTime += clickDuration;

    this.currentClickIndex += 1;
    if (this.currentClickIndex >= measure.numerator) {
      this.currentClickIndex = 0;
      this.advanceMeasure();
    }
  }

  private advanceMeasure() {
    const { loop } = this.song;
    const atLoopEnd = loop.enabled && this.currentMeasureIndex + 1 >= loop.endMeasure;
    const atSongEnd = this.currentMeasureIndex + 1 >= this.measures.length;

    if (atLoopEnd) {
      this.currentMeasureIndex = Math.max(0, loop.startMeasure - 1);
      return;
    }

    if (atSongEnd) {
      this.currentMeasureIndex = loop.enabled ? Math.max(0, loop.startMeasure - 1) : 0;
      return;
    }

    this.currentMeasureIndex += 1;
  }

  private scheduler() {
    if (!this.audioContext) {
      return;
    }

    while (this.nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD_TIME_S) {
      if (this.phase === "count-in") {
        const clickIndex = this.countInTotalBeats - this.countInBeatsRemaining;
        this.scheduleClick(this.nextNoteTime, "count-in", -1, clickIndex, "weak");
        this.advanceClick();
        continue;
      }

      const measure = this.measures[this.currentMeasureIndex];
      if (!measure) {
        this.stop();
        return;
      }

      const accents = Grouping.computeAccents(measure.grouping);
      const accent = accents[this.currentClickIndex] ?? "weak";

      this.scheduleClick(
        this.nextNoteTime,
        "playing",
        this.currentMeasureIndex,
        this.currentClickIndex,
        accent,
      );
      this.advanceClick();
    }
  }

  private draw() {
    if (!this.playing || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;

    // Drop clicks that already played, keeping the most recent one that has started.
    while (this.scheduledClicks.length > 1 && this.scheduledClicks[1].time <= now) {
      this.scheduledClicks.shift();
    }

    const active = this.scheduledClicks[0];
    if (active && active.time <= now) {
      const key = `${active.phase}:${active.measureIndex}:${active.clickIndex}`;
      if (key !== this.lastReportedKey) {
        this.lastReportedKey = key;
        if (active.phase === "count-in") {
          this.reportCountIn(active.clickIndex);
        } else {
          this.reportPosition(active.measureIndex, active.clickIndex, active.accent);
        }
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.draw());
  }

  private reportCountIn(beatIndex: number) {
    const position = PlaybackPosition.countingIn({
      beatIndex,
      totalBeats: this.countInTotalBeats,
    });
    this.positionListeners.forEach((listener) => {
      listener(position);
    });
  }

  private reportPosition(measureIndex: number, clickIndex: number, accent: ClickAccent) {
    const measure = this.measures[measureIndex];
    if (!measure) {
      this.positionListeners.forEach((listener) => {
        listener(PlaybackPosition.idle);
      });
      return;
    }

    const position = PlaybackPosition.active({
      measureNumber: measure.measureNumber,
      sectionId: measure.sectionId,
      sectionIndex: measure.sectionIndex,
      rehearsalMark: this.currentRehearsalMark(measure),
      clickIndex,
      accent,
      totalMeasures: this.measures.length,
    });
    this.positionListeners.forEach((listener) => {
      listener(position);
    });
  }

  /** Rehearsal marks are only set on a section's first measure; carry it forward within the section. */
  private currentRehearsalMark(measure: FlatMeasure): FlatMeasure["rehearsalMark"] {
    for (let i = measure.index; i >= 0; i--) {
      const candidate = this.measures[i];
      if (candidate.sectionId !== measure.sectionId) {
        break;
      }
      if (candidate.rehearsalMark) {
        return candidate.rehearsalMark;
      }
    }
    return null;
  }

  getMeasures() {
    return this.measures;
  }

  getTotalMeasures() {
    return this.measures.length;
  }

  destroy() {
    this.stop();
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }
}
