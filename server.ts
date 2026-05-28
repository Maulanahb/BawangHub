import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini
let ai: GoogleGenAI;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("GEMINI_API_KEY inside server.ts is not defined. AI features won't work.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI", e);
}

const handleGeminiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
};

app.post("/api/gemini/generate", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini not configured" });
  try {
    const { prompt, isJson, inlineData } = req.body;
    const model = "gemini-2.0-flash";
    
    const parts: any[] = [{ text: prompt }];
    if (inlineData) {
      parts.push({ inlineData });
    }
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts }],
      config: isJson ? { responseMimeType: "application/json" } : undefined
    });
    
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error", error);
    res.status(500).json({ error: error?.message || 'AI Error' });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  if (!ai) return res.status(500).json({ error: "Gemini not configured" });
  try {
    const { history, message, systemInstruction } = req.body;
    const model = "gemini-2.0-flash";
    
    // Format history
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));
    
    const contents = [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ];
    
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Error", error);
    res.status(500).json({ error: error?.message || 'AI Error' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
