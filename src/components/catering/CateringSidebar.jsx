import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    const fallback = Number(value ?? 0);
    const formatted = Number.isFinite(fallback) ? fallback.toFixed(2) : '0.00';
    return `PHP ${formatted}`;
  }
};

const getItemImage = (item) => {
  if (!item || typeof item !== 'object') return '';
  const imageKeys = ['image', 'imageUrl', 'image_url', 'photo', 'picture'];
  for (const key of imageKeys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return '';
};

export const CateringSidebar = ({
  cateringMenu = [],
  upcomingEvents = [],
  onViewFullMenu,
  isMenuLoading = false,
}) => {
  const hasMenuItems = Array.isArray(cateringMenu) && cateringMenu.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Catering Menu</CardTitle>
          <CardDescription>Available catering options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isMenuLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : hasMenuItems ? (
              cateringMenu.slice(0, 3).map((item) => {
                const imageSrc = getItemImage(item);
                const fallbackInitial =
                  (item?.name || '?').trim().charAt(0).toUpperCase() || '?';

                return (
                  <div
                    key={item.id ?? item.name}
                    className="flex items-start gap-3 border-b pb-2 last:border-0"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item?.name || 'Menu item'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                          {fallbackInitial}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category || 'Uncategorized'}
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No catering menu items available.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-1"
              onClick={onViewFullMenu}
              disabled={isMenuLoading || !hasMenuItems}
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
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.dateLabel || event.date || 'TBD'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.time}
                  </span>
                </div>
                <h4 className="text-sm font-medium">{event.name}</h4>
                <p className="text-xs text-muted-foreground">{event.client}</p>
              </div>
            ))}
            {!upcomingEvents.length && (
              <p className="text-sm text-muted-foreground">
                No upcoming events scheduled.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CateringSidebar;
