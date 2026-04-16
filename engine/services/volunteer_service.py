import math

# ---------------------------------------------------------------------------
# Distance helpers
# ---------------------------------------------------------------------------

def haversine_km(lat1, lng1, lat2, lng2):
    """
    Real-world great-circle distance in kilometres using the Haversine formula.
    Replaces the old naive Euclidean degree difference which was geographically
    meaningless (1° latitude ≠ 1° longitude in physical distance).
    """
    R = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def skill_match_score(v, z):
    """Fraction of zone needs that the volunteer can cover (0–1)."""
    if not z.need_type:
        return 0.0
    if not v.skills:
        return 0.0
    matches = len(set(v.skills).intersection(set(z.need_type)))
    return matches / len(z.need_type)


def availability_score(v):
    """1 if available, 0.3 if busy (partial credit — nearly-done tasks matter), 0 otherwise."""
    if v.availability == "available":
        return 1.0
    if v.availability == "busy":
        return 0.3   # partial: might free up soon
    return 0.0


def relocation_cost(v, z):
    """
    Penalty for moving a volunteer who is already deployed somewhere else.
    If the volunteer is already at this zone → no cost.
    If moving them → cost proportional to real-world distance to current zone.
    Returns a multiplier in [0.7, 1.0]: 1 = no cost, lower = higher cost.
    """
    if not v.current_zone_id:
        return 1.0  # not deployed — free to move
    if v.current_zone_id == z.id:
        return 1.0  # already here — no move needed

    # Deployed elsewhere — apply small distance-based relocation penalty.
    # We don't have the current zone's coords here, so we use a fixed soft penalty.
    # This discourages churning deployed volunteers unnecessarily.
    return 0.80  # 20% suitability reduction for being pulled away from active zone


# ---------------------------------------------------------------------------
# Main suitability function — same signature, richer logic
# ---------------------------------------------------------------------------

def calculate_suitability(v, z):
    """
    Suitability of volunteer v for zone z. Returns a float in approx [0, 1].

    Weights:
      40%  skill match   — does the volunteer cover what the zone needs?
      25%  proximity     — real-world km via Haversine, not degrees
      15%  availability  — available > busy > other
      10%  reliability   — historical reliability score
      10%  relocation    — penalise displacing already-deployed volunteers
    """
    skill        = skill_match_score(v, z)
    dist_km      = haversine_km(v.lat, v.lng, z.lat, z.lng)
    dist_score   = 1 / (1 + 0.1 * dist_km)   # 0.1 → ~50% score at 10 km away
    avail        = availability_score(v)
    reliability  = min(max(v.reliability_score, 0.0), 1.0)  # clamp to [0,1]
    reloc        = relocation_cost(v, z)

    score = (
        0.40 * skill +
        0.25 * dist_score +
        0.15 * avail +
        0.10 * reliability +
        0.10 * reloc
    )

    return round(score, 3)


def build_suitability_matrix(volunteers, zones):
    """Returns {volunteer_id: {zone_id: suitability_score}} — schema unchanged."""
    matrix = {}
    for v in volunteers:
        matrix[v.id] = {}
        for z in zones:
            matrix[v.id][z.id] = calculate_suitability(v, z)
    return matrix