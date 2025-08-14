"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
//import axios from "axios";
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
import { ChevronDownIcon, X } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { CalendarEvent } from '@/lib/types';

// Form validation schema
const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100, "Event name too long"),
  date: z.date().refine((val) => val !== undefined, {
    message: "Please select a date"
  }),
  time_from: z.string().min(1, "Start time is required"),
  time_until: z.string().min(1, "End time is required"),
  category: z.string().min(1, "Please select a category"),
}).refine(
  (data) => {
    // Validate that end time is after start time
    const startTime = new Date(`2000-01-01T${data.time_from}`);
    const endTime = new Date(`2000-01-01T${data.time_until}`);
    return endTime > startTime;
  },
  {
    message: "End time must be after start time",
    path: ["time_until"],
  }
);

type EventFormValues = z.infer<typeof eventFormSchema>;

// Constants
const CATEGORIES = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "family", label: "Family" },
  { value: "vacation", label: "Vacation" },
] as const;

//const API_BASE_URL = "http://localhost:4000";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: CalendarEvent) => void;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: AddEventModalProps) {
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Form setup with validation
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      date: undefined,
      time_from: "12:00",
      time_until: "14:00",
      category: "",
    },
  });

  /* API instance - memoized
  const api = useMemo(() => axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  }), []);
  */

  // Form submission handler
  const onSubmit = useCallback(async (values: EventFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/events?month=${values.date.getMonth}&year=${values.date.getFullYear}`);

      if (!response.ok) {
        throw new Error('Failed to fetch event data');
      }

      const data = await response.json();
      
      if (response.status === 201) {
        toast.success('Event created successfully!');
        
        // Call parent callback with new event data
        if (onEventCreated) {
          onEventCreated(data);
        }
        
        // Reset form and close modal
        form.reset();
        onClose();
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load event data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [onEventCreated, onClose, form]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  // Close handler for backdrop/X button
  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isSubmitting) {
      handleCancel();
    }
  }, [handleCancel, isSubmitting]);

  // Backdrop click handler
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg mx-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Add Event</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-6 w-6 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      id="event-name"
                      placeholder="Enter event name" 
                      disabled={isSubmitting}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label>Date</Label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isSubmitting}
                            className="w-full justify-between font-normal"
                            type="button"
                          >
                            {field.value
                              ? field.value.toLocaleDateString()
                              : "Select date"}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsDatePickerOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="time_from"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label htmlFor="start-time">From</Label>
                    <FormControl>
                      <Input
                        id="start-time"
                        type="time"
                        disabled={isSubmitting}
                        className="text-center"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="time_until"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <Label htmlFor="end-time">Until</Label>
                    <FormControl>
                      <Input
                        id="end-time"
                        type="time"
                        disabled={isSubmitting}
                        className="text-center"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 pt-4">
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}