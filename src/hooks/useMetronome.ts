import { useEffect, useMemo, useRef, useState } from "react";
import { MetronomeEngine, PlaybackPosition, type Song } from "@/domain";
import { trackMetronomePlay } from "@/lib/analytics";

/** Bridges a `Song` and the imperative `MetronomeEngine` into React state. */
export function useMetronome(song: Song | null) {
  const engineRef = useRef<MetronomeEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<PlaybackPosition>(PlaybackPosition.idle);

  const engine = useMemo(() => {
    if (!song) {
      return null;
    }
    if (!engineRef.current) {
      engineRef.current = new MetronomeEngine(song);
    }
    return engineRef.current;
  }, [song]);

  useEffect(() => {
    if (!engine || !song) {
      return;
    }
    engine.setSong(song);
  }, [engine, song]);

  useEffect(() => {
    if (!engine) {
      return;
    }
    const unsubPosition = engine.onPositionChange(setPosition);
    const unsubPlaying = engine.onPlayStateChange(setIsPlaying);
    return () => {
      unsubPosition();
      unsubPlaying();
    };
  }, [engine]);

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const play = () => {
    if (!engine || !song) {
      return;
    }
    engine.start();
    trackMetronomePlay(song.bpm);
  };

  const stop = () => {
    engine?.stop();
    setPosition(PlaybackPosition.idle);
  };

  const toggle = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };

  return { isPlaying, position, play, stop, toggle };
}
