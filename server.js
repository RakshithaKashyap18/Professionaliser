const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI rewriting logic
async function professionalizeTextWithAI(input) {
  const prompt = `
You are a professional rewriting assistant.

Your job is to:
1. Correct all spelling mistakes.
2. Correct grammar.
3. Apply correct punctuation (.,;:!?).
4. Preserve the exact meaning — do NOT guess or add new meaning.
5. Rewrite in a clear, concise, polished, professional tone.
6. NO quotation marks anywhere in the output.
7. If meaning is ambiguous, choose the most literal interpretation.
8. Output ONLY the rewritten text — no explanations.

Text to rewrite:
${input}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  let result = completion.choices[0].message.content.trim();

  // Remove accidental quotes if model adds them
  result = result.replace(/^"(.*)"$/, "$1");
  result = result.replace(/["“”]/g, "");

  return result;
}

// API endpoint
app.post("/api/professionalize", async (req, res) => {
  try {
    const { text, signature } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 200) {
      return res.status(400).json({ error: "Max 200 words allowed" });
    }

    // Rewrite text only
    let rewritten = await professionalizeTextWithAI(text);

    // Do NOT add signature here — frontend will handle it
    res.json({
      professionalText: rewritten,
      signature: signature ? signature.trim() : ""
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "AI rewriting failed" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
