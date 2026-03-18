/**
 * Boot-Time Environment Validation
 * 
 * Zod schema that strictly validates all required environment variables
 * at application startup. Ensures the app never boots in a broken state.
 */

import { z } from "zod";

export const envSchema = z.object({
    // Database — at least one must be present
    DATABASE_URL: z.string().min(10, "DATABASE_URL must be a valid connection string").optional(),
    POSTGRES_URL: z.string().min(10, "POSTGRES_URL must be a valid connection string").optional(),

    // Security — always required
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be at least 32 characters"),

    // Optional — graceful if missing
    NEXTAUTH_URL: z.string().url().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
}).refine(
    (data) => data.DATABASE_URL || data.POSTGRES_URL,
    { message: "At least one of DATABASE_URL or POSTGRES_URL must be defined" }
)

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables. Returns parsed env or null with errors.
 */
export function validateEnv(): { success: boolean; errors: string[] } {
    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        const errors = result.error.issues.map(
            (issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`
        )
        return { success: false, errors }
    }

    return { success: true, errors: [] }
}
