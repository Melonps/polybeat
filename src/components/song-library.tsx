import { PlusIcon, TrashIcon } from "lucide-react";
import { SongNameEditor } from "@/components/song-name-editor";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Song, SongId } from "@/domain";
import { useIsMobile } from "@/hooks/use-mobile";

interface SongLibraryProps {
  songs: Song[];
  selectedId: SongId | null;
  onSelect: (id: SongId) => void;
  onCreate: () => void;
  onDelete: (id: SongId) => void;
  onRenameSelected: (name: string) => void;
  selectedSong: Song | null;
}

/** Sidebar: song list, creation, deletion, and (on mobile only) the song name editor. */
export function SongLibrary({
  songs,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onRenameSelected,
  selectedSong,
}: SongLibraryProps) {
  const isMobile = useIsMobile();

  return (
    <Sidebar>
      <SidebarHeader className="gap-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-semibold tracking-tight">PolyBeat</span>
        </div>
        <Button onClick={onCreate} className="mx-2">
          <PlusIcon data-icon="inline-start" />
          New Song
        </Button>
        {isMobile && selectedSong ? (
          <SongNameEditor className="px-2" name={selectedSong.name} onSave={onRenameSelected} />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Songs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {songs.map((song) => (
                <SidebarMenuItem key={song.id}>
                  <SidebarMenuButton
                    isActive={song.id === selectedId}
                    onClick={() => onSelect(song.id)}
                    className="h-auto flex-col items-start gap-0.5 py-2"
                  >
                    <span className="w-full truncate font-medium">{song.name}</span>
                    <span className="w-full truncate text-xs text-muted-foreground">
                      {song.bpm} BPM · {song.sections.length} section
                      {song.sections.length === 1 ? "" : "s"}
                    </span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    aria-label={`${song.name} を削除`}
                    onClick={() => onDelete(song.id)}
                  >
                    <TrashIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 text-xs text-muted-foreground">
          {songs.length} song{songs.length === 1 ? "" : "s"} saved locally
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
