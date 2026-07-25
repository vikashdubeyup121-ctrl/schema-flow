import React, { useState } from 'react';
import { Modal, Button, Input, IconButton, Avatar, Badge, Spinner } from '@/shared/components';
import { Trash2, UserPlus } from 'lucide-react';
import { useProjectMembers } from '../../hooks/useProjectMembers';
import { useAuth } from '@/app/providers/AuthProvider';
import { Toast } from '@/shared/stores/toast.store';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  isOwner,
}) => {
  const { user: currentUser } = useAuth();
  const { members, isLoading, add, remove, updateRole } = useProjectMembers(projectId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await add.mutateAsync({ email, role });
      setEmail('');
      Toast.success('Member invited successfully');
    } catch (error: any) {
      Toast.error(error.message || 'Failed to invite member');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title={`Share "${projectName}"`}>
      <div className="space-y-6">
        {isOwner && (
          <form onSubmit={handleAddMember} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Invite by Email</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={add.isPending || !email}
              leftIcon={add.isPending ? <Spinner size="sm" /> : <UserPlus size={16} />}
            >
              Invite
            </Button>
          </form>
        )}

        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Collaborators</h4>
          {isLoading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : members?.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No collaborators yet.</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800">
              {members?.map((member) => (
                <li key={member.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user.name} src={member.user.pictureUrl || undefined} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {member.user.name}
                        {member.user.id === currentUser?.id && <Badge variant="default">You</Badge>}
                      </div>
                      <div className="text-xs text-slate-500">{member.user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && member.role !== 'OWNER' ? (
                      <>
                        <select
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm"
                          value={member.role}
                          onChange={(e) => updateRole.mutate({ userId: member.userId, role: e.target.value as 'EDITOR' | 'VIEWER' })}
                          disabled={updateRole.isPending}
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <IconButton
                          label="Remove member"
                          onClick={() => remove.mutate(member.userId)}
                          disabled={remove.isPending}
                          className="text-danger hover:bg-danger/10"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500 capitalize">{member.role.toLowerCase()}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};
