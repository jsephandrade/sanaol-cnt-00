import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  CalendarDays,
  Users,
  MapPin,
  User,
  Phone,
  Banknote,
  X,
} from 'lucide-react';

export const EventDetailsModal = ({ open, onOpenChange, event }) => {
  if (!event) return null;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Event Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">{event.client}</p>
                </div>
                <CustomBadge
                  variant={getStatusBadgeVariant(event.status)}
                  className="capitalize"
                >
                  {event.status.replace('-', ' ')}
                </CustomBadge>
              </div>
            </CardHeader>
          </Card>

          {/* Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{event.date}</p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{event.attendees} people</p>
                <p className="text-sm text-muted-foreground">Expected guests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{event.location}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Total:</span>
                  <span className="font-medium">${event.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Per person:</span>
                  <span className="font-medium">
                    ${(event.total / event.attendees).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium">
                    {getInitials(event.contactPerson.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{event.contactPerson.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{event.contactPerson.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
