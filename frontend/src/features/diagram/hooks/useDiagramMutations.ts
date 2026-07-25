import { useMutation } from '@tanstack/react-query';
import { createDiagram, updateDiagram, deleteDiagram } from '../api/mutations';

export function useDiagramMutations() {
  const create = useMutation({
    mutationFn: ({ name, projectId }: { name: string; projectId: string }) =>
      createDiagram(name, projectId),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      name,
      projectId,
    }: {
      id: string;
      name: string;
      projectId: string;
    }) => updateDiagram(id, name, projectId),
  });

  const remove = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      deleteDiagram(id, projectId),
  });

  return { create, update, remove };
}
