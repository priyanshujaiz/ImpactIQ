import * as service from "../services/allocation.service.js";

// RUN
export const runAllocation = async (req, res) => {
  try {
    const result = await service.runAllocation();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CURRENT
export const getCurrent = async (req, res) => {
  try {
    const data = await service.getCurrentAllocation();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HISTORY
export const getHistory = async (req, res) => {
  try {
    const data = await service.getAllocationHistory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
export const getAllocation = async (req, res) => {
  try {
    const data = await service.getAllocationById(req.params.id);

    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// APPLY
export const applyAllocation = async (req, res) => {
  try {
    const result = await service.applyAllocation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};