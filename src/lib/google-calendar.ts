import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { addMinutes, areIntervalsOverlapping, isAfter, isBefore } from 'date-fns';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// Types
export interface TimeSlot {
    start: string; // ISO string
    end: string;   // ISO string
}

export interface TimeSlotAvailability {
    time: string;
    available: boolean;
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
 * Logic: (Working Hours) - (Google Busy Time) - (Local DB Bookings) - (Buffers) - (Blocked Dates)
 *
 * Returns ALL slots within working hours, marked as available or unavailable.
 */
export async function getAvailableSlots(dateStr: string): Promise<TimeSlotAvailability[]> {
    // 0. Check if date is manually blocked
    const utcMidnight = new Date(`${dateStr}T00:00:00.000Z`);

    const blockedDate = await prisma.blockedDate.findFirst({
        where: { date: utcMidnight }
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
    const availability = config.availability as any;

    // 2. Determine Working Hours for this day
    const safeAnchorDate = new Date(`${dateStr}T12:00:00Z`);
    const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = WEEKDAYS[safeAnchorDate.getUTCDay()];
    const daySchedule = availability[dayName];

    if (!daySchedule?.isOpen) return [];

    // Parse start/end times precisely in EAT
    const workingStart = new Date(`${dateStr}T${daySchedule.start}:00+03:00`);
    const workingEnd = new Date(`${dateStr}T${daySchedule.end}:00+03:00`);

    const minNoticeMinutes = config.minNotice || 120;
    const bookingThreshold = addMinutes(new Date(), minNoticeMinutes);

    // 3. Fetch Busy Slots from Google Calendar
    let googleBusySlots: any[] = [];
    try {
        const res = await calendar.freebusy.query({
            requestBody: {
                timeMin: workingStart.toISOString(),
                timeMax: workingEnd.toISOString(),
                items: [{ id: calendarId }],
            },
        });
        googleBusySlots = res.data.calendars?.[calendarId]?.busy || [];
    } catch (e) {
        console.warn("Could not fetch Google Calendar busy slots", e);
    }

    // 4. CRITICAL: Also fetch bookings from LOCAL DATABASE
    const localBookings = await prisma.booking.findMany({
        where: {
            scheduledAt: {
                gte: workingStart,
                lt: workingEnd
            },
            bookingStatus: {
                not: "CANCELLED"
            },
            deletedAt: null
        },
        select: {
            scheduledAt: true,
            duration: true
        }
    });

    // Convert local bookings into busy-slot format
    const localBusySlots = localBookings.map(booking => ({
        start: booking.scheduledAt.toISOString(),
        end: addMinutes(booking.scheduledAt, booking.duration).toISOString()
    }));

    // Merge Google Calendar busy slots + local DB busy slots
    const allBusySlots = [
        ...googleBusySlots.map(s => ({ start: s.start!, end: s.end! })),
        ...localBusySlots
    ];

    // 5. Generate All Possible Slots
    const slots: TimeSlotAvailability[] = [];
    let currentSlotStart = workingStart;

    while (isBefore(currentSlotStart, workingEnd)) {
        const currentSlotEnd = addMinutes(currentSlotStart, duration);

        // Stop if the slot goes past working hours
        if (isAfter(currentSlotEnd, workingEnd)) break;

        // 6. Check Collision with ALL Busy Slots (Google + DB)
        // Expand the checking window by buffer time to prevent back-to-back bookings
        const checkStart = addMinutes(currentSlotStart, -buffer);
        const checkEnd = addMinutes(currentSlotEnd, buffer);

        const isBusy = allBusySlots.some((busy) => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);

            return areIntervalsOverlapping(
                { start: checkStart, end: checkEnd },
                { start: busyStart, end: busyEnd }
            );
        });

        const isPastThreshold = !isAfter(currentSlotStart, bookingThreshold);
        const isAvailable = !isBusy && !isPastThreshold;

        slots.push({
            time: currentSlotStart.toISOString(),
            available: isAvailable
        });

        // Move to next slot by pure Duration for clean visual intervals (9:00, 9:30, 10:00)
        currentSlotStart = addMinutes(currentSlotStart, duration);
    }

    return slots;
}

/**
 * Create a new Calendar Event
 */
export async function createCalendarEvent(
    date: Date,
    isoTime: string,
    clientData: { name: string, email: string, notes?: string },
    serviceName: string,
    customDuration?: number
) {
    const { client, calendarId } = await getGoogleClient();
    const calendar = google.calendar({ version: 'v3', auth: client });

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { GoogleCalendarConfig: true }
    });
    const duration = customDuration || settings?.GoogleCalendarConfig?.eventDuration || 30;

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
            timeZone: 'Africa/Nairobi',
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Africa/Nairobi',
        },
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    try {
        const res = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
            conferenceDataVersion: 1,
        });
        return res.data;
    } catch (error: any) {
        // Fallback: If the target calendar is a free @gmail.com account, Google explicitly blocks
        // Service Accounts from auto-generating Meet links and throws a 400 Invalid conference type value.
        // We catch this specifically and retry creating the event WITHOUT the Meet link payload so it at least syncs.
        if (error.message && error.message.includes("Invalid conference type value")) {
            console.warn("Target calendar does not support Service Account Meet link generation. Retrying without Meet link...");
            delete (event as any).conferenceData;

            const retryRes = await calendar.events.insert({
                calendarId: calendarId,
                requestBody: event,
            });
            return retryRes.data;
        }
        throw error;
    }
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
                timeZone: 'Africa/Nairobi',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Africa/Nairobi',
            },
        },
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
    });
}
