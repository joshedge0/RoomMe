import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db'; // Your database connection
import { events, calendars, user } from '@/db/schema'; // Your schema definitions
import { eq, and, between } from 'drizzle-orm';
import { z } from 'zod';

// Schema validation for event data
const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time_from: z.string().min(1, 'Start time is required'),
  time_until: z.string().min(1, 'End time is required'),
  calendar_id: z.number().positive('Calendar ID must be a positive number'),
  user_id: z.string().min(1, 'User ID is required'),
});

const updateEventSchema = eventSchema.partial();

// GET /api/events - Get all events or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendar_id');
    const userId = searchParams.get('user_id');
    const month = searchParams.get('month');
    const year =  searchParams.get('year');

    // Apply filters if provided
    const conditions = [];
    if (calendarId) {
      conditions.push(eq(events.calendar_id, parseInt(calendarId)));
    }
    if (userId) {
      conditions.push(eq(events.user_id, userId));
    }
    if(month && year){
      let monthStart = `${year}-${month}-01`;
      let nextMonth = parseInt(month) + 1;
      let nextYear = parseInt(year);
      if(nextMonth > 12){
        nextYear++;
        nextMonth = 1;
      }
      let nextMonthStart = `${nextYear}-${nextMonth}-01`;

      conditions.push(between(events.date, monthStart, nextMonthStart))
    }

    let query = db
      .select({
        id: events.id,
        name: events.name,
        category: events.category,
        date: events.date,
        time_from: events.time_from,
        time_until: events.time_until,
        calendar_id: events.calendar_id,
        user_id: events.user_id,
        //calendar_name: calendars.name,
        user_email: user.email,
      })
      .from(events)
      //.leftJoin(calendars, eq(events.calendar_id, calendars.id))
      .leftJoin(user, eq(events.user_id, user.id));

    

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/*
// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = eventSchema.parse(body);

    // Check if calendar exists and user has access
    const calendar = await db
      .select()
      .from(calendars)
      .where(eq(calendars.id, validatedData.calendar_id))
      .limit(1);

    if (calendar.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Calendar not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, validatedData.user_id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the event
    const newEvent = await db
      .insert(events)
      .values({
        name: validatedData.name,
        category: validatedData.category,
        date: validatedData.date,
        time_from: validatedData.time_from,
        time_until: validatedData.time_until,
        calendar_id: validatedData.calendar_id,
        user_id: validatedData.user_id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newEvent[0],
      message: 'Event created successfully'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id] - Update an existing event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate the request body (partial update)
    const validatedData = updateEventSchema.parse(body);

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // If updating calendar_id, verify it exists
    if (validatedData.calendar_id) {
      const calendar = await db
        .select()
        .from(calendars)
        .where(eq(calendars.id, validatedData.calendar_id))
        .limit(1);

      if (calendar.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Calendar not found' },
          { status: 404 }
        );
      }
    }

    // If updating user_id, verify it exists
    if (validatedData.user_id) {
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, validatedData.user_id))
        .limit(1);

      if (currentUser.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.date !== undefined) updateData.date = new Date(validatedData.date);
    if (validatedData.time_from !== undefined) updateData.time_from = validatedData.time_from;
    if (validatedData.time_until !== undefined) updateData.time_until = validatedData.time_until;
    if (validatedData.calendar_id !== undefined) updateData.calendar_id = validatedData.calendar_id;
    if (validatedData.user_id !== undefined) updateData.user_id = validatedData.user_id;

    // Update the event
    const updatedEvent = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedEvent[0],
      message: 'Event updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete the event
    await db
      .delete(events)
      .where(eq(events.id, eventId));

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
  */