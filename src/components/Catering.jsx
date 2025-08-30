import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils, CalendarDays, Map, Users, Phone, User, Banknote, ChevronRight, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewEventModal } from './catering/NewEventModal';
import { CalendarViewModal } from './catering/CalendarViewModal';
import { EventDetailsModal } from './catering/EventDetailsModal';
import { MenuItemsModal } from './catering/MenuItemsModal';
import { CateringEventTable } from './catering/CateringEventTable';
import { EventSearchAndFilters } from './catering/EventSearchAndFilters';
import { EventDetailsCard } from './catering/EventDetailsCard';
import { CateringSidebar } from './catering/CateringSidebar';
import { toast } from 'sonner';
import { CustomBadge } from './ui/custom-badge';
import { Avatar, AvatarFallback } from './ui/avatar';

const Catering = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('upcoming');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
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
      contactPerson: { name: 'John Smith', phone: '555-123-4567' },
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
      contactPerson: { name: 'Maria Garcia', phone: '555-987-6543' },
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
      contactPerson: { name: 'Alex Johnson', phone: '555-456-7890' },
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
      contactPerson: { name: 'Sarah Williams', phone: '555-789-0123' },
    },
  ]);

  const [cateringMenu] = useState([
    {
      id: '1',
      name: 'Gourmet Sandwich Platter',
      category: 'Platters',
      price: 75.0,
      description: 'Assortment of premium sandwiches with artisan breads and fillings',
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
        e.id === event.id ? { ...e, status: 'cancelled' } : e
      )
    );
    toast.success(`Event "${event.name}" has been cancelled.`);
  };

  const handleUpdateMenuItems = (eventId, menuItems) => {
    toast.success('Menu items updated successfully!');
  };

  const handleViewFullMenu = () => {
    navigate('/pos');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'in-progress': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
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

    const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Catering Management</CardTitle>
                <CardDescription>Handle catering orders and events</CardDescription>
              </div>
              <Button onClick={() => setShowNewEventModal(true)}>
                <PlusCircle className="h-4 w-4 mr-1" /> New Event
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <EventSearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCalendarView={() => setShowCalendarModal(true)}
              />

              <Tabs defaultValue="upcoming" onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-2">
                  {sortedEvents.length > 0 ? (
                    <CateringEventTable
                      events={sortedEvents}
                      onViewDetails={handleViewDetails}
                      onMenuItems={handleMenuItems}
                      onCancelEvent={handleCancelEvent}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <Utensils className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No upcoming catering events found</p>
                      <Button className="mt-4" variant="outline" size="sm" onClick={() => setShowNewEventModal(true)}>
                        Create New Event
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="past" className="pt-2">
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No past catering events to display</p>
                  </div>
                </TabsContent>
                <TabsContent value="cancelled" className="pt-2">
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No cancelled events to display</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {currentTab === 'upcoming' && sortedEvents.length > 0 && (
            <EventDetailsCard
              event={sortedEvents[0]}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          )}
        </div>

        <CateringSidebar
          cateringMenu={cateringMenu}
          upcomingEvents={sortedEvents}
          onViewFullMenu={handleViewFullMenu}
        />
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
