import * as service from "../services/volunteer.service.js";

// CREATE
export const createVolunteer = async (req, res) => {
  try {
    const data = await service.createVolunteer(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getVolunteers = async (req, res) => {
  try {
    const data = await service.getVolunteers(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
export const getVolunteer = async (req, res) => {
  try {
    const data = await service.getVolunteerById(req.params.id);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateVolunteer = async (req, res) => {
  try {
    const data = await service.updateVolunteer(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteVolunteer = async (req, res) => {
  try {
    const data = await service.deleteVolunteer(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOCATION
export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const data = await service.updateLocation(req.params.id, lat, lng);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AVAILABILITY
export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const data = await service.updateAvailability(
      req.params.id,
      availability
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ASSIGN
export const assignVolunteer = async (req, res) => {
  try {
    const { zoneId } = req.body;
    const data = await service.assignVolunteer(req.params.id, zoneId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// AVAILABLE
export const getAvailable = async (req, res) => {
  try {
    const data = await service.getAvailableVolunteers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UNASSIGN
export const unassignVolunteer = async (req, res) => {
  try {
    const data = await service.unassignVolunteer(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// HISTORY
export const getHistory = async (req, res) => {
  res.json({ message: "History coming soon" });
};