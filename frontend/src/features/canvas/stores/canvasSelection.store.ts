import { create } from 'zustand';

interface SelectionState {
  selectedTableIds: Set<string>;
  selectedRelationshipIds: Set<string>;
  selectedNoteIds: Set<string>;

  selectTable: (id: string, multi?: boolean) => void;
  selectRelationship: (id: string, multi?: boolean) => void;
  selectNote: (id: string, multi?: boolean) => void;
  selectMultipleTables: (ids: string[]) => void;
  deselectAll: () => void;

  isTableSelected: (id: string) => boolean;
  isRelationshipSelected: (id: string) => boolean;
  isNoteSelected: (id: string) => boolean;
  hasSelection: () => boolean;
  primarySelectedTableId: () => string | null;
  primarySelectedRelationshipId: () => string | null;
  primarySelectedNoteId: () => string | null;
}

export const useCanvasSelectionStore = create<SelectionState>((set, get) => ({
  selectedTableIds: new Set(),
  selectedRelationshipIds: new Set(),
  selectedNoteIds: new Set(),

  selectTable: (id, multi = false) =>
    set((state) => {
      if (multi) {
        const next = new Set(state.selectedTableIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedTableIds: next };
      }
      return {
        selectedTableIds: new Set([id]),
        selectedRelationshipIds: new Set(),
        selectedNoteIds: new Set(),
      };
    }),

  selectRelationship: (id, multi = false) =>
    set((state) => {
      if (multi) {
        const next = new Set(state.selectedRelationshipIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedRelationshipIds: next };
      }
      return {
        selectedTableIds: new Set(),
        selectedRelationshipIds: new Set([id]),
        selectedNoteIds: new Set(),
      };
    }),

  selectNote: (id, multi = false) =>
    set((state) => {
      if (multi) {
        const next = new Set(state.selectedNoteIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { selectedNoteIds: next };
      }
      return {
        selectedTableIds: new Set(),
        selectedRelationshipIds: new Set(),
        selectedNoteIds: new Set([id]),
      };
    }),

  selectMultipleTables: (ids) =>
    set({
      selectedTableIds: new Set(ids),
      selectedRelationshipIds: new Set(),
      selectedNoteIds: new Set(),
    }),

  deselectAll: () =>
    set({
      selectedTableIds: new Set(),
      selectedRelationshipIds: new Set(),
      selectedNoteIds: new Set(),
    }),

  isTableSelected: (id) => get().selectedTableIds.has(id),
  isRelationshipSelected: (id) => get().selectedRelationshipIds.has(id),
  isNoteSelected: (id) => get().selectedNoteIds.has(id),

  hasSelection: () => {
    const { selectedTableIds, selectedRelationshipIds, selectedNoteIds } = get();
    return (
      selectedTableIds.size > 0 ||
      selectedRelationshipIds.size > 0 ||
      selectedNoteIds.size > 0
    );
  },

  primarySelectedTableId: () => {
    const [first] = get().selectedTableIds;
    return first ?? null;
  },

  primarySelectedRelationshipId: () => {
    const [first] = get().selectedRelationshipIds;
    return first ?? null;
  },

  primarySelectedNoteId: () => {
    const [first] = get().selectedNoteIds;
    return first ?? null;
  },
}));
