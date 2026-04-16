import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Gemini API key missing. Set GEMINI_API_KEY in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL = "gemini-2.5-flash";


const callGemini = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,

      config: {
        temperature: 0.2,
      },
    });

    const text = response.text;

    console.log("🧠 Gemini Raw Response:", text);

    return text;
  } catch (error) {
    console.error(" Gemini Error:", error);
    throw new Error("Gemini API failed");
  }
};



const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("❌ JSON Parse Error:", err.message);
    throw new Error("Invalid JSON from Gemini");
  }
};


// 1️⃣ Parse Field Reports
export const parseFieldReport = async (rawText) => {
  const prompt = `
You are an AI system that extracts structured disaster data.

Extract:
- zone_id (string)
- need_type (array of strings)
- urgency (1-10)
- people_affected (number)
- severity (1-10)
- current_volunteers (number)

Return ONLY valid JSON.
No explanation. No markdown.

Text:
"""${rawText}"""
`;

  const response = await callGemini(prompt);
  return extractJSON(response);
};


// 2️⃣ Explain Allocation Decisions
export const generateExplanation = async (data) => {
  const prompt = `
You are an AI explaining resource allocation decisions for a disaster response system.

Return JSON with EXACTLY this shape:
{
  "dashboard_insight": "...",
  "global_summary": "...",
  "assignments": [
    {
      "volunteer_id": "",
      "zone_id": "",
      "reason": ""
    }
  ]
}

Field rules:
- "dashboard_insight": A concise 2-3 sentence plain-language summary for a compact dashboard card. Focus on overall coverage quality, top priority zones covered, and any critical gaps. Do NOT mention raw IDs. Max 60 words.
- "global_summary": A full detailed paragraph explaining the overall allocation strategy.
- "assignments": One entry per assignment. Use the raw IDs from the data as-is.

ONLY JSON. No markdown. No explanation outside JSON.

Data:
${JSON.stringify(data)}
`;

  const response = await callGemini(prompt);
  return extractJSON(response);
};


// 3️⃣ Analyze Simulation
export const analyzeSimulation = async (data) => {
  const prompt = `
You are an AI decision advisor for disaster response optimization.

⚠️ CRITICAL RULE:

Higher impact value = BETTER allocation
Lower impact value = WORSE allocation

You must strictly follow this rule.

Return ONLY JSON:
{
"recommendation": "baseline | proposed",
"analysis": "...",
"risks": ["..."],
"benefits": ["..."],
"confidence_baseline": number,
"confidence_proposal": number
}

Decision Logic:

If simulatedImpact > baselineImpact → recommendation = "proposed"
If simulatedImpact < baselineImpact → recommendation = "baseline"
If equal → recommendation = "baseline"

Explain clearly:

Whether impact increased or decreased
Percentage change
Why the change happened (zone imbalance, skill mismatch, etc.)

Data:
${JSON.stringify(data)}
`;

  const response = await callGemini(prompt);
  return extractJSON(response);
};


// 4️⃣ Generate Alerts
export const generateAlerts = async (data) => {
  const prompt = `
You are a monitoring AI.

Return JSON:
{
  "alerts": [
    {
      "zone_id": "",
      "type": "critical | warning | info",
      "message": "",
      "suggested_action": ""
    }
  ]
}

ONLY JSON.

Data:
${JSON.stringify(data)}
`;

  const response = await callGemini(prompt);
  return extractJSON(response);
};