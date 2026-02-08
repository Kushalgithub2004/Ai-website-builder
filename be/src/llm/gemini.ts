import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider } from "./types";

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    private async retryRequest<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
                console.log(`[Gemini] Rate limit hit, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryRequest(operation, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    async generateTemplate(prompt: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        return this.retryRequest(async () => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
            });
            return result.response.text().trim();
        });
    }

    async chat(messages: any[], systemPrompt?: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        // Convert Anthropic-style messages to Gemini format
        const history = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: typeof msg.content === 'string' ? msg.content : msg.content[0].text }]
        }));

        return this.retryRequest(async () => {
            const result = await model.generateContent({
                contents: history
            });
            return result.response.text();
        });
    }
}
