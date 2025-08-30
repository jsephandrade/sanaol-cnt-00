import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AddUserModal } from './users/AddUserModal';
import { EditUserModal } from './users/EditUserModal';
import { RoleConfigModal } from './users/RoleConfigModal';
import { UserTable } from './users/UserTable';
import { RoleManagement } from './users/RoleManagement';
import { ActiveUsersList } from './users/ActiveUsersList';

const Users = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@canteen.com',
      role: 'admin',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@canteen.com',
      role: 'manager',
      status: 'active',
    },
    {
      id: '3',
      name: 'Miguel Rodriguez',
      email: 'miguel@canteen.com',
      role: 'staff',
      status: 'active',
    },
    {
      id: '4',
      name: 'Aisha Patel',
      email: 'aisha@canteen.com',
      role: 'cashier',
      status: 'active',
    },
    {
      id: '5',
      name: 'David Chen',
      email: 'david@canteen.com',
      role: 'staff',
      status: 'active',
    },
  ]);

  const [roles] = useState([
    {
      label: 'Admin',
      value: 'admin',
      description: 'Full access to all settings and functions',
    },
    {
      label: 'Manager',
      value: 'manager',
      description: 'Can manage most settings and view reports',
    },
    {
      label: 'Staff',
      value: 'staff',
      description: 'Kitchen and service staff access',
    },
    {
      label: 'Cashier',
      value: 'cashier',
      description: 'POS and payment access only',
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddUser = (newUser) => {
    const user = {
      ...newUser,
      id: (users.length + 1).toString(),
      status: 'active',
    };
    setUsers([...users, user]);
    toast({
      title: 'User Added',
      description: `${user.name} has been added successfully.`,
    });
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(
      users.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
    toast({
      title: 'User Updated',
      description: `${updatedUser.name}'s information has been updated.`,
    });
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    setUsers(users.filter((u) => u.id !== userId));
    toast({
      title: 'User Deleted',
      description: `${user?.name} has been removed from the system.`,
      variant: 'destructive',
    });
  };

  const handleDeactivateUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, status: u.status === 'active' ? 'deactivated' : 'active' }
            : u
        )
      );
      const newStatus = user.status === 'active' ? 'deactivated' : 'activated';
      toast({
        title: `User ${
          newStatus === 'deactivated' ? 'Deactivated' : 'Activated'
        }`,
        description: `${user.name} has been ${newStatus}.`,
      });
    }
  };

  const handleConfigureRole = (role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = (updatedRole) => {
    toast({
      title: 'Role Updated',
      description: `${updatedRole.label} role configuration has been updated.`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage system users, roles, and permissions</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription>Manage system users and access</CardDescription>
              </div>
              <Button
                size="sm"
                className="flex gap-1 w-full sm:w-auto"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <UserTable
              users={filteredUsers}
              onEditUser={(user) => {
                setSelectedUser(user);
                setShowEditModal(true);
              }}
              onDeactivateUser={handleDeactivateUser}
              onDeleteUser={handleDeleteUser}
              getRoleBadgeVariant={getRoleBadgeVariant}
              getInitials={getInitials}
              isMobile={isMobile}
            />
          </CardContent>
          <CardFooter className="border-t py-3">
            <div className="text-xs text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <RoleManagement 
          roles={roles} 
          onConfigureRole={handleConfigureRole} 
        />

        <ActiveUsersList 
          users={users} 
          getInitials={getInitials} 
        />
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
