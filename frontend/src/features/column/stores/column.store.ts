import { create } from 'zustand';
import type { ColumnData } from '../types/Column';

interface ColumnState {
  columns: Record<string, ColumnData>;
  addColumn: (data: ColumnData) => void;
  updateColumn: (id: string, update: Partial<Omit<ColumnData, 'id'>>) => void;
  removeColumn: (id: string) => void;
  removeTableColumns: (tableId: string) => void;
  getColumn: (id: string) => ColumnData | undefined;
  getTableColumns: (tableId: string) => ColumnData[];
}

export const useColumnStore = create<ColumnState>((set, get) => ({
  columns: {},

  addColumn: (data) =>
    set((state) => ({ columns: { ...state.columns, [data.id]: data } })),

  updateColumn: (id, update) =>
    set((state) => {
      const existing = state.columns[id];
      if (!existing) return state;
      return { columns: { ...state.columns, [id]: { ...existing, ...update } } };
    }),

  removeColumn: (id) =>
    set((state) => {
      const next = { ...state.columns };
      delete next[id];
      return { columns: next };
    }),

  removeTableColumns: (tableId) =>
    set((state) => {
      const next = Object.fromEntries(
        Object.entries(state.columns).filter(([, col]) => col.tableId !== tableId),
      );
      return { columns: next };
    }),

  getColumn: (id) => get().columns[id],

  getTableColumns: (tableId) =>
    Object.values(get().columns)
      .filter((col) => col.tableId === tableId)
      .sort((a, b) => a.position - b.position),
}));
