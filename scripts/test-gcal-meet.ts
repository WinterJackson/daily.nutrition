import "dotenv/config";
import { createCalendarEvent } from "../src/lib/google-calendar";

async function run() {
    console.log("TESTING GOOGLE CALENDAR API PERMISSIONS...");
    try {
        const result = await createCalendarEvent(
            new Date(),
            new Date(Date.now() + 3600000).toISOString(),
            {
                name: "Test User",
                email: "test@example.com",
                notes: "This is a diagnostic test."
            },
            "Diagnostic Booking",
            30
        );
        console.log("SUCCESS! Event Created:");
        console.log(result.htmlLink);
        console.log(result.hangoutLink);
    } catch (e: any) {
        console.error("\n[API FAILURE] Google Calendar refused the request:");
        console.error(e.message);
        if (e.response && e.response.data) {
            console.error("Google API Details:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

run().then(() => {
    console.log("Diagnostic complete.");
    process.exit(0);
});
