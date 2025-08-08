"use client";

import { CalendarEvent } from "@/lib/types";

type DayProps = {
  day: number;
  isCurrentMonth: boolean;
  fullDate: Date;
  events: CalendarEvent[];
};

export function Day({ day, isCurrentMonth, fullDate, events }: DayProps) {
  return (
    <div className={`h-[100%] border-r border-b last:border-r-0 border-border/70 p-1 hover:bg-primary/3 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
      <p>{day}</p>
      {events.map(event => (
        <div key={event.id} className="bg-primary text-primary-foreground text-xs py-1 px-2 my-2 mx-1 rounded">
          {event.name}
        </div>
      ))}
    </div>
  );
}