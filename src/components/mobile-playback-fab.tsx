import { PlayIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobilePlaybackFabProps {
  isPlaying: boolean;
  onToggle: () => void;
}

/**
 * Floating Play/Stop button pinned to the bottom-right corner on mobile, so playback can
 * be controlled without scrolling back up to the full `TransportControls` bar. Hidden on
 * `md`+ where the transport bar is always in view.
 */
export function MobilePlaybackFab({ isPlaying, onToggle }: MobilePlaybackFabProps) {
  return (
    <Button
      size="icon-lg"
      onClick={onToggle}
      aria-label={isPlaying ? "停止" : "再生"}
      className={cn(
        "fixed right-5 bottom-5 z-50 size-14 rounded-full shadow-lg md:hidden",
        isPlaying && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      )}
    >
      {isPlaying ? (
        <SquareIcon className="size-6" data-icon="inline-start" />
      ) : (
        <PlayIcon className="size-6" data-icon="inline-start" />
      )}
    </Button>
  );
}
