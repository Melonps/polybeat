/** Minimal analytics stub. Swap the implementation for a real analytics SDK when available. */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as typeof window & {
    analytics?: { track?: (name: string, properties?: Record<string, unknown>) => void };
  };

  if (analyticsWindow.analytics?.track) {
    analyticsWindow.analytics.track(name, properties);
    return;
  }

  if (import.meta.env.DEV) {
    console.debug(`[analytics] ${name}`, properties);
  }
}

export function trackMetronomePlay(bpm: number) {
  trackEvent("metronome_play", { bpm });
}
