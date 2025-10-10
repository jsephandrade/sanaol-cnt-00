import React from 'react';
import { Edit } from 'lucide-react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { Button } from '@/components/ui/button';

export const RoleManagement = ({ roles, onConfigureRole }) => {
  return (
    <FeaturePanelCard
      title="Role Management"
      description="Configure user roles and permissions"
      contentClassName="space-y-4"
    >
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
              onClick={() => onConfigureRole(role)}
            >
              <Edit className="h-4 w-4 mr-1" /> Configure
            </Button>
          </div>
        ))}
      </div>
    </FeaturePanelCard>
  );
};
