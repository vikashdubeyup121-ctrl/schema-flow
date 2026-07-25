import { create } from 'zustand';
import type { TableData } from '../types/Table';

interface TableState {
  tables: Record<string, TableData>;
  addTable: (data: TableData) => void;
  updateTable: (id: string, update: Partial<Omit<TableData, 'id'>>) => void;
  removeTable: (id: string) => void;
  getTable: (id: string) => TableData | undefined;
  getAllTables: () => TableData[];
}

export const useTableStore = create<TableState>((set, get) => ({
  tables: {},

  addTable: (data) =>
    set((state) => ({ tables: { ...state.tables, [data.id]: data } })),

  updateTable: (id, update) =>
    set((state) => {
      const existing = state.tables[id];
      if (!existing) return state;
      return { tables: { ...state.tables, [id]: { ...existing, ...update } } };
    }),

  removeTable: (id) =>
    set((state) => {
      const next = { ...state.tables };
      delete next[id];
      return { tables: next };
    }),

  getTable: (id) => get().tables[id],

  getAllTables: () => Object.values(get().tables),
}));
