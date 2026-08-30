"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DayDetailDrawer } from "./DayDetailDrawer";
import { EventDetailModal } from "./EventDetailModal";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    type?: string;
    status: string;
    amount: number;
    planId?: string;
    utilityId?: string;
    subscriptionId?: string;
    storeName: string;
    userName?: string;
    isOwn: boolean;
  };
}

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  async function loadEvents(from: string, to: string) {
    const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    const to = new Date();
    to.setMonth(to.getMonth() + 6);
    loadEvents(from.toISOString(), to.toISOString());
  }, []);

  function handleDateClick(info: { dateStr: string }) {
    const dayEvents = events.filter((e) => e.start.startsWith(info.dateStr));
    setSelectedDateEvents(dayEvents);
    setDrawerOpen(true);
  }

  function handleEventClick(info: { event: { extendedProps: Record<string, unknown> } }) {
    const ep = info.event.extendedProps;
    const fullEvent = events.find((e) => {
      const eep = e.extendedProps;
      if (eep.type === "utility") return eep.utilityId === ep.utilityId;
      if (eep.type === "subscription") return eep.subscriptionId === ep.subscriptionId;
      return eep.planId === ep.planId;
    });
    if (fullEvent) setSelectedEvent(fullEvent);
  }

  return (
    <>
      <div className="ledger-card p-5">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          firstDay={1}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
          }}
          displayEventTime={false}
        />
      </div>
      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        events={selectedDateEvents}
      />
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
