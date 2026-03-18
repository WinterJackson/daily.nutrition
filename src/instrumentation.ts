/**
 * Next.js Instrumentation — runs once during Node.js server boot.
 * Validates environment variables at startup.
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { validateEnv } = await import("@/lib/env")
        const result = validateEnv()

        if (!result.success) {
            console.error("\n╔══════════════════════════════════════════════╗")
            console.error("║  ⛔  ENVIRONMENT VALIDATION FAILED           ║")
            console.error("╠══════════════════════════════════════════════╣")
            for (const error of result.errors) {
                console.error(`║ ${error}`)
            }
            console.error("╚══════════════════════════════════════════════╝\n")
        } else {
            console.log("✅ Environment validation passed")
        }
    }
}
