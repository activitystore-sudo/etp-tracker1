import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers, InputType as GetUsersInput } from '../endpoints/admin/users_GET.schema';
import { postApproveUser, InputType as UpdateStatusInput } from '../endpoints/admin/approve_user_POST.schema';
import { User } from './User';

// Query Keys
const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userLists: () => [...adminKeys.users(), 'list'] as const,
  userList: (filters: GetUsersInput) => [...adminKeys.userLists(), filters] as const,
};

/**
 * Query hook to fetch a list of users, with optional status filter.
 */
export const useUsersQuery = (status?: User['status']) => {
  const filters = { status };
  return useQuery({
    queryKey: adminKeys.userList(filters),
    queryFn: () => getUsers(filters),
  });
};

/**
 * Mutation hook to update a user's status (approve/reject).
 * Invalidates all user list queries on success.
 */
export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStatusInput) => postApproveUser(data),
    onSuccess: () => {
      // Invalidate all user list queries to ensure the UI is up-to-date
      queryClient.invalidateQueries({ queryKey: adminKeys.userLists() });
    },
  });
};