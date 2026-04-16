import api from "./api";

export const getVolunteers = () => api.get("/volunteers");

export const createVolunteer = (data) =>
  api.post("/volunteers", data);

export const updateVolunteer = (id, data) =>
  api.put(`/volunteers/${id}`, data);

export const deleteVolunteer = (id) =>
  api.delete(`/volunteers/${id}`);

export const assignVolunteer = (id, zoneId) =>
  api.patch(`/volunteers/${id}/assign`, { zoneId });

export const unassignVolunteer = (id) =>
  api.patch(`/volunteers/${id}/unassign`);

export const updateLocation = (id, data) =>
  api.patch(`/volunteers/${id}/location`, data);