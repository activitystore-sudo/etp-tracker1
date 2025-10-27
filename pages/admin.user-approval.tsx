import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useUsersQuery, useUpdateUserStatusMutation } from '../helpers/adminApi';
import { UserForAdmin } from '../endpoints/admin/users_GET.schema';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs';
import { toast } from "sonner";
import styles from "./admin.user-approval.module.css";

type StatusFilter = UserForAdmin["status"] | "all";

const UserTable: React.FC<{users: UserForAdmin[];onUpdate: (userId: number, status: 'approved' | 'rejected') => void;isUpdating: boolean;}> = ({ users, onUpdate, isUpdating }) => {
  if (users.length === 0) {
    return <div className={styles.emptyState}>No users found for this filter.</div>;
  }

  const getStatusVariant = (status: UserForAdmin["status"]): React.ComponentProps<typeof Badge>['variant'] => {
    switch (status) {
      case 'approved':return 'success';
      case 'pending':return 'warning';
      case 'rejected':return 'destructive';
      default:return 'default';
    }
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Display Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Registered On</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) =>
        <tr key={user.id}>
            <td>{user.displayName}</td>
            <td>{user.email}</td>
            <td><Badge variant="secondary">{user.role}</Badge></td>
            <td>
              <Badge variant={getStatusVariant(user.status)}>
                {user.status}
              </Badge>
            </td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
              {user.status === 'pending' &&
            <div className={styles.actions}>
                  <Button size="sm" onClick={() => onUpdate(user.id, 'approved')} disabled={isUpdating}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => onUpdate(user.id, 'rejected')} disabled={isUpdating}>Reject</Button>
                </div>
            }
            </td>
          </tr>
        )}
      </tbody>
    </table>);

};

const UserTableSkeleton: React.FC = () =>
<div className={styles.skeletonContainer}>
    {[...Array(5)].map((_, i) =>
  <div key={i} className={styles.skeletonRow}>
        <Skeleton style={{ height: '24px', width: '15%' }} />
        <Skeleton style={{ height: '24px', width: '25%' }} />
        <Skeleton style={{ height: '24px', width: '10%' }} />
        <Skeleton style={{ height: '24px', width: '10%' }} />
        <Skeleton style={{ height: '24px', width: '15%' }} />
        <Skeleton style={{ height: '24px', width: '20%' }} />
      </div>
  )}
  </div>;


const UserApprovalPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
    const { data: users, isLoading, isError, error } = useUsersQuery(statusFilter === "all" ? undefined : (statusFilter as "pending" | "approved" | "rejected"));
  const { mutate: updateUserStatus, isPending: isUpdatingStatus } = useUpdateUserStatusMutation();

  const handleUpdateStatus = (userId: number, status: 'approved' | 'rejected') => {
    updateUserStatus({ userId, status }, {
      onSuccess: () => {
        toast.success(`User has been ${status}.`);
      },
      onError: (err) => {
        if (err instanceof Error) {
          toast.error(`Failed to update user: ${err.message}`);
        } else {
          toast.error("An unknown error occurred.");
        }
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <meta name="description" content="Admin panel for user approval and management." />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>User Management</h1>
          <p>Approve or reject new user registrations.</p>
        </header>

        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)} className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Users</TabsTrigger>
          </TabsList>
        </Tabs>

        <main className={styles.content}>
          {isLoading && <UserTableSkeleton />}
          {isError && <div className={styles.errorState}>Error: {error.message}</div>}
          {users && <UserTable users={users} onUpdate={handleUpdateStatus} isUpdating={isUpdatingStatus} />}
        </main>
      </div>
    </>);

};

export default UserApprovalPage;