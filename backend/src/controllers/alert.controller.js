import * as service from "../services/alert.service.js";

// POLL
export const pollAlerts = async (req, res) => {
  try {
    const data = await service.runAlertCheck();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getAlerts = async (req, res) => {
  try {
    const data = await service.getAlerts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ACTIVE
export const getActive = async (req, res) => {
  try {
    const data = await service.getActiveAlerts();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESOLVE
export const resolveAlert = async (req, res) => {
  try {
    const data = await service.resolveAlert(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};