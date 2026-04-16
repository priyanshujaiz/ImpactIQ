from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from models.zone import Zone
from models.volunteer import Volunteer
from services.simulation_service import simulate_allocation

router = APIRouter()

class SimulationRequest(BaseModel):
    zones: List[Zone]
    volunteers: List[Volunteer]
    changes: list 

@router.post("/simulate")
def simulate(data: SimulationRequest):
    result = simulate_allocation(
        data.zones,
        data.volunteers,
        data.changes
    )
    return result