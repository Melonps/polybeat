import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type CountIn,
  type Loop,
  Section,
  type SectionId,
  type Song,
  type SongId,
  SongRepository,
} from "@/domain";

/** Owns the song library: CRUD operations, selection, and localStorage persistence. */
export function useSongLibrary() {
  const [songs, setSongs] = useState<Song[]>(() => SongRepository.load());
  const [selectedId, setSelectedId] = useState<SongId | null>(() => songs[0]?.id ?? null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    SongRepository.save(songs);
  }, [songs]);

  const selectedSong = useMemo(
    () => songs.find((song) => song.id === selectedId) ?? null,
    [songs, selectedId],
  );

  const selectSong = useCallback((id: SongId) => {
    setSelectedId(id);
  }, []);

  const createSong = useCallback(() => {
    const song = SongRepository.createBlankSong(`Song ${new Date().toLocaleTimeString()}`);
    setSongs((prev) => [...prev, song]);
    setSelectedId(song.id);
    return song;
  }, []);

  const deleteSong = useCallback((id: SongId) => {
    setSongs((prev) => {
      const next = prev.filter((song) => song.id !== id);
      setSelectedId((currentSelected) =>
        currentSelected !== id ? currentSelected : (next[0]?.id ?? null),
      );
      return next;
    });
  }, []);

  const updateSong = useCallback((id: SongId, updater: (song: Song) => Song) => {
    setSongs((prev) => prev.map((song) => (song.id === id ? updater(song) : song)));
  }, []);

  const renameSong = useCallback(
    (id: SongId, name: string) => {
      updateSong(id, (song) => ({ ...song, name }));
    },
    [updateSong],
  );

  const setBpm = useCallback(
    (id: SongId, bpm: number) => {
      updateSong(id, (song) => ({ ...song, bpm }));
    },
    [updateSong],
  );

  const setTempoUnit = useCallback(
    (id: SongId, tempoUnit: Song["tempoUnit"]) => {
      updateSong(id, (song) => ({ ...song, tempoUnit }));
    },
    [updateSong],
  );

  const setLoop = useCallback(
    (id: SongId, loop: Loop) => {
      updateSong(id, (song) => ({ ...song, loop }));
    },
    [updateSong],
  );

  const setCountIn = useCallback(
    (id: SongId, countIn: CountIn) => {
      updateSong(id, (song) => ({ ...song, countIn }));
    },
    [updateSong],
  );

  const addSection = useCallback(
    (id: SongId) => {
      updateSong(id, (song) => ({
        ...song,
        sections: [...song.sections, Section.create()],
      }));
    },
    [updateSong],
  );

  const updateSection = useCallback(
    (id: SongId, sectionId: SectionId, updater: (section: Section) => Section) => {
      updateSong(id, (song) => ({
        ...song,
        sections: song.sections.map((section) =>
          section.id === sectionId ? updater(section) : section,
        ),
      }));
    },
    [updateSong],
  );

  const deleteSection = useCallback(
    (id: SongId, sectionId: SectionId) => {
      updateSong(id, (song) => ({
        ...song,
        sections: song.sections.filter((section) => section.id !== sectionId),
      }));
    },
    [updateSong],
  );

  /** Replaces a song's entire content (e.g. from a YAML import) while keeping its existing id/selection. */
  const replaceSong = useCallback(
    (id: SongId, replacement: Song) => {
      updateSong(id, () => ({ ...replacement, id }));
    },
    [updateSong],
  );

  const duplicateSection = useCallback(
    (id: SongId, sectionId: SectionId) => {
      updateSong(id, (song) => {
        const index = song.sections.findIndex((section) => section.id === sectionId);
        if (index < 0) {
          return song;
        }
        const copy = Section.duplicate(song.sections[index]);
        const sections = [...song.sections];
        sections.splice(index + 1, 0, copy);
        return { ...song, sections };
      });
    },
    [updateSong],
  );

  /** Moves the section identified by `fromId` to just before the section identified by `toId`. */
  const reorderSections = useCallback(
    (id: SongId, fromId: SectionId, toId: SectionId) => {
      updateSong(id, (song) => {
        const fromIndex = song.sections.findIndex((section) => section.id === fromId);
        const toIndex = song.sections.findIndex((section) => section.id === toId);
        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
          return song;
        }
        const sections = [...song.sections];
        const [moved] = sections.splice(fromIndex, 1);
        const insertAt = sections.findIndex((section) => section.id === toId);
        sections.splice(insertAt, 0, moved);
        return { ...song, sections };
      });
    },
    [updateSong],
  );

  return {
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
    duplicateSection,
    reorderSections,
    replaceSong,
  };
}
