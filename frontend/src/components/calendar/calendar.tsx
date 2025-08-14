"use client";

import { Week } from "./week";
import { AddEventModal } from "./AddEventModal";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { CalendarEvent } from '@/lib/types';
import toast from 'react-hot-toast';

// Types
interface CalendarDate {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  fullDate: Date;
}

interface GenerateCalendarResult {
  dates: CalendarDate[];
  weeksNeeded: number;
}

// Constants
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateCalendarDates(year: number, month: number): GenerateCalendarResult {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);

  // Start from the Sunday of the week containing the first day
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Calculate how many weeks needed
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const weeksNeeded = Math.ceil(totalDays / 7);

  const dates: CalendarDate[] = [];
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

export function Calendar() {
  // State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Derived values
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Fetch events effect
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let currentMonth = month + 1; // converted from 0-index to 1-index
        const response = await fetch(`/api/events?year=${year}&month=${currentMonth}`);

        if (!response.ok) {
          throw new Error('Failed to fetch event data');
        }

        const data = await response.json();
        console.log(data.data);
        setEvents(data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error("Failed to fetch events.")
        // TODO: Add proper error handling/toast notification
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [year, month]);

  // Events lookup map for performance
  const eventsByDate = useMemo((): Map<string, CalendarEvent[]> => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
        const dateKey = event.date.split('T')[0]; 
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  // Calendar dates generation
  const { dates: calendarDates, weeksNeeded } = useMemo(() => 
    generateCalendarDates(year, month),
    [year, month]
  );

  // Month name
  const monthName = useMemo(() => 
    new Date(year, month).toLocaleString('default', { month: 'long' }),
    [year, month]
  );

  // Generate weeks array
  const weeks = useMemo(() => {
    const weeksArray: CalendarDate[][] = [];
    for (let i = 0; i < weeksNeeded; i++) {
      weeksArray.push(calendarDates.slice(i * 7, (i + 1) * 7));
    }
    return weeksArray;
  }, [calendarDates, weeksNeeded]);

  // Event handlers - useCallback to prevent unnecessary re-renders
  const handleAddEvent = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Event creation handler (to be passed to modal)
  const handleEventCreated = useCallback((newEvent: CalendarEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
    //setIsModalOpen(false);
  }, []);

  return (
    <div className="rounded-lg border-border/70 border">
      {/* Header */}
      <div className="flex p-4 items-center w-full justify-between mb-4">
        <div className="flex w-full justify-left">
          <Button variant="outline">Go to live</Button>
          <div className="ml-8">
            <Button 
              className="mr-2" 
              onClick={handlePrevMonth}
              disabled={loading}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button 
              onClick={handleNextMonth}
              disabled={loading}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold">
            {monthName} {year}
          </div>
        </div>
        <Button onClick={handleAddEvent} disabled={loading}>
          New Event
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center text-muted-foreground text-sm border-border/70 border-b pb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid flex-1 auto-rows-fr">
        {loading ? (
          <div className="col-span-7 flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading events...</div>
          </div>
        ) : (
          weeks.map((weekDates, weekIndex) => (
            <Week 
              key={weekIndex} 
              dates={weekDates} 
              eventsByDate={eventsByDate}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <AddEventModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}