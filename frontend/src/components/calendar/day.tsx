"use client";

type DayProps = {
  day: number;
  isCurrentMonth: boolean;
  fullDate: Date;
};

export function Day({ day, isCurrentMonth, fullDate }: DayProps) {
  return (
    <div className={`h-[100%] border-r border-b last:border-r-0 border-border/70 p-1 hover:bg-primary/3 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
      <p>{day}</p>
      <div></div>
    </div>
  );
}