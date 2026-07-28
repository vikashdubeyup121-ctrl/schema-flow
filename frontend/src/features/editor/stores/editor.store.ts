import { create } from 'zustand';

export const DEFAULT_DSL = `// Define your schema below
// Changes sync to the canvas in real time

Table users {
  id uuid [pk]
  email varchar [not null, unique]
  name varchar
  created_at timestamp [default: \`now()\`]
}

Table posts {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  title varchar [not null]
  body text
  created_at timestamp [default: \`now()\`]
}
`;

interface EditorState {
  dslText: string;
  isOpen: boolean;
  width: number;

  setDslText: (text: string) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  dslText: DEFAULT_DSL,
  isOpen: true,
  width: 320,

  setDslText: (text) => set({ dslText: text }),
  toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
  setSidebarWidth: (width) => set({ width }),
}));
