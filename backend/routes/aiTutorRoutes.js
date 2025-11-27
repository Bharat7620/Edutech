const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// Initialize OpenAI with your API key from .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: true, message: "Message is required" });
  }

  // If API key is not set, return a lightweight fallback reply so the UI remains functional
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OpenAI API key is not set (OPENAI_API_KEY) — returning fallback reply for UI testing"
    );
    // Simple deterministic fallback (echo) to allow UI testing without OpenAI access
    const fallback = `Demo reply (OpenAI key not configured). You asked: "${message}"`;
    return res.json({ reply: fallback });
  }

  try {
    // Use the SDK to create a chat completion. Different SDK versions return
    // slightly different shapes; handle common shapes safely.
    // Use a widely-available model so users without GPT-4 access can test
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    // Safely extract the reply text from common response shapes
    let replyText = null;
    if (response?.choices && response.choices.length > 0) {
      // Newer SDK: choices[0].message.content
      replyText = response.choices[0]?.message?.content || response.choices[0]?.text;
    }

    // Fallback: some SDKs return 'response.data' or string
    if (!replyText && response?.data) {
      replyText = response.data?.choices?.[0]?.message?.content || response.data?.choices?.[0]?.text;
    }

    // Final fallback
    if (!replyText) replyText = "(no reply from AI)";

    return res.json({ reply: replyText });
  } catch (error) {
    console.error("Error in /api/ai/chat:", error);

    // Try to extract a helpful message from the error for logs
    const errMessage =
      error?.response?.data?.error?.message || error?.message || (error?.response && JSON.stringify(error.response.data)) || "Internal server error";

    // For development: return a friendly fallback reply instead of a 500 so the UI remains functional.
    // Include a short hint for the user to check server logs for details.
    const fallback = `Sorry — the AI service is temporarily unavailable. Demo reply: you asked "${message}".`;
    console.warn("/api/ai/chat fallback reply returned. Error:", errMessage);

    return res.json({ reply: fallback, _debug: { error: errMessage } });
  }
});

// POST /api/verify-upi
router.post('/verify-upi', async (req, res) => {
  const { upi, gateway } = req.body || {};

  if (!upi) return res.status(400).json({ error: true, message: 'UPI ID is required' });

  // Basic format validation
  const parts = upi.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return res.status(400).json({ error: true, message: 'Invalid UPI ID format' });
  }

  // Simulate async verification delay
  await new Promise((r) => setTimeout(r, 600));

  // Simulate success and return an inferred display name
  const name = parts[0];
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return res.json({ verified: true, name: displayName, gateway: gateway || null });
});

// POST /api/process-payment - mock payment processing endpoint
router.post('/process-payment', async (req, res) => {
  const { method, amount, details } = req.body || {};
  if (!method || !amount) return res.status(400).json({ error: true, message: 'method and amount required' });

  // simulate processing delay
  await new Promise(r => setTimeout(r, 800));

  // simulate success with transaction id
  const txId = `TXN-${Date.now().toString().slice(-6)}`;
  return res.json({ success: true, txId, method, amount, details });
});

module.exports = router;
