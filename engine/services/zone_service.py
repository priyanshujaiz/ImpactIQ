import math

def calculate_need_score(zone):
    """
    Upgraded need score that accounts for:
    - Urgency (exponential weight)
    - People affected (log scale)
    - Severity (linear)
    - Coverage gap: people per current volunteer — uncovered burden
    - Trend delta: zones getting worse should score higher
    """
    urgency = max(zone.urgency or 0, 0)
    people = max(zone.people_affected or 0, 0)
    severity = max(zone.severity or 0, 0)

    # Coverage gap: how many people per deployed volunteer.
    # Zones with few/no volunteers but many people score higher.
    current_coverage = max(zone.current_volunteers or 0, 1)  # avoid /0
    coverage_gap = people / current_coverage  # uncovered burden per volunteer

    # Trend delta: positive = situation worsening, should raise score.
    # Negative = improving, don't penalise but don't reward.
    trend = max(zone.trend_delta or 0, 0)

    score = (
        0.30 * (urgency ** 1.5) +          # urgency: exponential penalise high urgency
        0.20 * math.log(people + 1) +       # raw scale of people affected
        0.20 * severity +                   # declared severity
        0.20 * math.log(coverage_gap + 1) + # coverage gap: undercovered zones rise
        0.10 * trend                        # worsening trend bonus
    )

    return round(score, 3)


def score_zones(zones):
    """Returns same schema: list of {id, need_score} — no change to callers."""
    result = []

    for zone in zones:
        score = calculate_need_score(zone)

        result.append({
            "id": zone.id,
            "need_score": score
        })

    return result