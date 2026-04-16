from pydantic import BaseModel, Field
from typing import List, Optional

class Zone(BaseModel):
    id: str

    zone_id: str = Field(alias="zoneId")
    name: Optional[str] = None

    lat: float
    lng: float

    urgency: int
    people_affected: int = Field(alias="peopleAffected")
    severity: int

    need_type: List[str] = Field(default_factory=list, alias="needType")

    need_score: Optional[float] = Field(default=0, alias="needScore")
    current_volunteers: Optional[int] = Field(default=0, alias="currentVolunteers")

    # present in DB → include
    trend_delta: Optional[float] = Field(default=0, alias="trendDelta")
    status: Optional[str] = None

    class Config:
        populate_by_name = True