import * as service from "../services/simulation.service.js";

// RUN
export const runSimulation = async (req, res) => {
  try {
    const result = await service.runSimulation(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getSimulations = async (req, res) => {
  try {
    const data = await service.getSimulations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
export const getSimulation = async (req, res) => {
  try {
    const data = await service.getSimulationById(req.params.id);

    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteSimulation = async (req, res) => {
  try {
    const data = await service.deleteSimulation(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};