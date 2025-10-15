import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  CalendarDays,
  Users,
  MapPin,
  User,
  Phone,
  Banknote,
  Pencil,
  X,
} from 'lucide-react';

const normalizeDateInput = (value) => {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes('T')) {
    return stringValue.split('T')[0];
  }
  if (stringValue.includes(' ')) {
    return stringValue.split(' ')[0];
  }
  return stringValue;
};

const normalizeTimeInput = (value) => {
  if (!value) return '';
  const segments = String(value).split(':');
  if (segments.length < 2) {
    return String(value);
  }
  const hours = (segments[0] || '').padStart(2, '0');
  const minutes = (segments[1] || '').padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getDaysUntilDate = (value) => {
  const normalized = normalizeDateInput(value);
  if (!normalized) return null;

  const eventDate = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const eventStart = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );

  const diffMs = eventStart.getTime() - todayStart.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const EventDetailsModal = ({
  open,
  onOpenChange,
  event,
  onUpdateEvent,
}) => {
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  useEffect(() => {
    if (!event) {
      setScheduleForm({
        date: '',
        startTime: '',
        endTime: '',
      });
      setIsEditingSchedule(false);
      return;
    }

    setScheduleForm({
      date: normalizeDateInput(event.date),
      startTime: normalizeTimeInput(event.startTime),
      endTime: normalizeTimeInput(event.endTime),
    });
    setIsEditingSchedule(false);
  }, [event]);

  if (!event) return null;

  const initialDate = normalizeDateInput(event.date);
  const initialStartTime = normalizeTimeInput(event.startTime);
  const initialEndTime = normalizeTimeInput(event.endTime);
  const hasScheduleChanges =
    scheduleForm.date !== initialDate ||
    scheduleForm.startTime !== initialStartTime ||
    scheduleForm.endTime !== initialEndTime;
  const canEditSchedule = typeof onUpdateEvent === 'function';
  const scheduleDateLabel = event.dateLabel || event.date || 'Not set';
  const scheduleStartTimeLabel = normalizeTimeInput(event.startTime);
  const scheduleEndTimeLabel = normalizeTimeInput(event.endTime);

  const daysUntilEvent = getDaysUntilDate(event?.date);
  const isRescheduleLocked =
    typeof daysUntilEvent === 'number' && daysUntilEvent <= 5;
  const rescheduleLockMessage =
    'Rescheduling is unavailable within 5 days of the event.';

  const contactPerson = event.contactPerson || { name: '', phone: '' };
  const totalValue = Number(event.total ?? 0);
  const attendeesCount = Number(event.attendees ?? 0);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (
      !event?.id ||
      !canEditSchedule ||
      !hasScheduleChanges ||
      isRescheduleLocked
    )
      return;

    const updates = {};
    if (scheduleForm.date !== initialDate) {
      updates.date = scheduleForm.date || null;
    }
    if (scheduleForm.startTime !== initialStartTime) {
      updates.startTime = scheduleForm.startTime || null;
    }
    if (scheduleForm.endTime !== initialEndTime) {
      updates.endTime = scheduleForm.endTime || null;
    }

    if (Object.keys(updates).length === 0) return;

    setIsSavingSchedule(true);
    try {
      await onUpdateEvent(event.id, updates);
      setIsEditingSchedule(false);
    } catch (error) {
      // Parent component should surface any errors.
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleScheduleReset = () => {
    if (!event) return;
    setScheduleForm({
      date: initialDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
    });
  };

  const handleToggleScheduleEdit = () => {
    if (!canEditSchedule || isRescheduleLocked) return;
    if (isEditingSchedule) {
      handleScheduleReset();
    }
    setIsEditingSchedule((prev) => !prev);
  };

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
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {isEditingSchedule ? 'Reschedule' : 'Date & Time'}
                  </CardTitle>
                  {canEditSchedule && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleToggleScheduleEdit}
                      disabled={isRescheduleLocked}
                      aria-disabled={isRescheduleLocked}
                      title={
                        isRescheduleLocked ? rescheduleLockMessage : undefined
                      }
                      aria-label={
                        isEditingSchedule
                          ? 'Close reschedule form'
                          : 'Edit schedule'
                      }
                    >
                      {isEditingSchedule ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingSchedule ? (
                  <form className="space-y-4" onSubmit={handleScheduleSubmit}>
                    {isRescheduleLocked && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        {rescheduleLockMessage}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <span>Current schedule:</span>
                      <div className="font-medium text-foreground">
                        {scheduleDateLabel}
                        {event.time ? ` - ${event.time}` : ''}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <Label htmlFor="event-date" className="sm:w-40">
                          Event Date *
                        </Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          required
                          disabled={
                            !canEditSchedule ||
                            isSavingSchedule ||
                            isRescheduleLocked
                          }
                          className="w-full sm:flex-1"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <Label htmlFor="event-start-time" className="sm:w-40">
                          Start Time
                        </Label>
                        <Input
                          id="event-start-time"
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          disabled={
                            !canEditSchedule ||
                            isSavingSchedule ||
                            isRescheduleLocked
                          }
                          className="w-full sm:flex-1"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <Label htmlFor="event-end-time" className="sm:w-40">
                          End Time
                        </Label>
                        <Input
                          id="event-end-time"
                          type="time"
                          value={scheduleForm.endTime}
                          onChange={(e) =>
                            setScheduleForm((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          disabled={
                            !canEditSchedule ||
                            isSavingSchedule ||
                            isRescheduleLocked
                          }
                          className="w-full sm:flex-1"
                        />
                      </div>
                    </div>
                    {canEditSchedule && (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleScheduleReset}
                          disabled={
                            !hasScheduleChanges ||
                            isSavingSchedule ||
                            isRescheduleLocked
                          }
                        >
                          Reset
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            !hasScheduleChanges ||
                            !scheduleForm.date ||
                            isSavingSchedule ||
                            isRescheduleLocked
                          }
                        >
                          {isSavingSchedule ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4">
                    {isRescheduleLocked && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        {rescheduleLockMessage}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <span>Current schedule:</span>
                      <div className="font-medium text-foreground">
                        {scheduleDateLabel}
                        {event.time ? ` - ${event.time}` : ''}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Start Time
                        </p>
                        <p className="font-medium">
                          {scheduleStartTimeLabel || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          End Time
                        </p>
                        <p className="font-medium">
                          {scheduleEndTimeLabel || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                <p className="font-medium">{attendeesCount} people</p>
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
                <p className="font-medium">{event.location || '—'}</p>
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
                  <span className="font-medium">₱{totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Per person:</span>
                  <span className="font-medium">
                    {attendeesCount > 0
                      ? `₱${(totalValue / attendeesCount).toFixed(2)}`
                      : '₱0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    {getInitials(contactPerson.name) || '—'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{contactPerson.name || '—'}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{contactPerson.phone || '—'}</span>
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
