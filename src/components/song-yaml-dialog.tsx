import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type Song, SongYaml } from "@/domain";

interface SongYamlDialogProps {
  song: Song;
  onImport: (song: Song) => void;
}

/** Dialog for exporting the current song as YAML (copy/download) or importing/pasting one back in. */
export function SongYamlDialog({ song, onImport }: SongYamlDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => SongYaml.stringify(song));

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setText(SongYaml.stringify(song));
    }
    setOpen(next);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("YAMLをクリップボードにコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${song.name || "song"}.yaml`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = () => {
    const result = SongYaml.parse(text);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    onImport(result.song);
    toast.success("YAMLから読み込みました");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <FileTextIcon data-icon="inline-start" />
            現在の設定
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>YAMLでエクスポート / インポート</DialogTitle>
          <DialogDescription>
            現在の楽曲設定をYAMLとしてコピー・ダウンロードできます。他のYAMLを貼り付けて読み込むこともできます。
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-72 font-mono text-xs"
          spellCheck={false}
        />

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              コピー
            </Button>
            <Button variant="outline" onClick={download}>
              ダウンロード
            </Button>
          </div>
          <Button onClick={applyImport}>この内容を読み込む</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
