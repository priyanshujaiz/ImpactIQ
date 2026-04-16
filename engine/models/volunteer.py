from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Volunteer(BaseModel):
    id: str
    name: Optional[str] = None

    skills: List[str] = []

    lat: float
    lng: float

    availability: str

    reliability_score: float = Field(alias="reliabilityScore")

    current_zone_id: Optional[str] = Field(default=None, alias="currentZoneId")

    status: Optional[Literal["active", "inactive", "deleted"]] = "active"

    class Config:
        populate_by_name = True