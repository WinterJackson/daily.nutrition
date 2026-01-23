import fs from "fs/promises";
import path from "path";
import { services } from "./data";

const CONFIG_FILE = path.join(process.cwd(), "src/data/services-config.json");

// Ensure directory exists
async function ensureConfigFile() {
    try {
        await fs.access(CONFIG_FILE);
    } catch {
        const dir = path.dirname(CONFIG_FILE);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
        // Default config: All services active
        const defaultConfig = services.reduce((acc, service) => {
            acc[service.id] = true;
            return acc;
        }, {} as Record<string, boolean>);

        await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
}

export async function getServiceConfig(): Promise<Record<string, boolean>> {
    await ensureConfigFile();
    try {
        const data = await fs.readFile(CONFIG_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to read service config:", error);
        return {};
    }
}

export async function updateServiceConfig(id: string, isVisible: boolean) {
    await ensureConfigFile();
    const config = await getServiceConfig();
    config[id] = isVisible;
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    return config;
}

export async function getPublicServices() {
    const config = await getServiceConfig();
    return services.filter(service => config[service.id] !== false);
}

export async function getAllServicesWithStatus() {
    const config = await getServiceConfig();
    return services.map(service => ({
        ...service,
        isVisible: config[service.id] !== false // Default to true if missing
    }));
}
