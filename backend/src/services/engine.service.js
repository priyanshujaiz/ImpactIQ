import axios from "axios";

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000/engine";

// Render free tier cold starts take ~30-50s — use 90s timeout
// NOTE: baseURL must end with path, routes must NOT start with /
// axios drops the baseURL path when route starts with /
const engineClient = axios.create({
  baseURL: ENGINE_URL,
  timeout: 90000,
});

export const optimizeAllocation = async (data) => {
  try {
    const response = await engineClient.post("optimize", data); // no leading slash
    return response.data;
  } catch (error) {
    console.error("Engine Error:", error.message);
    throw error;
  }
};

export const scoreZones = async (zonesData) => {
  try {
    const response = await engineClient.post("score/zones", { // no leading slash
      zones: zonesData,
    });
    return response.data;
  } catch (error) {
    console.error("Engine Score Error:", error.message);
    throw new Error("Zone scoring failed");
  }
};

// Ping engine on backend startup so it wakes up before first real request
export const warmUpEngine = async () => {
  try {
    const baseUrl = ENGINE_URL.replace("/engine", "");
    await axios.get(`${baseUrl}/health`, { timeout: 90000 });
    console.log("✅ Engine warm-up successful");
  } catch (err) {
    console.warn("⚠️ Engine warm-up failed (may still be starting):", err.message);
  }
};

