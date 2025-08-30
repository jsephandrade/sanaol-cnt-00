import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CateringSidebar = ({ 
  cateringMenu, 
  upcomingEvents, 
  onViewFullMenu 
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Catering Menu</CardTitle>
          <CardDescription>Available catering options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cateringMenu.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <p className="text-sm font-semibold">${item.price}</p>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-1"
              onClick={onViewFullMenu}
            >
              View Full Menu <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Next scheduled catering events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.time}
                  </span>
                </div>
                <h4 className="font-medium text-sm">{event.name}</h4>
                <p className="text-xs text-muted-foreground">{event.client}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};