import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SongNameEditorProps {
  name: string;
  onSave: (name: string) => void;
  className?: string;
}

/** Inline song name input with a save button; Enter also confirms. */
export function SongNameEditor({ name, onSave, className }: SongNameEditorProps) {
  const [draft, setDraft] = useState(name);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
    } else {
      setDraft(name);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Input
          aria-label="楽曲名"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit();
            }
          }}
        />
        <Button
          size="icon"
          variant="outline"
          aria-label="楽曲名を保存"
          onClick={commit}
          disabled={draft.trim() === name}
        >
          <CheckIcon data-icon="inline-start" />
        </Button>
      </div>
    </div>
  );
}
