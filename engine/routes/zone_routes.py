from fastapi import APIRouter
from models.request_models import ZoneRequest
from services.zone_service import score_zones

router = APIRouter()

@router.post("/score/zones")
def score_zone_data(data: ZoneRequest):
    scored = score_zones(data.zones)
    return {"zones": scored}