import { GoogleGenerativeAI } from "@google/generative-ai";
import { INTERNAL_getSecret } from "../src/lib/ai/secrets";

async function main() {
    const key = await INTERNAL_getSecret("GEMINI_API_KEY");
    if (!key) throw new Error("no key");
    const genAI = new GoogleGenerativeAI(key);

    const testModels = [
        "gemini-flash-latest",
        "gemini-2.0-flash-lite-001",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-pro-latest"
    ];

    for (const m of testModels) {
        console.log(`\nTesting ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Reply with simply the word 'ok'.");
            console.log(`SUCCESS [${m}]:`, result.response.text().trim());
            // break; // DON'T stop, let's test all to be absolutely sure what works.
        } catch (e: any) {
            console.log(`FAILED [${m}]:`, e.message);
        }
    }
}

main().catch(console.error);
