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
import { AddUserModal } from './users/AddUserModal';
import { EditUserModal } from './users/EditUserModal';
import { RoleConfigModal } from './users/RoleConfigModal';

const Users = () => {
  const { toast } = useToast();
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
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and access</CardDescription>
            </div>
            <Button
              size="sm"
              className="flex gap-1"
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

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">User</th>
                      <th className="h-10 px-4 text-left font-medium">Role</th>
                      <th className="h-10 px-4 text-left font-medium">
                        Status
                      </th>
                      <th className="h-10 px-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant={getRoleBadgeVariant(user.role)}
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <div
                                className={`mr-2 h-2.5 w-2.5 rounded-full ${
                                  user.status === 'active'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }`}
                              ></div>
                              <span className="text-sm capitalize">
                                {user.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeactivateUser(user.id)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  {user.status === 'active'
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="h-24 text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t py-3">
            <div className="text-xs text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Configure user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <h4 className="font-medium capitalize">{role.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Configure
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Currently active system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {users.map(
                (user, index) =>
                  index < 5 && (
                    <div key={user.id} className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        variant="outline"
                        className="flex gap-1 items-center"
                      >
                        <UserCheck className="h-3 w-3" />{' '}
                        {user.name.split(' ')[0]}
                      </Badge>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
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
