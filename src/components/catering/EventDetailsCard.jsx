import React from 'react';
import {
  CalendarDays,
  Map,
  Users,
  Phone,
  User,
  Banknote,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currency } from '@/features/analytics/common/utils';
import { CustomBadge } from '@/components/ui/custom-badge';

export const EventDetailsCard = ({ event, getStatusBadgeVariant }) => {
  if (!event) return null;

  const dateLabel = event.dateLabel || event.date || 'Date to follow';
  const timeLabel = event.time || 'Time to follow';
  const locationLabel = event.location || 'Venue to be confirmed';
  const attendees = Number.isFinite(event.attendees) ? event.attendees : 0;
  const totalValue = currency(event.total ?? 0);
  const depositRaw = event.deposit ?? (event.total ?? 0) * 0.5;
  const depositValue = currency(depositRaw);
  const depositPaid = Boolean(event.depositPaid);
  const perGuest =
    attendees > 0 ? currency((event.total ?? 0) / attendees) : null;
  const contactPerson = event.contactPerson || {};
  const statusLabel =
    typeof event.status === 'string'
      ? event.status.replace(/-/g, ' ')
      : 'scheduled';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-slate-100 shadow-[0_36px_90px_-45px_rgba(15,23,42,0.85)] dark:border-slate-700/50 dark:from-indigo-500/30 dark:via-slate-950 dark:to-indigo-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.38),_transparent_62%)] mix-blend-screen"
      />
      <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-200/70">
              Next Catering Event
            </p>
            <div>
              <h3 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
                {event.name || 'Untitled event'}
              </h3>
              <p className="text-sm text-slate-100/75">
                {event.client || 'Awaiting client confirmation'}
              </p>
            </div>
          </div>
          <CustomBadge
            variant={getStatusBadgeVariant(event.status)}
            className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-sm"
          >
            {statusLabel}
          </CustomBadge>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/70">
              <CalendarDays className="h-4 w-4 text-sky-300" />
              Date & Time
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-100/90">
              <p>{dateLabel}</p>
              <p className="text-xs uppercase tracking-wide text-slate-200/70">
                {timeLabel}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/70">
              <Map className="h-4 w-4 text-emerald-300" />
              Location
            </div>
            <p className="mt-3 text-sm text-slate-100/90">{locationLabel}</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/70">
              <Users className="h-4 w-4 text-amber-300" />
              Guest Count
            </div>
            <p className="mt-3 text-sm font-semibold text-white">
              {attendees.toLocaleString()} guests
            </p>
            {perGuest ? (
              <p className="text-xs text-slate-200/70">{perGuest} per guest</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/70">
              <User className="h-4 w-4 text-violet-300" />
              Primary Contact
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-100/85">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-4 w-4 text-slate-200/80" />
                <span>{contactPerson.name || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-200/80" />
                <span>{contactPerson.phone || 'No contact number'}</span>
              </div>
              {contactPerson.email ? (
                <div className="flex items-center gap-3 text-xs text-slate-200/70">
                  <span>{contactPerson.email}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100/70">
              <Banknote className="h-4 w-4 text-emerald-300" />
              Financial Snapshot
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-100/85">
                <span>Total contract</span>
                <span className="font-semibold text-white">{totalValue}</span>
              </div>
              <div className="flex items-center justify-between text-slate-100/85">
                <span>Deposit required</span>
                <span className="font-semibold text-white">{depositValue}</span>
              </div>
              <div className="flex items-center justify-between text-slate-100/85">
                <span>Status</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    depositPaid
                      ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-100'
                      : 'border-rose-400/40 bg-rose-400/20 text-rose-50'
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full border border-current',
                      depositPaid ? 'bg-emerald-300' : 'bg-rose-300'
                    )}
                  />
                  {depositPaid ? 'Deposit paid' : 'Deposit pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
