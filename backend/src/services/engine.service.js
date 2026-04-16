import axios from "axios";

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8000/engine";

export const optimizeAllocation = async (data) => {
  try {
    const response = await axios.post(`${ENGINE_URL}/optimize`, data);
    return response.data;
  } catch (error) {
    console.error("Engine Error:", error.message);
    throw error;
  }
};

export const scoreZones = async (zonesData) => {
  try {
    const response = await axios.post(`${ENGINE_URL}/score/zones`, {
      zones: zonesData,
    });

    return response.data;
  } catch (error) {
    console.error("Engine Score Error:", error.message);
    throw new Error("Zone scoring failed");
  }
};