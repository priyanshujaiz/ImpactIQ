import api from "./api";

export const getZones = () => api.get("/zones");

export const createZone = (data) => api.post("/zones", data);

export const updateZone = (id, data) =>
  api.put(`/zones/${id}`, data);

export const deleteZone = (id) =>
  api.delete(`/zones/${id}`);

export const getZoneVolunteers = (id) =>
  api.get(`/zones/${id}/volunteers`);