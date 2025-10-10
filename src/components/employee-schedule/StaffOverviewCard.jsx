import React, { useMemo } from 'react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

const StaffOverviewCard = ({ employeeList, schedule }) => {
  const weeklyHoursByEmployee = useMemo(() => {
    const mapping = new Map();
    schedule.forEach((entry) => {
      if (!entry.employeeId) return;
      const start = new Date(`1970-01-01T${entry.startTime}`);
      const end = new Date(`1970-01-01T${entry.endTime}`);
      const diffHours = Math.max(
        0,
        (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      );
      mapping.set(
        entry.employeeId,
        (mapping.get(entry.employeeId) || 0) + diffHours
      );
    });
    return mapping;
  }, [schedule]);

  return (
    <FeaturePanelCard
      badgeText="Staff Overview"
      description="Current team members and their positions"
      contentClassName="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {employeeList.map((employee) => {
          const weeklyHours = weeklyHoursByEmployee.get(employee.id) || 0;
          return (
            <div
              key={employee.id}
              className="flex flex-col rounded-lg border bg-card p-4"
            >
              <div className="mb-4 flex items-center">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.position}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly Rate:</span>
                  <span>{pesoFormatter.format(employee.hourlyRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="max-w-[150px] truncate">
                    {employee.contact}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Hours:</span>
                  <span>{weeklyHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          );
        })}
        {employeeList.length === 0 && (
          <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No active team members to display.
          </div>
        )}
      </div>
    </FeaturePanelCard>
  );
};

export default StaffOverviewCard;
