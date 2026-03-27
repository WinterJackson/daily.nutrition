import { INTERNAL_getSecret } from "../src/lib/ai/secrets";

async function main() {
    const key = await INTERNAL_getSecret("GEMINI_API_KEY");
    if (!key) throw new Error("No API key found in DB.");

    console.log("Fetching models...");
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
    const data = await res.json();

    if (data.error) {
        console.error("API Error:", data.error.message);
        return;
    }

    console.log("Available Gemini Models:");
    data.models.forEach((m: any) => {
        if (m.name.includes("gemini")) {
            console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
        }
    });
}

main().catch(console.error);
