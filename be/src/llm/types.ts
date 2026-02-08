export interface LLMProvider {
    generateTemplate(prompt: string): Promise<string>;
    chat(messages: any[], systemPrompt?: string): Promise<string>;
}
