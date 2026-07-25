import { useQuery, useMutation } from '@tanstack/react-query';
import { projectMembersQueryOptions } from '../api/queries';
import { addMember, removeMember, updateMemberRole } from '../api/mutations';

export function useProjectMembers(projectId: string) {
  const { data: members, isLoading, error } = useQuery({
    ...projectMembersQueryOptions(projectId),
    enabled: !!projectId,
  });

  const add = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'EDITOR' | 'VIEWER' }) => addMember(projectId, email, role),
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'EDITOR' | 'VIEWER' }) => updateMemberRole(projectId, userId, role),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeMember(projectId, userId),
  });

  return { members, isLoading, error, add, updateRole, remove };
}
