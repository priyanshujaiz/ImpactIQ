import * as zoneService from "../services/zone.services.js";

// CREATE
export const createZone = async (req, res) => {
  try {
    const zone = await zoneService.createZone(req.body);
    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getZones = async (req, res) => {
  try {
    const data = await zoneService.getZones();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE (BY ID)
export const getZone = async (req, res) => {
  try {
    const zone = await zoneService.getZoneById(req.params.id);

    if (!zone) return res.status(404).json({ error: "Zone not found" });

    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateZone = async (req, res) => {
  try {
    const updated = await zoneService.updateZone(
      req.params.id,
      req.body
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE (SOFT)
export const deleteZone = async (req, res) => {
  try {
    const deleted = await zoneService.deleteZone(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// VOLUNTEERS
export const getZoneVolunteers = async (req, res) => {
  try {
    const data = await zoneService.getZoneVolunteers(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HISTORY
export const getZoneHistory = async (req, res) => {
  try {
    const data = await zoneService.getZoneHistory(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 RECOMPUTE
export const recomputeScores = async (req, res) => {
  try {
    const result = await zoneService.recomputeZoneScores();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};