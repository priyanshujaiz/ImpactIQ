from pydantic import BaseModel
from typing import List
from .zone import Zone
from .volunteer import Volunteer

class ZoneRequest(BaseModel):
    zones: List[Zone]

class VolunteerZoneRequest(BaseModel):
    volunteers: List[Volunteer]
    zones: List[Zone]

class OptimizeRequest(BaseModel):
    volunteers: List[Volunteer]
    zones: List[Zone]