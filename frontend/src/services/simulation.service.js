import api from "./api";

// Run a new what-if simulation
export const runSimulation = (baselineAllocationId, proposedChanges) =>
    api.post("/simulations", { baselineAllocationId, proposedChanges });

// Get all simulations for current user
export const getSimulations = () =>
    api.get("/simulations");

// Delete a simulation
export const deleteSimulation = (id) =>
    api.delete(`/simulations/${id}`);

// Get allocation history for baseline picker
export const getAllocationHistory = () =>
    api.get("/allocations/history");
