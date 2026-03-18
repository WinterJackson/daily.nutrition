import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { addMinutes, areIntervalsOverlapping, format, isAfter, isBefore } from 'date-fns';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// Types
export interface TimeSlot {
    start: string; // ISO string
    end: string;   // ISO string
}

export interface AvailabilityParams {
    date: Date;
    timezone?: string;
}

/**
 * Authenticates with Google using stored encrypted credentials
 */
async function getGoogleClient() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    });

    if (!settings?.GoogleCalendarConfig?.encryptedClientEmail ||
        !settings?.GoogleCalendarConfig?.encryptedPrivateKey) {
        throw new Error('Google Calendar credentials not configured');
    }

    try {
        const clientEmail = decrypt(settings.GoogleCalendarConfig.encryptedClientEmail);
        const privateKey = decrypt(settings.GoogleCalendarConfig.encryptedPrivateKey);

        const client = new JWT({
            email: clientEmail,
            key: privateKey.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
        });

        return { client, calendarId: settings.googleCalendarId };
    } catch (error) {
        console.error("Auth Error:", error);
        throw new Error('Failed to decrypt credentials or authenticate');
    }
}

/**
 * Calculates available time slots for a given date
 * Logic: (Working Hours) - (Google Busy Time) - (Buffers) - (Blocked Dates)
 */
export async function getAvailableSlots(dateStr: string): Promise<string[]> {
    // 0. Check if date is manually blocked
    // Enforce EAT timezone for boundaries
    const dayStartEAT = new Date(`${dateStr}T00:00:00+03:00`);
    const dayEndEAT = new Date(`${dateStr}T23:59:59+03:00`);

    const blockedDate = await prisma.blockedDate.findFirst({
        where: {
            date: {
                gte: dayStartEAT,
                lt: dayEndEAT
            }
        }
    });

    if (blockedDate) {
        console.log(`Date ${dateStr} is blocked: ${blockedDate.reason || 'No reason provided'}`);
        return [];
    }

    const { client, calendarId } = await getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    // 1. Fetch Configuration
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    });

    const config = settings?.GoogleCalendarConfig;
    if (!config) return [];

    const duration = config.eventDuration || 30;
    const buffer = config.bufferTime || 15;
    const availability = config.availability as any; // Typed locally in component usually

    // 2. Determine Working Hours for this day
    const dayName = format(dayStartEAT, 'EEEE').toLowerCase(); // monday, tuesday...
    const daySchedule = availability[dayName];

    // If closed today, return empty
    if (!daySchedule?.isOpen) return [];

    // Parse start/end times precisely in EAT
    const workingStart = new Date(`${dateStr}T${daySchedule.start}:00+03:00`);
    const workingEnd = new Date(`${dateStr}T${daySchedule.end}:00+03:00`);

    // 3. Fetch Busy Slots from Google
    // Query for the whole business day 
    const queryStart = workingStart;
    const queryEnd = workingEnd;

    const res = await calendar.freebusy.query({
        requestBody: {
            timeMin: queryStart.toISOString(),
            timeMax: queryEnd.toISOString(),
            items: [{ id: calendarId }],
        },
    });

    const busySlots = res.data.calendars?.[calendarId]?.busy || [];

    // 4. Generate All Possible Slots
    const slots: string[] = [];
    let currentSlotStart = workingStart;

    // Iterate from Start Time to End Time
    while (isBefore(currentSlotStart, workingEnd)) {
        const currentSlotEnd = addMinutes(currentSlotStart, duration);

        // Stop if the slot goes past working hours
        if (isAfter(currentSlotEnd, workingEnd)) break;

        // 5. Check Collision with Google Busy Slots
        const isBusy = busySlots.some((busy) => {
            const busyStart = new Date(busy.start!);
            const busyEnd = new Date(busy.end!);

            return areIntervalsOverlapping(
                { start: currentSlotStart, end: currentSlotEnd },
                { start: busyStart, end: busyEnd }
            );
        });

        if (!isBusy) {
            if (isAfter(currentSlotStart, new Date())) { // Only future slots
                slots.push(currentSlotStart.toISOString());
            }
        }

        // Move to next slot: Duration + Buffer
        // Note: Some systems do fixed intervals (e.g. every 30 mins) regardless of duration. 
        // Here we use (Start + Duration + Buffer) which is typical for "back-to-back" logic.
        // Alternatively, we could increment by a fixed 'step' (e.g. 15 mins) and check availability.
        // For now, let's use discrete slots based on duration. To make it more flexible like Calendly,
        // we usually iterate by a smaller "step" (like 15 or 30 mins) and check if a 'duration' block fits.
        // Let's assume standard behavior: Increment by Duration for now, or 30 mins if duration is long?
        // Let's stick to Duration + Buffer for simplicity of the first version.
        currentSlotStart = addMinutes(currentSlotStart, duration + buffer);
    }

    return slots;
}

/**
 * Create a new Calendar Event
 */
export async function createCalendarEvent(
    date: Date, // legacy param for backwards compat, though we can usually infer
    isoTime: string, // now receives full absolute ISO string
    clientData: { name: string, email: string, notes?: string },
    serviceName: string,
    customDuration?: number // Optional custom duration override
) {
    const { client, calendarId } = await getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    // Get duration settings
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    });
    // Use customDuration if provided, otherwise fall back to settings, then default 30
    const duration = customDuration || settings?.GoogleCalendarConfig?.eventDuration || 30;

    // Parse absolute start time
    const startDateTime = new Date(isoTime);
    const endDateTime = addMinutes(startDateTime, duration);

    const event = {
        summary: `Consultation: ${clientData.name} - ${serviceName}`,
        description: `
            <strong>Service:</strong> ${serviceName}<br/>
            <strong>Client:</strong> ${clientData.name} (${clientData.email})<br/>
            <strong>Notes:</strong> ${clientData.notes || "None"}
        `,
        start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Africa/Nairobi', // Default for now, should be configurable or inferred
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Africa/Nairobi',
        },
        attendees: [
            { email: clientData.email },
            // Add business email too if needed, though they own the calendar
        ],
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    const res = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
        sendUpdates: 'all', // Send email invites to attendees
        conferenceDataVersion: 1, // Required for creating conference data
    });

    return res.data;
}

/**
 * Updates an existing Calendar Event (e.g., for Rescheduling)
 */
export async function updateCalendarEvent(
    eventId: string,
    isoTime: string,
    durationInMinutes: number
) {
    const { client, calendarId } = await getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    const startDateTime = new Date(isoTime);
    const endDateTime = addMinutes(startDateTime, durationInMinutes);

    const res = await calendar.events.patch({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: {
            start: {
                dateTime: startDateTime.toISOString(),
                // Keep default timezone for now, matching create logic
                timeZone: 'Africa/Nairobi',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Africa/Nairobi',
            },
        },
        sendUpdates: 'all',
    });

    return res.data;
}

/**
 * Deletes a Calendar Event (e.g., for Cancellations)
 */
export async function deleteCalendarEvent(eventId: string) {
    const { client, calendarId } = await getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    await calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
        sendUpdates: 'all', // Notify attendees of cancellation
    });
}
