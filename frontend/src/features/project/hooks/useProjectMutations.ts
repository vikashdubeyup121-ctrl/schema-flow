import { useMutation } from '@tanstack/react-query';
import { createProject, updateProject, deleteProject } from '../api/mutations';

export function useProjectMutations() {
  const create = useMutation({
    mutationFn: (name: string) => createProject(name),
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateProject(id, name),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProject(id),
  });

  return { create, update, remove };
}
