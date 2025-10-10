import React from 'react';
import { UserCheck } from 'lucide-react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const ActiveUsersList = ({ users, getInitials }) => {
  return (
    <FeaturePanelCard
      title="Active Users"
      description="Currently active system users"
      contentClassName="space-y-2"
    >
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
                <Badge variant="outline" className="flex gap-1 items-center">
                  <UserCheck className="h-3 w-3" />
                  {user.name.split(' ')[0]}
                </Badge>
              </div>
            )
        )}
      </div>
    </FeaturePanelCard>
  );
};
