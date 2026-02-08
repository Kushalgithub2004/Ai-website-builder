require("dotenv").config();
import express from "express";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import { getLLMProvider } from "./llm";

const app = express();
app.use(cors())
app.use(express.json())

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    const apiKey = req.body.apiKey;
    const provider = req.body.provider || "gemini";
    const llm = getLLMProvider(apiKey, provider);

    try {
        const answer = await llm.generateTemplate(prompt);

        if (answer.trim().toLowerCase() === "react") {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            })
            return;
        }

        if (answer.trim().toLowerCase() === "node") {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            })
            return;
        }

        res.status(403).json({ message: "You cant access this" })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const apiKey = req.body.apiKey;
    const provider = req.body.provider || "gemini";
    const llm = getLLMProvider(apiKey, provider);

    try {
        const response = await llm.chat(messages, getSystemPrompt());

        res.json({
            response: response
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.listen(3000);

