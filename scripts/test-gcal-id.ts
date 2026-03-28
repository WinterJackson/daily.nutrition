import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function run() {
    console.log("CHECKING CALENDAR ID in DB");

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "default" }
    });
    console.log("googleCalendarId:", settings?.googleCalendarId);
}

run().finally(() => prisma.$disconnect());
