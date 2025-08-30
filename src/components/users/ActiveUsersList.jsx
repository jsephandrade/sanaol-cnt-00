import React from 'react';
import { UserCheck } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const ActiveUsersList = ({ users, getInitials }) => {
  const activeUsers = users.filter(user => user.status === 'active');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Currently active system users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {activeUsers.slice(0, 5).map((user) => (
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
                <UserCheck className="h-3 w-3" />
                {user.name.split(' ')[0]}
              </Badge>
            </div>
          ))}
          {activeUsers.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{activeUsers.length - 5} more
            </Badge>
          )}
        </div>
        {activeUsers.length === 0 && (
          <p className="text-sm text-muted-foreground">No active users found</p>
        )}
      </CardContent>
    </Card>
  );
};