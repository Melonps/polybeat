import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loop, Song } from "@/domain";

interface LoopControlsProps {
  song: Song;
  onLoopChange: (loop: Loop) => void;
}

/** Loop enable toggle plus start/end measure inputs, clamped to the song's measure count. */
export function LoopControls({ song, onLoopChange }: LoopControlsProps) {
  const totalMeasures = Song.totalMeasures(song);
  const { loop } = song;

  const commit = (next: Loop) => {
    onLoopChange(Loop.clampToMeasureCount(next, totalMeasures));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Switch
          id="loop-enabled"
          checked={loop.enabled}
          onCheckedChange={(checked) => commit({ ...loop, enabled: checked })}
        />
        <FieldLabel htmlFor="loop-enabled">ループ</FieldLabel>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          aria-label="開始小節"
          className="w-20"
          min={1}
          max={totalMeasures}
          value={loop.startMeasure}
          disabled={!loop.enabled}
          onChange={(event) => commit({ ...loop, startMeasure: Number(event.target.value) || 1 })}
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          aria-label="終了小節"
          className="w-20"
          min={1}
          max={totalMeasures}
          value={loop.endMeasure}
          disabled={!loop.enabled}
          onChange={(event) => commit({ ...loop, endMeasure: Number(event.target.value) || 1 })}
        />
        <span className="text-sm text-muted-foreground">of {totalMeasures} measures</span>
      </div>
    </div>
  );
}
