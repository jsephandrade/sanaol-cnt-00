import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, parse } from 'date-fns';
import { NewEventModal } from './catering/NewEventModal';
import { CalendarViewModal } from './catering/CalendarViewModal';
import { EventDetailsModal } from './catering/EventDetailsModal';
import { MenuItemsModal } from './catering/MenuItemsModal';
import { CateringEventTable } from './catering/CateringEventTable';
import { EventSearchAndFilters } from './catering/EventSearchAndFilters';
import { EventDetailsCard } from './catering/EventDetailsCard';
import { CateringSidebar } from './catering/CateringSidebar';
import { toast } from 'sonner';
import { useMenuItems } from '@/hooks/useMenuItems';
import cateringService from '@/api/services/cateringService';

const FALLBACK_DEPOSIT_RATIO = 0.5;

const parseTimeValue = (value) => {
  if (!value) return null;
  const normalized = String(value);
  const formats = ['HH:mm:ss', 'HH:mm'];
  for (const fmt of formats) {
    try {
      return parse(normalized, fmt, new Date());
    } catch {
      continue;
    }
  }
  return null;
};

const combineDateTime = (dateIso, timeIso) => {
  if (!dateIso) return null;
  try {
    const base = parseISO(dateIso);
    if (!timeIso) return base;
    const timeValue = parseTimeValue(timeIso);
    if (!timeValue) return base;
    base.setHours(
      timeValue.getHours(),
      timeValue.getMinutes(),
      timeValue.getSeconds(),
      0
    );
    return base;
  } catch {
    return null;
  }
};

const formatTimeRange = (startTime, endTime, fallbackLabel) => {
  if (fallbackLabel) return fallbackLabel;
  const start = parseTimeValue(startTime);
  const end = parseTimeValue(endTime);
  if (start && end) {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  }
  if (start) return format(start, 'h:mm a');
  if (end) return format(end, 'h:mm a');
  return '';
};

const mapEventRecord = (record) => {
  if (!record) return null;
  const dateIso = record.date || record.eventDate || '';
  const startTime = record.startTime || record.start_time || null;
  const endTime = record.endTime || record.end_time || null;
  let dateLabel = dateIso;
  try {
    if (dateIso) {
      dateLabel = format(parseISO(dateIso), 'MMMM d, yyyy');
    }
  } catch {
    dateLabel = dateIso;
  }

  const timeLabel = formatTimeRange(startTime, endTime, record.time);
  const attendees = Number(
    record.attendees ?? record.guestCount ?? record.guest_count ?? 0
  );
  const total = Number(
    record.total ?? record.estimatedTotal ?? record.totalAmount ?? 0
  );
  const items = (record.items || []).map((item) => {
    const unitPrice = Number(
      item.unitPrice ?? item.unit_price ?? item.price ?? 0
    );
    const quantity = Number(item.quantity ?? 0);
    const totalPrice = Number(item.totalPrice ?? unitPrice * quantity);
    return {
      id: item.id,
      menuItemId: item.menuItemId || item.menu_item_id || null,
      name: item.name,
      quantity,
      unitPrice,
      totalPrice,
    };
  });

  const contact = record.contactPerson || {};

  return {
    id: record.id,
    name: record.name || record.eventName || '',
    client: record.client || record.clientName || '',
    status: record.status || 'scheduled',
    date: dateIso,
    dateLabel,
    startTime,
    endTime,
    time: timeLabel,
    location: record.location || record.eventLocation || '',
    attendees,
    total,
    notes: record.notes || '',
    items,
    contactPerson: {
      name: contact.name || record.contactName || record.contact_name || '',
      phone: contact.phone || record.contactPhone || record.contact_phone || '',
      email:
        contact.email ||
        record.contactEmail ||
        record.contact_email ||
        record.clientEmail ||
        record.client_email ||
        '',
    },
    deposit: Number(record.deposit ?? total * FALLBACK_DEPOSIT_RATIO),
    depositPaid: Boolean(record.depositPaid),
    raw: record,
  };
};

const isEventPast = (event) => {
  if (!event) return false;
  if (event.status === 'completed' || event.status === 'cancelled') {
    return true;
  }
  const endDate =
    combineDateTime(event.date, event.endTime) ||
    combineDateTime(event.date, event.startTime);
  if (!endDate) return false;
  return endDate < new Date();
};

const Catering = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('upcoming');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showMenuItemsModal, setShowMenuItemsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const { items: rawMenuItems, loading: isMenuLoading } = useMenuItems();

  const cateringMenu = useMemo(() => {
    const getCategoryName = (category) => {
      if (!category) return 'Uncategorized';
      if (typeof category === 'string') return category;
      if (typeof category === 'object') {
        return (
          category.name ||
          category.label ||
          category.title ||
          category.slug ||
          category.id ||
          'Uncategorized'
        );
      }
      return String(category);
    };

    const toNumber = (value) => {
      const num = Number(value ?? 0);
      return Number.isFinite(num) ? num : 0;
    };

    return (rawMenuItems || []).map((item) => ({
      ...item,
      category: getCategoryName(item.category),
      price: toNumber(item.price ?? item.unitPrice ?? item.basePrice),
      description: item.description || '',
    }));
  }, [rawMenuItems]);

  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setEventsError(null);
    try {
      const res = await cateringService.listEvents({ limit: 500 });
      const list = res?.data || [];
      setEvents(list.map(mapEventRecord).filter(Boolean));
    } catch (error) {
      const message =
        error?.message ||
        error?.details?.message ||
        'Failed to load catering events';
      setEventsError(message);
      toast.error(message);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredBySearch = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) => {
      const nameMatch = event.name.toLowerCase().includes(term);
      const clientMatch = event.client.toLowerCase().includes(term);
      const locationMatch = event.location.toLowerCase().includes(term);
      return nameMatch || clientMatch || locationMatch;
    });
  }, [events, searchTerm]);

  const upcomingEvents = useMemo(
    () =>
      filteredBySearch
        .filter((event) => event.status !== 'cancelled' && !isEventPast(event))
        .sort((a, b) => {
          const aDate =
            combineDateTime(a.date, a.startTime) || new Date(8640000000000000);
          const bDate =
            combineDateTime(b.date, b.startTime) || new Date(8640000000000000);
          return aDate - bDate;
        }),
    [filteredBySearch]
  );

  const pastEvents = useMemo(
    () =>
      filteredBySearch
        .filter((event) => event.status !== 'cancelled' && isEventPast(event))
        .sort((a, b) => {
          const aDate = combineDateTime(a.date, a.endTime) || new Date(0);
          const bDate = combineDateTime(b.date, b.endTime) || new Date(0);
          return bDate - aDate;
        }),
    [filteredBySearch]
  );

  const cancelledEvents = useMemo(
    () =>
      filteredBySearch
        .filter((event) => event.status === 'cancelled')
        .sort((a, b) => {
          const aDate = combineDateTime(a.date, a.startTime) || new Date(0);
          const bDate = combineDateTime(b.date, b.startTime) || new Date(0);
          return bDate - aDate;
        }),
    [filteredBySearch]
  );

  const nextUpcomingEvent =
    upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  const handleCreateEvent = useCallback(async (formValues) => {
    try {
      const estimatedTotal = Number(formValues.attendees || 0) * 25;
      const payload = {
        name: formValues.name,
        client: formValues.client,
        date: formValues.date,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        location: formValues.location,
        attendees: formValues.attendees,
        contactName: formValues.contactName,
        contactPhone: formValues.contactPhone,
        notes: formValues.notes,
        estimatedTotal,
      };
      const res = await cateringService.createEvent(payload);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to create event');
      }
      const mapped = mapEventRecord(res.data);
      setEvents((prev) => [...prev, mapped]);
      toast.success('Event created successfully!');
      return true;
    } catch (error) {
      const message =
        error?.message || error?.details?.message || 'Failed to create event';
      toast.error(message);
      return false;
    }
  }, []);

  const handleViewDetails = useCallback(async (event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
    try {
      const res = await cateringService.getEvent(event.id, {
        includeItems: true,
      });
      if (!res?.success) throw new Error(res?.message);
      const mapped = mapEventRecord(res.data);
      setSelectedEvent(mapped);
      setEvents((prev) =>
        prev.map((item) => (item.id === mapped.id ? mapped : item))
      );
    } catch (error) {
      const message =
        error?.message ||
        error?.details?.message ||
        'Failed to load event details';
      toast.error(message);
    }
  }, []);

  const handleMenuItems = useCallback(async (event) => {
    setSelectedEvent(event);
    setShowMenuItemsModal(true);
    try {
      const res = await cateringService.getEvent(event.id, {
        includeItems: true,
      });
      if (!res?.success) throw new Error(res?.message);
      const mapped = mapEventRecord(res.data);
      setSelectedEvent(mapped);
      setEvents((prev) =>
        prev.map((item) => (item.id === mapped.id ? mapped : item))
      );
    } catch (error) {
      const message =
        error?.message ||
        error?.details?.message ||
        'Failed to load menu items';
      toast.error(message);
    }
  }, []);

  const handleCancelEvent = useCallback(
    async (event) => {
      try {
        const res = await cateringService.cancelEvent(event.id);
        if (!res?.success) throw new Error(res?.message);
        const mapped = mapEventRecord(res.data);
        setEvents((prev) =>
          prev.map((item) => (item.id === mapped.id ? mapped : item))
        );
        if (selectedEvent?.id === mapped.id) {
          setSelectedEvent(mapped);
        }
        toast.success(`Event "${event.name}" has been cancelled.`);
      } catch (error) {
        const message =
          error?.message || error?.details?.message || 'Failed to cancel event';
        toast.error(message);
      }
    },
    [selectedEvent]
  );

  const handleUpdateMenuItems = useCallback(
    async (eventId, menuItemsPayload) => {
      try {
        const res = await cateringService.setEventMenuItems(
          eventId,
          menuItemsPayload
        );
        if (!res?.success) throw new Error(res?.message);
        const mapped = mapEventRecord(res.data);
        setEvents((prev) =>
          prev.map((item) => (item.id === mapped.id ? mapped : item))
        );
        setSelectedEvent(mapped);
        toast.success('Menu items updated successfully!');
        return true;
      } catch (error) {
        const message =
          error?.message ||
          error?.details?.message ||
          'Failed to update menu items';
        toast.error(message);
        return false;
      }
    },
    []
  );

  const handleViewFullMenu = useCallback(() => {
    navigate('/pos');
  }, [navigate]);

  const getStatusBadgeVariant = useCallback((status) => {
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
  }, []);

  const renderTable = (data, emptyMessage) => {
    if (isLoadingEvents) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading catering events...</p>
        </div>
      );
    }

    if (eventsError) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{eventsError}</p>
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            onClick={fetchEvents}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-10">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{emptyMessage}</p>
          {currentTab === 'upcoming' && (
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={() => setShowNewEventModal(true)}
            >
              Create New Event
            </Button>
          )}
        </div>
      );
    }

    return (
      <CateringEventTable
        events={data}
        onViewDetails={handleViewDetails}
        onMenuItems={handleMenuItems}
        onCancelEvent={handleCancelEvent}
      />
    );
  };

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

              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Events</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-2">
                  {renderTable(
                    upcomingEvents,
                    'No upcoming catering events found'
                  )}
                </TabsContent>
                <TabsContent value="past" className="pt-2">
                  {renderTable(
                    pastEvents,
                    'No past catering events to display'
                  )}
                </TabsContent>
                <TabsContent value="cancelled" className="pt-2">
                  {renderTable(
                    cancelledEvents,
                    'No cancelled catering events to display'
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {nextUpcomingEvent && (
            <EventDetailsCard
              event={nextUpcomingEvent}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          )}
        </div>

        <CateringSidebar
          cateringMenu={cateringMenu}
          isMenuLoading={isMenuLoading}
          upcomingEvents={upcomingEvents}
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
