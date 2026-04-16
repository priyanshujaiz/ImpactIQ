from pydantic import BaseModel, Field

class Allocation(BaseModel):
    volunteer_id: str = Field(alias="volunteerId")
    zone_id: str = Field(alias="zoneId")
    impact_score: float = Field(alias="impactScore")
    suitability: float

    class Config:
        populate_by_name = True