require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For listing models, we don't need a specific model instance.
    // But the SDK doesn't expose a root-level listModels easily on the client 
    // without getting deep into the model manager or similar.
    // Actually, checking docs/types implies generic use.
    // Let's try getting a model and asking for info if possible, or just standard list.
    // Wait, the SDK has a ModelManager? No, it's usually on the genAI instance or similar.
    // Using a known fallback: gemini-pro is usually safe.

    // Actually, looking at SDK usage:
    // There isn't a direct "listModels" in the high level GoogleGenerativeAI class in some versions.
    // But let's try a direct fetch if node if needed.
    // Or just try-catch a few known model names.

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    console.log("Testing models...");

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS: ${modelName}`);
        } catch (e) {
            console.log(`FAILED: ${modelName} - ${e.message.split('\n')[0]}`);
        }
    }
}

listModels();
