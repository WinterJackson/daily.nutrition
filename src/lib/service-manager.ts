import { services } from "./data";
import { prisma } from "./prisma";

// Helper to seed/sync services if missing
export async function ensureServicesExist() {
    try {
        const count = await prisma.service.count();
        if (count === 0) {
            console.log("Seeding services to database...");
            for (const service of services) {
                await prisma.service.create({
                    data: {
                        id: service.id,
                        title: service.title,
                        shortDescription: service.shortDescription,
                        isVisible: true,
                    }
                });
            }
        }
    } catch (error) {
        console.warn("Database not ready or reachable, treating as empty config.", error);
    }
}

export async function getServiceConfig(): Promise<Record<string, boolean>> {
    try {
        // Attempt to fetch from DB
        const dbServices = await prisma.service.findMany({
            select: { id: true, isVisible: true }
        });

        if (dbServices.length === 0) {
            // Fallback to all true for static list
            return services.reduce((acc, s) => ({ ...acc, [s.id]: true }), {} as Record<string, boolean>);
        }

        return dbServices.reduce((acc, s) => {
            acc[s.id] = s.isVisible;
            return acc;
        }, {} as Record<string, boolean>);

    } catch (error) {
        // Check if it's a "connection error" to avoid spamming logs, but logging is good
        console.error("Failed to fetch service config from DB (using default):", error);
        // Fallback static
        return services.reduce((acc, s) => ({ ...acc, [s.id]: true }), {} as Record<string, boolean>);
    }
}

export async function updateServiceConfig(id: string, isVisible: boolean) {
    try {
        // Upsert ensures that if the service didn't exist in DB yet (e.g. static file updated), we create it
        await prisma.service.upsert({
            where: { id },
            update: { isVisible },
            create: {
                id,
                title: services.find(s => s.id === id)?.title || "Unknown Service",
                shortDescription: services.find(s => s.id === id)?.shortDescription || "",
                isVisible
            }
        });
        return getServiceConfig();
    } catch (error) {
        console.error("Failed to update service in DB:", error);
        throw error;
    }
}

export async function getAllServicesWithStatus() {
    const config = await getServiceConfig();

    return services.map(service => ({
        ...service,
        isVisible: config[service.id] !== false // Default to true
    }));
}
