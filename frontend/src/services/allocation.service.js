import api from "./api";

export const getCurrentAllocation = () =>
  api.get("/allocations/current");

export const runAllocation = () =>
  api.post("/allocations/run");

export const applyAllocation = (id) =>
  api.patch(`/allocations/${id}/apply`);