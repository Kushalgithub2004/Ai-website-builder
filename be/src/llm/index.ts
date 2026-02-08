import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { LLMProvider } from "./types";

export function getLLMProvider(apiKey?: string, provider: string = "gemini"): LLMProvider {
    if (provider === "anthropic") {
        const anthropicKey = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error("No API key found for Anthropic");
        }
        return new AnthropicProvider(anthropicKey);
    }

    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        throw new Error("No API key found for Gemini");
    }
    return new GeminiProvider(geminiKey);
}
