import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AddUserModal } from './users/AddUserModal';
import { EditUserModal } from './users/EditUserModal';
import { RoleConfigModal } from './users/RoleConfigModal';
import { UserTable } from './users/UserTable';
import { RoleManagement } from './users/RoleManagement';
import { ActiveUsersList } from './users/ActiveUsersList';
import { UsersHeader } from './users/UsersHeader';
import { UsersSearch } from './users/UsersSearch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { UsersFooter } from './users/UsersFooter';
import { useUserManagement, useRoles } from '@/hooks/useUserManagement';
import { PendingVerifications } from './users/PendingVerifications';
import { useDebouncedValue } from '@/hooks/useDebounce';
import TableSkeleton from '@/components/shared/TableSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { useAuth } from '@/components/AuthContext';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const [roleFilter, setRoleFilter] = useState('');
  const {
    users,
    pagination,
    loading,
    fetching,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
  } = useUserManagement({ search: debouncedSearch, role: roleFilter });
  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    updateRoleConfig,
  } = useRoles();
  const { hasAnyRole } = useAuth();
  const showVerifyQueue = hasAnyRole(['admin', 'manager']);
  const isAdmin = hasAnyRole(['admin']);

  // Data is fetched with search term via hook; no local filtering needed

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'staff':
        return 'secondary';
      case 'cashier':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAddUser = async (newUser) => {
    const res = await createUser.mutateAsync(newUser);
    if (newUser?.sendInvite && newUser?.email) {
      try {
        const { authService } = await import('@/api/services/authService');
        await authService.forgotPassword(newUser.email);
      } catch {}
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    await updateUser.mutateAsync({
      userId: updatedUser.id,
      updates: updatedUser,
    });
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser.mutateAsync(userId);
  };

  const handleDeactivateUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const status = user.status === 'active' ? 'deactivated' : 'active';
    await updateUserStatus.mutateAsync({ userId, status });
  };

  const handleConfigureRole = (role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async (updatedRole) => {
    await updateRoleConfig.mutateAsync(updatedRole);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <UsersHeader
            onAddClick={() => setShowAddModal(true)}
            canAdd={hasAnyRole(['admin'])}
          />
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex-1 min-w-[220px]">
                <UsersSearch
                  searchTerm={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                />
              </div>
              <div className="w-full sm:w-[220px]">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading || fetching ? (
              <TableSkeleton
                headers={['User', 'Role', 'Status', 'Actions']}
                rows={5}
              />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <UserTable
                users={users}
                onEditUser={(user) => {
                  setSelectedUser(user);
                  setShowEditModal(true);
                }}
                onDeactivateUser={handleDeactivateUser}
                onDeleteUser={handleDeleteUser}
                getRoleBadgeVariant={getRoleBadgeVariant}
                getInitials={getInitials}
                isAdmin={isAdmin}
              />
            )}
          </CardContent>
          <UsersFooter
            showing={users.length}
            total={pagination?.total || users.length}
          />
        </Card>

        {/* Admin/Manager-only: show verification queue below the Users card */}
        {showVerifyQueue && <PendingVerifications />}
      </div>

      <div className="space-y-4">
        {rolesLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="w-full">
                      <div className="h-4 w-40 bg-muted rounded mb-2" />
                      <div className="h-3 w-60 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : rolesError ? (
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorState message={rolesError} />
            </CardContent>
          </Card>
        ) : (
          <RoleManagement roles={roles} onConfigureRole={handleConfigureRole} />
        )}

        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>Currently active system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-6 w-6 rounded-full bg-muted" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <ActiveUsersList users={users} getInitials={getInitials} />
        )}
      </div>

      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        user={selectedUser}
        onUpdateUser={handleUpdateUser}
      />

      <RoleConfigModal
        open={showRoleModal}
        onOpenChange={setShowRoleModal}
        role={selectedRole}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  );
};

export default Users;
