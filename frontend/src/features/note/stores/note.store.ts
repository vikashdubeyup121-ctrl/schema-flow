import { create } from 'zustand';
import type { NoteData } from '../types/Note';

interface NoteState {
  notes: Record<string, NoteData>;
  addNote: (data: NoteData) => void;
  updateNote: (id: string, update: Partial<Omit<NoteData, 'id'>>) => void;
  removeNote: (id: string) => void;
  getNote: (id: string) => NoteData | undefined;
  getAllNotes: () => NoteData[];
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: {},

  addNote: (data) =>
    set((state) => ({ notes: { ...state.notes, [data.id]: data } })),

  updateNote: (id, update) =>
    set((state) => {
      const existing = state.notes[id];
      if (!existing) return state;
      return { notes: { ...state.notes, [id]: { ...existing, ...update } } };
    }),

  removeNote: (id) =>
    set((state) => {
      const next = { ...state.notes };
      delete next[id];
      return { notes: next };
    }),

  getNote: (id) => get().notes[id],

  getAllNotes: () => Object.values(get().notes),
}));
