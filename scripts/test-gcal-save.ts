import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import "dotenv/config";

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY!, "hex"), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

async function run() {
    console.log("MOCK UPDATE SETTINGS");

    const googleCalendarConfig = {
        clientEmail: "test@example.com",
        privateKey: "TEST_PRIVATE_KEY",
        eventDuration: 30,
        bufferTime: 15,
        minNotice: 120
    };

    let googleConfigPayload: any = undefined;
    if (googleCalendarConfig) {
        const { clientEmail, privateKey, ...restConfig } = googleCalendarConfig;
        googleConfigPayload = { ...restConfig, updatedAt: new Date() };
        if (clientEmail?.trim()) googleConfigPayload.encryptedClientEmail = encrypt(clientEmail);
        if (privateKey?.trim()) googleConfigPayload.encryptedPrivateKey = encrypt(privateKey);
    }

    console.log("Payload:", googleConfigPayload);

    try {
        const result = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
                GoogleCalendarConfig: googleConfigPayload ? {
                    upsert: {
                        create: googleConfigPayload,
                        update: googleConfigPayload
                    }
                } : undefined
            },
            create: {
                id: "default",
                businessName: "Test",
                contactEmail: "test@test.com",
                phoneNumber: "123",
                address: "address",
                pageTitle: "title",
                metaDescription: "desc",
                keywords: "kw",
                GoogleCalendarConfig: googleConfigPayload ? {
                    create: googleConfigPayload
                } : undefined
            }
        });
        console.log("Upsert Success");

        const check = await prisma.googleCalendarConfig.findUnique({
            where: { settingsId: "default" }
        });
        console.log("Saved DB Record:", check);

    } catch (e) {
        console.error("Error:", e);
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
