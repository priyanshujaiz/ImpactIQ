import * as service from "../services/metrics.service.js";

// SUMMARY
export const getSummary = async (req, res) => {
  try {
    const data = await service.getSummary();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ZONES
export const getZones = async (req, res) => {
  try {
    const data = await service.getZoneMetrics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HISTORY
export const getHistory = async (req, res) => {
  try {
    const data = await service.getImpactHistory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};