"use server"

import { updateServiceConfig } from "@/lib/service-manager";
import { revalidatePath } from "next/cache";

export async function toggleServiceVisibility(id: string, isVisible: boolean) {
    try {
        await updateServiceConfig(id, isVisible);
        // Revalidate all pages where services might be shown
        revalidatePath("/");
        revalidatePath("/services");
        revalidatePath("/booking");
        revalidatePath("/admin/services");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle service:", error);
        return { success: false, error: "Failed to update service status" };
    }
}
