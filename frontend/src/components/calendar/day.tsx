"use client";

type DayProps = {
  day: string;
};

export function Day({ day }: DayProps) {
  return (
    <div className="h-[100%] border-r border-b last:border-r-0 border-border/70 p-1 hover:bg-primary/3">
      <p>{day}</p>
      <div></div>
    </div>
  );
}
