'use client';

import { Week } from "./week"
import { AddEventModal } from "./AddEventModal";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from "react";


type MonthProps = {
  month: string;
};

export function Month({ month }: MonthProps) {
  let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEvent = () => {
    setIsModalOpen(true);
  }

  return (
    <div className="rounded-lg border-border/70 border">
      <div className="flex p-4 items-center w-full justify-between mb-4">
        <div className="flex w-full justify-left">
          <Button variant="outline">Go to live</Button>
          <div className="ml-8">
            <Button className="mr-2"><ChevronLeft /></Button>
            <Button><ChevronRight /></Button>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold">{month}</div>
        </div>
        <Button onClick={handleAddEvent}>New Event</Button>
      </div>

        <div className="grid grid-cols-7 text-center text-muted-foreground text-sm border-border/70 border-b pb-2">
          {daysOfTheWeek.map((day)=>(
            <div>{day}</div>
          ))}
        </div>
        <div className="grid flex-1 auto-rows-fr">
            <Week />
            <Week />
            <Week />
            <Week />
        </div>
    
    

        <AddEventModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
        />
        </div>
  );
}
