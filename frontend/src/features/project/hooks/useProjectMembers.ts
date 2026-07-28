import { useQuery, useMutation } from '@tanstack/react-query';
import { projectMembersQueryOptions } from '../api/queries';
import { addMember, removeMember, updateMemberRole } from '../api/mutations';
import { Toast } from '@/shared/stores/toast.store';
import { friendlyMessage } from '@/shared/api/errorHandler';
import type { ApiClientError } from '@/shared/api/types';

export function useProjectMembers(projectId: string) {
  const { data: members, isLoading, error } = useQuery({
    ...projectMembersQueryOptions(projectId),
    enabled: !!projectId,
  });

  const add = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'EDITOR' | 'VIEWER' }) => addMember(projectId, email, role),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'EDITOR' | 'VIEWER' }) => updateMemberRole(projectId, userId, role),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeMember(projectId, userId),
    onError: (error: ApiClientError) => {
      Toast.error(friendlyMessage(error));
    },
  });

  return { members, isLoading, error, add, updateRole, remove };
}
