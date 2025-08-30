import React from 'react';
import { 
  CalendarDays, 
  Map, 
  Users, 
  Phone, 
  User, 
  Banknote 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';

export const EventDetailsCard = ({ event, getStatusBadgeVariant }) => {
  if (!event) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>Next scheduled catering event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Event Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
              <p className="text-muted-foreground">{event.client}</p>
            </div>
            <CustomBadge
              variant={getStatusBadgeVariant(event.status)}
              className="capitalize w-fit"
            >
              {event.status.replace('-', ' ')}
            </CustomBadge>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <CalendarDays className="h-4 w-4" />
                Date & Time
              </div>
              <div className="text-foreground">
                <div className="font-medium">{event.date}</div>
                <div className="text-sm text-muted-foreground">{event.time}</div>
              </div>
            </div>

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <Map className="h-4 w-4" />
                Location
              </div>
              <div className="text-foreground">
                <div className="font-medium">{event.location}</div>
              </div>
            </div>

            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <Users className="h-4 w-4" />
                Attendees
              </div>
              <div className="text-foreground">
                <div className="font-medium">{event.attendees} people</div>
              </div>
            </div>
          </div>

          {/* Contact and Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Person */}
            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-3">
                <User className="h-4 w-4" />
                Contact Person
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                  {event.contactPerson.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-foreground">{event.contactPerson.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {event.contactPerson.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="bg-background border rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-3">
                <Banknote className="h-4 w-4" />
                Financial
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-foreground">${event.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Guest:</span>
                  <span className="font-medium text-foreground">${(event.total / event.attendees).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Paid:</span>
                  <span className="font-medium text-green-600">Yes (50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors">
              View Full Details
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              Generate Report
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};