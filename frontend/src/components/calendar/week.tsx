"use client";

import { format } from "date-fns"
import { Day } from "./day";
import { CalendarEvent } from "@/lib/types";

type DateObject = {
  date: number;
  isCurrentMonth: boolean;
  fullDate: Date;
};

type WeekProps = {
  dates: DateObject[];
  eventsByDate: Map<string, CalendarEvent[]>;
}

export function Week({ dates, eventsByDate }: WeekProps) {
  return (
    <div className="grid grid-cols-7 h-[150px] [&:last-child>*]:border-b-0">
      {dates.map((dateObj, dayIndex) => {
        const dateKey = format(dateObj.fullDate, 'yyyy-MM-dd');
        return (
        <Day 
          key={dayIndex}
          day={dateObj.date}
          isCurrentMonth={dateObj.isCurrentMonth}
          fullDate={dateObj.fullDate}
          events={eventsByDate.get(dateKey) || []} 
        />
      )})}
    </div>
  );
}
