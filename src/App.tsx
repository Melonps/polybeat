import { useMemo, useState } from "react";
import { CountInControls } from "@/components/count-in-controls";
import { Legend } from "@/components/legend";
import { LoopControls } from "@/components/loop-controls";
import { SectionEditor } from "@/components/section-editor";
import { SongLibrary } from "@/components/song-library";
import { SongNameEditor } from "@/components/song-name-editor";
import { Timeline } from "@/components/timeline";
import { TransportControls } from "@/components/transport-controls";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Section } from "@/domain";
import { useMetronome } from "@/hooks/useMetronome";
import { useSongLibrary } from "@/hooks/useSongLibrary";

export function App() {
  const {
    songs,
    selectedSong,
    selectedId,
    selectSong,
    createSong,
    deleteSong,
    renameSong,
    setBpm,
    setTempoUnit,
    setLoop,
    setCountIn,
    addSection,
    updateSection,
    deleteSection,
  } = useSongLibrary();

  const { isPlaying, position, toggle } = useMetronome(selectedSong);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const totalSections = selectedSong?.sections.length ?? 0;
  const hasSong = selectedSong !== null;

  const editorSection = useMemo(() => {
    if (!editingSection || !selectedSong) {
      return null;
    }
    return selectedSong.sections.find((section) => section.id === editingSection.id) ?? null;
  }, [editingSection, selectedSong]);

  return (
    <SidebarProvider>
      <SongLibrary
        songs={songs}
        selectedId={selectedId}
        selectedSong={selectedSong}
        onSelect={selectSong}
        onCreate={createSong}
        onDelete={deleteSong}
        onRenameSelected={(name) => {
          if (selectedSong) {
            renameSong(selectedSong.id, name);
          }
        }}
      />
      <SidebarInset>
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            {hasSong ? (
              <SongNameEditor
                className="hidden flex-1 md:block"
                name={selectedSong.name}
                onSave={(name) => renameSong(selectedSong.id, name)}
              />
            ) : null}
          </div>

          {!hasSong || !selectedSong ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-12 text-sm text-muted-foreground">
              左のサイドバーから楽曲を選択するか、New Song で作成してください。
            </div>
          ) : (
            <>
              <TransportControls
                song={selectedSong}
                isPlaying={isPlaying}
                position={position}
                onToggle={toggle}
                onBpmChange={(bpm) => setBpm(selectedSong.id, bpm)}
                onTempoUnitChange={(unit) => setTempoUnit(selectedSong.id, unit)}
              />

              <Timeline
                song={selectedSong}
                isPlaying={isPlaying}
                position={position}
                onAddSection={() => addSection(selectedSong.id)}
                onEditSection={setEditingSection}
                onDeleteSection={(sectionId) => deleteSection(selectedSong.id, sectionId)}
                onMeasureCountChange={(sectionId, measureCount) =>
                  updateSection(selectedSong.id, sectionId, (section) => ({
                    ...section,
                    measureCount,
                  }))
                }
              />

              {totalSections > 0 ? (
                <LoopControls
                  song={selectedSong}
                  onLoopChange={(loop) => setLoop(selectedSong.id, loop)}
                />
              ) : null}

              <CountInControls
                countIn={selectedSong.countIn}
                onChange={(countIn) => setCountIn(selectedSong.id, countIn)}
              />

              <Legend />
            </>
          )}
        </div>
      </SidebarInset>

      <SectionEditor
        section={editorSection}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSection(null);
          }
        }}
        onSave={(section) => {
          if (selectedSong) {
            updateSection(selectedSong.id, section.id, () => section);
          }
        }}
      />
    </SidebarProvider>
  );
}

export default App;
