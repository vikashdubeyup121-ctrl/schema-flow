import { useMutation } from '@tanstack/react-query';
import { createProject, updateProject, deleteProject } from '../api/mutations';
import { Toast } from '@/shared/stores/toast.store';
import { friendlyMessage } from '@/shared/api/errorHandler';
import type { ApiClientError } from '@/shared/api/types';

export function useProjectMutations() {
  const create = useMutation({
    mutationFn: (name: string) => createProject(name),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateProject(id, name),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  return { create, update, remove };
}
