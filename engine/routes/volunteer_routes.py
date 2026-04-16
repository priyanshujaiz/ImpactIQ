from fastapi import APIRouter
from models.request_models import VolunteerZoneRequest
from services.volunteer_service import build_suitability_matrix

router = APIRouter()

@router.post("/score/volunteers")
def score_volunteers(data: VolunteerZoneRequest):
    matrix = build_suitability_matrix(data.volunteers, data.zones)
    return {"matrix": matrix}
