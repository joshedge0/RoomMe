"use client";

import { Week } from "./week";
import { AddEventModal } from "./AddEventModal";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";

export function Calendar() {
  let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { dates: calendarDates, weeksNeeded } = generateCalendarDates(
    year,
    month
  );

  const monthName = useMemo(() => 
    new Date(year, month).toLocaleString('default', { month: 'long' }),
    [year, month]
  );

  const weeks = [];
  for (let i = 0; i < weeksNeeded; i++) {
    weeks.push(calendarDates.slice(i * 7, (i + 1) * 7));
  }

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  function generateCalendarDates(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Start from the Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Calculate how many weeks needed
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

    const totalDays: number =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const weeksNeeded: number = Math.ceil(totalDays / 7);

    const dates = [];
    const currentDate = new Date(startDate);

    // Generate only the amount of weeks needed
    for (let i = 0; i < weeksNeeded * 7; i++) {
      dates.push({
        date: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        isCurrentMonth: currentDate.getMonth() === month,
        fullDate: new Date(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { dates, weeksNeeded };
  }

  return (
    <div className="rounded-lg border-border/70 border">
      <div className="flex p-4 items-center w-full justify-between mb-4">
        <div className="flex w-full justify-left">
          <Button variant="outline">Go to live</Button>
          <div className="ml-8">
            <Button className="mr-2" onClick={handlePrevMonth}>
              <ChevronLeft />
            </Button>
            <Button onClick={handleNextMonth}>
              <ChevronRight />
            </Button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold">
            {monthName} {year}
          </div>
        </div>
        <Button onClick={handleAddEvent}>New Event</Button>
      </div>

      <div className="grid grid-cols-7 text-center text-muted-foreground text-sm border-border/70 border-b pb-2">
        {daysOfTheWeek.map((day) => (
          <div>{day}</div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((weekDates, weekIndex) => (
          <Week key={weekIndex} dates={weekDates} />
        ))}
      </div>

      <AddEventModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
}
