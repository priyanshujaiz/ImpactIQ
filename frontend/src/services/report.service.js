import api from "./api";

export const ingestReport = (rawText) =>
  api.post("/reports/ingest", { rawText });

export const getReports = () =>
  api.get("/reports");

export const deleteReport = (id) =>
  api.delete(`/reports/${id}`);