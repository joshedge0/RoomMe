"use client";

import { Day } from "./day";

type DateObject = {
  date: number;
  isCurrentMonth: boolean;
  fullDate: Date;
};

type WeekProps = {
  dates: DateObject[];
}

export function Week({ dates }: WeekProps) {
  return (
    <div className="grid grid-cols-7 h-[150px] [&:last-child>*]:border-b-0">
      {dates.map((dateObj, dayIndex) => (
        <Day 
          key={dayIndex}
          day={dateObj.date}
          isCurrentMonth={dateObj.isCurrentMonth}
          fullDate={dateObj.fullDate}
        />
      ))}
    </div>
  );
}
