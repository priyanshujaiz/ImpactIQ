from services.optimizer_service import optimize_allocation
from services.zone_service import calculate_need_score
from services.volunteer_service import calculate_suitability


def simulate_allocation(zones, volunteers, changes):
    """
    Simulate the effect of proposed volunteer moves against a baseline allocation.

    changes = [{ "volunteerId": "...", "toZone": "..." }]

    Returns:
    {
        "baseline":   float,   -- total impact of the auto-optimised baseline
        "new":        float,   -- total impact of the proposed plan
        "delta":      float,   -- new - baseline
        "finalPlan":  list     -- full assignment list with real impactScore + suitability
    }
    """

    # ── 1. Baseline (fully auto-optimised) ────────────────────────────────────
    baseline = optimize_allocation(zones, volunteers)
    if not baseline.get("success"):
        return baseline   # propagate error

    # ── 2. Pre-compute need scores (used for fixed assignment scoring) ─────────
    zone_map = {z.id: z for z in zones}
    zone_scores = {}
    for z in zones:
        try:
            zone_scores[z.id] = calculate_need_score(z)
        except Exception:
            zone_scores[z.id] = 0.0

    # ── 3. Split volunteers into fixed (user-forced) and free ─────────────────
    fixed_assignments = {
        c["volunteerId"]: c["toZone"]
        for c in changes
    }

    fixed_plan = []
    remaining_volunteers = []
    fixed_total_impact = 0.0

    for v in volunteers:
        if v.id in fixed_assignments:
            target_zone_id = fixed_assignments[v.id]
            target_zone = zone_map.get(target_zone_id)

            if target_zone:
                # ✅ FIX: compute real impact and suitability for forced assignments
                # (previously these were hardcoded to 0, making all proposals look worse)
                try:
                    suitability = calculate_suitability(v, target_zone)
                except Exception:
                    suitability = 0.0

                need = zone_scores.get(target_zone_id, 0.0)
                impact = round(need * suitability, 3)
            else:
                suitability = 0.0
                impact = 0.0

            fixed_plan.append({
                "volunteerId": v.id,
                "zoneId": target_zone_id,
                "impactScore": impact,
                "suitability": round(suitability, 3)
            })
            fixed_total_impact += impact

        else:
            remaining_volunteers.append(v)

    # ── 4. Optimise the remaining free volunteers ──────────────────────────────
    new_partial = optimize_allocation(zones, remaining_volunteers)
    partial_impact = new_partial.get("total_impact", 0.0)

    # ── 5. Merge plans ────────────────────────────────────────────────────────
    final_plan = fixed_plan + new_partial.get("allocation", [])

    # ── 6. Total new impact accounts for BOTH fixed + re-optimised volunteers ─
    new_impact = round(fixed_total_impact + partial_impact, 3)

    return {
        "baseline": baseline["total_impact"],
        "new": new_impact,
        "delta": round(new_impact - baseline["total_impact"], 3),
        "finalPlan": final_plan
    }
