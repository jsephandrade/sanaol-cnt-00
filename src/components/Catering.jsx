import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  Utensils,
  CalendarDays,
  PlusCircle,
  MoreVertical,
  Clock,
  Users,
  Banknote,
  ClipboardCheck,
  Map,
  Phone,
  User,
  Search,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NewEventModal } from './catering/NewEventModal';
import { CalendarViewModal } from './catering/CalendarViewModal';
import { EventDetailsModal } from './catering/EventDetailsModal';
import { MenuItemsModal } from './catering/MenuItemsModal';
import { toast } from 'sonner';

const Catering = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('upcoming');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showStaffAssignmentModal, setShowStaffAssignmentModal] =
    useState(false);
  const [showMenuItemsModal, setShowMenuItemsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Corporate Lunch Meeting',
      client: 'ABC Technologies',
      date: '2025-04-20',
      time: '12:30 - 14:00',
      location: 'ABC Technologies HQ, Conference Room B',
      attendees: 25,
      status: 'scheduled',
      total: 625.0,
      contactPerson: {
        name: 'John Smith',
        phone: '555-123-4567',
      },
    },
    {
      id: '2',
      name: 'Executive Breakfast',
      client: 'Global Finance',
      date: '2025-04-21',
      time: '08:00 - 09:30',
      location: 'Global Finance Tower, 15th Floor',
      attendees: 12,
      status: 'scheduled',
      total: 360.0,
      contactPerson: {
        name: 'Maria Garcia',
        phone: '555-987-6543',
      },
    },
    {
      id: '3',
      name: 'Team Building Lunch',
      client: 'InnovateTech',
      date: '2025-05-05',
      time: '11:30 - 13:30',
      location: 'City Park Pavilion',
      attendees: 45,
      status: 'scheduled',
      total: 1125.0,
      contactPerson: {
        name: 'Alex Johnson',
        phone: '555-456-7890',
      },
    },
    {
      id: '4',
      name: 'Charity Gala Dinner',
      client: 'Hope Foundation',
      date: '2025-05-15',
      time: '18:00 - 22:00',
      location: 'Grand Hotel Ballroom',
      attendees: 120,
      status: 'scheduled',
      total: 6000.0,
      contactPerson: {
        name: 'Sarah Williams',
        phone: '555-789-0123',
      },
    },
  ]);
  const [cateringMenu, setCateringMenu] = useState([
    {
      id: '1',
      name: 'Gourmet Sandwich Platter',
      category: 'Platters',
      price: 75.0,
      description:
        'Assortment of premium sandwiches with artisan breads and fillings',
      popular: true,
      available: true,
    },
    {
      id: '2',
      name: 'Mediterranean Mezze',
      category: 'Appetizers',
      price: 65.0,
      description: 'Hummus, tzatziki, baba ganoush, olives, and pita bread',
      popular: true,
      available: true,
    },
    {
      id: '3',
      name: 'Executive Hot Lunch',
      category: 'Entrees',
      price: 25.0,
      description: 'Per person: Choice of protein, two sides, and dessert',
      popular: true,
      available: true,
    },
    {
      id: '4',
      name: 'Fresh Fruit Platter',
      category: 'Platters',
      price: 45.0,
      description: 'Seasonal fruits arranged beautifully',
      popular: false,
      available: true,
    },
    {
      id: '5',
      name: 'Artisan Cheese Board',
      category: 'Appetizers',
      price: 85.0,
      description: 'Selection of fine cheeses with crackers and accompaniments',
      popular: true,
      available: true,
    },
    {
      id: '6',
      name: 'Breakfast Package',
      category: 'Breakfast',
      price: 15.0,
      description: 'Per person: Pastries, fruit, yogurt, and coffee',
      popular: false,
      available: true,
    },
  ]);

  const handleCreateEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
    toast.success('Event created successfully!');
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleMenuItems = (event) => {
    setSelectedEvent(event);
    setShowMenuItemsModal(true);
  };

  const handleCancelEvent = (event) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? {
              ...e,
              status: 'cancelled',
            }
          : e
      )
    );
    toast.success(`Event "${event.name}" has been cancelled.`);
  };

  const handleAssignStaff = (eventId, staffIds) => {
    toast.success(`${staffIds.length} staff member(s) assigned to the event.`);
  };

  const handleUpdateMenuItems = (eventId, menuItems) => {
    toast.success('Menu items updated successfully!');
  };

  const handleViewFullMenu = () => {
    navigate('/pos');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Catering Management</CardTitle>
                <CardDescription>
                  Handle catering orders and events
                </CardDescription>
              </div>
              <Button
                className="flex gap-1 items-center"
                onClick={() => setShowNewEventModal(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> New Event
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="flex gap-1 items-center"
                  onClick={() => setShowCalendarModal(true)}
                >
                  <Calendar className="h-4 w-4 mr-1" /> Calendar View
                </Button>
              </div>

              <Tabs defaultValue="upcoming" onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-2">
                  {sortedEvents.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="h-10 px-4 text-left font-medium">
                                Event
                              </th>
                              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                                Client
                              </th>
                              <th className="h-10 px-4 text-left font-medium">
                                Date & Time
                              </th>
                              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                                Guests
                              </th>
                              <th className="h-10 px-4 text-right font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedEvents.map((event) => (
                              <tr
                                key={event.id}
                                className="border-b transition-colors hover:bg-muted/50"
                              >
                                <td className="p-4 align-middle font-medium">
                                  {event.name}
                                </td>
                                <td className="p-4 align-middle hidden md:table-cell">
                                  {event.client}
                                </td>
                                <td className="p-4 align-middle whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                      <CalendarDays className="h-3 w-3" />
                                      <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{event.time}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 align-middle hidden md:table-cell">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{event.attendees}</span>
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
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleViewDetails(event)}
                                      >
                                        <ClipboardCheck className="mr-2 h-4 w-4" />{' '}
                                        View Details
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => handleMenuItems(event)}
                                      >
                                        <Utensils className="mr-2 h-4 w-4" />{' '}
                                        Menu Items
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleCancelEvent(event)}
                                      >
                                        <MoreVertical className="mr-2 h-4 w-4" />{' '}
                                        Cancel Event
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Utensils className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        No upcoming catering events found
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewEventModal(true)}
                      >
                        Create New Event
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="past" className="pt-2">
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      No past catering events to display
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="cancelled" className="pt-2">
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      No cancelled events to display
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {currentTab === 'upcoming' && sortedEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Next scheduled catering event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {sortedEvents[0].name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {sortedEvents[0].client}
                      </p>
                    </div>
                    <CustomBadge
                      variant={getStatusBadgeVariant(sortedEvents[0].status)}
                      className="capitalize w-fit"
                    >
                      {sortedEvents[0].status.replace('-', ' ')}
                    </CustomBadge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col p-3 border rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Date & Time
                      </div>
                      <p className="text-sm">
                        {sortedEvents[0].date}
                        <br />
                        {sortedEvents[0].time}
                      </p>
                    </div>

                    <div className="flex flex-col p-3 border rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Map className="h-4 w-4 text-primary" />
                        Location
                      </div>
                      <p className="text-sm">{sortedEvents[0].location}</p>
                    </div>

                    <div className="flex flex-col p-3 border rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        Attendees
                      </div>
                      <p className="text-sm">
                        {sortedEvents[0].attendees} people
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 p-3 border rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="h-4 w-4 text-primary" />
                        Contact Person
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(sortedEvents[0].contactPerson.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {sortedEvents[0].contactPerson.name}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{sortedEvents[0].contactPerson.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-3 border rounded-md">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Banknote className="h-4 w-4 text-primary" />
                        Financial
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total Amount:
                          </span>
                          <span className="font-medium">
                            ${sortedEvents[0].total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Per Guest:
                          </span>
                          <span>
                            $
                            {(
                              sortedEvents[0].total / sortedEvents[0].attendees
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Deposit Paid:
                          </span>
                          <span className="text-green-600">Yes (50%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm">
                  View Full Details
                </Button>
                <Button variant="default" size="sm">
                  Generate Report <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catering Menu</CardTitle>
              <CardDescription>Special offerings for catering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cateringMenu
                  .filter((item, index) => index < 4)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium flex items-center">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                        <p className="text-sm mt-1">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <Button
                className="w-full mt-4"
                variant="outline"
                size="sm"
                onClick={handleViewFullMenu}
              >
                View Full Menu ({cateringMenu.length} items)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events
                    .filter((_, index) => index < 4)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                          <span className="text-sm font-bold">
                            {event.date.split('-')[2]}
                          </span>
                          <span className="text-xs">
                            {new Date(event.date).toLocaleString('default', {
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.client}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    No upcoming events scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewEventModal
        open={showNewEventModal}
        onOpenChange={setShowNewEventModal}
        onCreateEvent={handleCreateEvent}
      />

      <CalendarViewModal
        open={showCalendarModal}
        onOpenChange={setShowCalendarModal}
        events={events}
      />

      <EventDetailsModal
        open={showEventDetailsModal}
        onOpenChange={setShowEventDetailsModal}
        event={selectedEvent}
      />

      <MenuItemsModal
        open={showMenuItemsModal}
        onOpenChange={setShowMenuItemsModal}
        event={selectedEvent}
        menuItems={cateringMenu}
        onUpdateMenuItems={handleUpdateMenuItems}
      />
    </>
  );
};

export default Catering;
