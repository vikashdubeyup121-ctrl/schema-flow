import { create } from 'zustand';
import type { RelationshipData } from '../types/Relationship';

interface RelationshipState {
  relationships: Record<string, RelationshipData>;
  addRelationship: (data: RelationshipData) => void;
  updateRelationship: (id: string, update: Partial<Omit<RelationshipData, 'id'>>) => void;
  removeRelationship: (id: string) => void;
  getRelationship: (id: string) => RelationshipData | undefined;
  getAllRelationships: () => RelationshipData[];
}

export const useRelationshipStore = create<RelationshipState>((set, get) => ({
  relationships: {},

  addRelationship: (data) =>
    set((state) => ({ relationships: { ...state.relationships, [data.id]: data } })),

  updateRelationship: (id, update) =>
    set((state) => {
      const existing = state.relationships[id];
      if (!existing) return state;
      return { relationships: { ...state.relationships, [id]: { ...existing, ...update } } };
    }),

  removeRelationship: (id) =>
    set((state) => {
      const next = { ...state.relationships };
      delete next[id];
      return { relationships: next };
    }),

  getRelationship: (id) => get().relationships[id],

  getAllRelationships: () => Object.values(get().relationships),
}));
