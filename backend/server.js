import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {

    res.json({
        status: "online",
        assistant: "EchoEdge",
        message: "EchoEdge backend is running"
    });

});


/* =====================================================
   AI CHAT
===================================================== */

app.post("/api/ask", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || !message.trim()) {

            return res.status(400).json({
                error: "Message is required"
            });

        }


        const systemInstruction = `
You are EchoEdge, a fast and friendly AI voice assistant.

Your job is to answer normal questions like a smart voice assistant.

Rules:

1. Give direct and useful answers.
2. Keep simple questions concise.
3. Explain technical questions clearly.
4. If the user asks for calculations, calculate carefully.
5. If the user asks for definitions, explain simply.
6. If the user asks general knowledge questions, answer naturally.
7. Never say you are Alexa, Siri or Google Assistant.
8. Your name is EchoEdge.
9. Do not use unnecessary markdown.
10. Respond naturally because your response may be spoken aloud.
        `;


        const response = await ai.models.generateContent({

            model: "gemini-3.7-flash",

            contents: message,

            config: {
                systemInstruction,
                temperature: 0.4,
                maxOutputTokens: 500
            }

        });


        const answer = response.text || "Sorry, I couldn't generate a response.";


        res.json({

            success: true,

            question: message,

            answer: answer

        });


    } catch (error) {

        console.error("AI ERROR:", error);

        res.status(500).json({

            success: false,

            error: "EchoEdge could not process your request."

        });

    }

});


/* =====================================================
   SERVER
===================================================== */

app.listen(PORT, () => {

    console.log(`
========================================
        ECHOEDGE BACKEND
========================================

Server running on:

http://localhost:${PORT}

API:

POST /api/ask

========================================
    `);

});