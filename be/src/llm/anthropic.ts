import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { LLMProvider } from "./types";

export class AnthropicProvider implements LLMProvider {
    private anthropic: Anthropic;

    constructor(apiKey: string) {
        this.anthropic = new Anthropic({ apiKey });
    }

    async generateTemplate(prompt: string): Promise<string> {
        const response = await this.anthropic.messages.create({
            messages: [{
                role: 'user', content: prompt
            }],
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 200,
            system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        });

        return (response.content[0] as TextBlock).text;
    }

    async chat(messages: any[], systemPrompt?: string): Promise<string> {
        const response = await this.anthropic.messages.create({
            messages: messages,
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            system: systemPrompt
        });

        return (response.content[0] as TextBlock)?.text;
    }
}
