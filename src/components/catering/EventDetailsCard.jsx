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
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-sm text-muted-foreground">{event.client}</p>
            </div>
            <CustomBadge
              variant={getStatusBadgeVariant(event.status)}
              className="capitalize w-fit"
            >
              {event.status.replace('-', ' ')}
            </CustomBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                Date & Time
              </div>
              <p className="text-sm">
                {event.date}
                <br />
                {event.time}
              </p>
            </div>

            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Map className="h-4 w-4 text-primary" />
                Location
              </div>
              <p className="text-sm">{event.location}</p>
            </div>

            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Users className="h-4 w-4 text-primary" />
                Attendees
              </div>
              <p className="text-sm">{event.attendees} guests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Contact Person</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{event.contactPerson.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{event.contactPerson.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Financial Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Total: <span className="font-medium">${event.total.toFixed(2)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Deposit: <span className="font-medium">${(event.deposit || event.total * 0.5).toFixed(2)}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      event.depositPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.depositPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};