import React from 'react';
import { MoreVertical, Edit, Trash2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const UserTable = ({ 
  users, 
  onEditUser, 
  onDeactivateUser, 
  onDeleteUser,
  getRoleBadgeVariant,
  getInitials,
  isMobile = false
}) => {
  if (isMobile) {
    // Mobile card view
    return (
      <div className="grid gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeactivateUser(user.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className="capitalize text-xs"
                  >
                    {user.role}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className="text-xs capitalize">{user.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">User</th>
              <th className="h-10 px-4 text-left font-medium">Role</th>
              <th className="h-10 px-4 text-left font-medium">Status</th>
              <th className="h-10 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
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
                      <span className="text-sm capitalize">{user.status}</span>
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
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeactivateUser(user.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteUser(user.id)}
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
  );
};