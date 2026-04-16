from fastapi import APIRouter
from models.request_models import OptimizeRequest
from services.optimizer_service import optimize_allocation

router = APIRouter()

@router.post("/optimize")
def optimize(data: OptimizeRequest):
    
    result = optimize_allocation(data.zones, data.volunteers)
    return result