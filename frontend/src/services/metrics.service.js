import api from "./api";

export const getSummary = () => api.get("/metrics/summary");
export const getHistory = () => api.get("/metrics/history");
export const getZoneMetrics = () => api.get("/metrics/zones");

export const getActiveAlerts = () => api.get("/alerts/active");
export const getCurrentAllocation = () =>
  api.get("/allocations/current");