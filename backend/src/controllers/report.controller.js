import * as service from "../services/report.service.js";

// INGEST
export const ingestReport = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "rawText is required" });
    }

    const result = await service.ingestReport(rawText, req.user.id);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getReports = async (req, res) => {
  try {
    const data = await service.getReports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
export const getReport = async (req, res) => {
  try {
    const data = await service.getReportById(req.params.id);

    if (!data) return res.status(404).json({ error: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteReport = async (req, res) => {
  try {
    const data = await service.deleteReport(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};