"use client";

import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import toast from 'react-hot-toast';

type EventFormValues = {
  name: string;
  date: Date;
  time_from: string;
  time_until: string;
  category: string;
};

export function AddEventModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (_isOpen: boolean) => void;
}) {
  const form = useForm<EventFormValues>({
    defaultValues: {
      name: "",
      date: undefined,
      time_from: "12:00",
      time_until: "14:00",
      category: "",
    },
  });

  const [open, setOpen] = React.useState(false);

  const api = axios.create({
    baseURL: "http://localhost:4000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    const eventData = {
        ...values,
        time_from: new Date(`${values.date.toISOString().split('T')[0]}T${values.time_from}:00`).toISOString(),
        time_until: new Date(`${values.date.toISOString().split('T')[0]}T${values.time_until}:00`).toISOString()
    };

      try {
        const response = await api.post('/api/events', eventData);
        if(response.status = 201){
            toast.success('Event saved!');
            form.reset();
        } else {
          toast.error('Failed to create event');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response);
        } else {
          console.error(error);
          toast.error('Error while creating event');
        }  
      }
    
      setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-10" />
      <div className="relative w-96 rounded-lg border border-border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Add Event</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl className="flex-1">
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row justify-between">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl className="flex-1">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="date-picker" className="px-1">
                          Date
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"input"}
                              id="date-picker"
                              className="justify-between font-normal"
                            >
                              {field.value
                                ? field.value.toLocaleDateString()
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                field.onChange(date);
                                setOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_from"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl className="flex-1">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="time-picker" className="px-1">
                          From
                        </Label>
                        <Input
                          type="time"
                          id="time-picker"
                          className="bg-background text-center appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_until"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl className="flex-1">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="time-picker" className="px-1">
                          Until
                        </Label>
                        <Input
                          type="time"
                          id="time-picker"
                          className="bg-background mx-auto text-center appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 pt-4">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl className="flex-1">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between pt-4">
              <Button variant="outlinedark" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
