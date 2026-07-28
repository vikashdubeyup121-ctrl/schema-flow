import { useMutation } from '@tanstack/react-query';
import { createDiagram, updateDiagram, deleteDiagram } from '../api/mutations';
import { Toast } from '@/shared/stores/toast.store';
import { friendlyMessage } from '@/shared/api/errorHandler';
import type { ApiClientError } from '@/shared/api/types';

export function useDiagramMutations() {
  const create = useMutation({
    mutationFn: ({ name, projectId }: { name: string; projectId: string }) =>
      createDiagram(name, projectId),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
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
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      deleteDiagram(id, projectId),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  return { create, update, remove };
}
