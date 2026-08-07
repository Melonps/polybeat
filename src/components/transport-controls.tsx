import { MinusIcon, PlayIcon, PlusIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { PlaybackPosition } from "@/domain";
import { Song, TempoUnit } from "@/domain";

const BPM_MIN = 30;
const BPM_MAX = 280;

interface TransportControlsProps {
  song: Song;
  isPlaying: boolean;
  position: PlaybackPosition;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onTempoUnitChange: (unit: Song["tempoUnit"]) => void;
}

function formatPosition(song: Song, isPlaying: boolean, position: PlaybackPosition): string {
  if (isPlaying && position.kind === "CountingIn") {
    return `Count-in ${position.beatIndex + 1}/${position.totalBeats}`;
  }

  if (isPlaying && position.kind === "Active") {
    return `m. ${position.measureNumber}`;
  }

  if (song.loop.enabled) {
    return `m. ${song.loop.startMeasure}–${song.loop.endMeasure}`;
  }

  const total = Song.totalMeasures(song);
  return total > 1 ? `m. 1–${total}` : "m. 1";
}

/** Play/Stop, tempo controls, current position, and rehearsal mark display. */
export function TransportControls({
  song,
  isPlaying,
  position,
  onToggle,
  onBpmChange,
  onTempoUnitChange,
}: TransportControlsProps) {
  const rehearsalMark = isPlaying && position.kind === "Active" ? position.rehearsalMark : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button size="icon-lg" onClick={onToggle} aria-label={isPlaying ? "停止" : "再生"}>
            {isPlaying ? (
              <SquareIcon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
          </Button>

          <div className="flex items-center gap-1.5">
            <Select
              value={song.tempoUnit}
              onValueChange={(value) => onTempoUnitChange(value as Song["tempoUnit"])}
            >
              <SelectTrigger aria-label="基準音符" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TempoUnit.order.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {TempoUnit.label(unit)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="font-mono text-lg tabular-nums">= {song.bpm}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="font-mono text-sm text-muted-foreground">
            {formatPosition(song, isPlaying, position)}
          </span>
          {rehearsalMark ? <Badge variant="secondary">{rehearsalMark}</Badge> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="BPMを下げる"
          onClick={() => onBpmChange(Math.max(BPM_MIN, song.bpm - 1))}
        >
          <MinusIcon />
        </Button>
        <Slider
          className="flex-1"
          value={song.bpm}
          min={BPM_MIN}
          max={BPM_MAX}
          step={1}
          onValueChange={(value) => onBpmChange(Array.isArray(value) ? value[0] : value)}
        />
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="BPMを上げる"
          onClick={() => onBpmChange(Math.min(BPM_MAX, song.bpm + 1))}
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
