import { ChevronDownIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { CountIn } from "@/domain";

interface CountInControlsProps {
  countIn: CountIn;
  onChange: (countIn: CountIn) => void;
}

const MIN_BEATS = 1;
const MAX_BEATS = 8;

/** Toggle for a pre-count (count-in) played at the song's tempo before playback starts. */
export function CountInControls({ countIn, onChange }: CountInControlsProps) {
  const commit = (next: CountIn) => {
    const beats = Math.min(MAX_BEATS, Math.max(MIN_BEATS, next.beats));
    onChange({ ...next, beats });
  };

  return (
    <Collapsible className="rounded-xl border border-border bg-card">
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium">
        予備拍
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-wrap items-center gap-4 p-4 pt-0">
          <div className="flex items-center gap-2">
            <Switch
              id="count-in-enabled"
              checked={countIn.enabled}
              onCheckedChange={(checked) => commit({ ...countIn, enabled: checked })}
            />
            <FieldLabel htmlFor="count-in-enabled">有効</FieldLabel>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              aria-label="予備拍の数"
              className="w-20"
              min={MIN_BEATS}
              max={MAX_BEATS}
              value={countIn.beats}
              disabled={!countIn.enabled}
              onChange={(event) => commit({ ...countIn, beats: Number(event.target.value) || 1 })}
            />
            <span className="text-sm text-muted-foreground">拍</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
