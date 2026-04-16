import numpy as np
from services.zone_service import calculate_need_score
from services.volunteer_service import calculate_suitability
from utils.debug_helper import build_error, safe_dict

# ============================================================
# OPTIMIZER — Hungarian Algorithm (globally optimal matching)
# ============================================================
# Uses scipy.optimize.linear_sum_assignment which solves the
# linear assignment problem in O(n³).  This guarantees the
# globally optimal volunteer→zone assignment rather than the
# old greedy approach which was order-dependent.
#
# Output schema is IDENTICAL to the previous version:
#   { "success": True,
#     "allocation": [{"volunteerId", "zoneId", "impactScore", "suitability"}],
#     "total_impact": float }
# ============================================================


def _build_impact_matrix(zones, volunteers, zone_scores):
    """
    Build an (n_volunteers × n_zones) impact matrix.
    Entry [i][j] = need_score[j] * suitability(volunteer_i, zone_j).

    We deliberately do NOT apply the old crowding factor here —
    the Hungarian algorithm handles fairness globally by finding
    the best 1-to-1 (or many-to-one via zone slots) assignment.
    """
    n_v = len(volunteers)
    n_z = len(zones)
    matrix = np.zeros((n_v, n_z), dtype=float)

    for i, v in enumerate(volunteers):
        for j, z in enumerate(zones):
            try:
                suitability = calculate_suitability(v, z)
            except Exception:
                suitability = 0.0
            matrix[i][j] = zone_scores.get(z.id, 0.0) * suitability

    return matrix


def _greedy_fallback(zones, volunteers, zone_scores):
    """
    Original greedy algorithm kept as fallback in case scipy is unavailable.
    Same output schema as the main function.
    """
    ALPHA = 0.5
    zone_assignment_count = {z.id: 0 for z in zones}
    allocation = []
    total_impact = 0.0

    for v in volunteers:
        best_zone_id = None
        best_effective_impact = -1
        best_suitability = 0.0

        for z in zones:
            try:
                suitability = calculate_suitability(v, z)
            except Exception:
                suitability = 0.0

            base_impact = zone_scores.get(z.id, 0.0) * suitability
            assigned_count = zone_assignment_count[z.id]
            effective_impact = base_impact / (1 + ALPHA * assigned_count)

            if effective_impact > best_effective_impact:
                best_effective_impact = effective_impact
                best_zone_id = z.id
                best_suitability = suitability

        if best_zone_id:
            zone_assignment_count[best_zone_id] += 1
            allocation.append({
                "volunteerId": v.id,
                "zoneId": best_zone_id,
                "impactScore": round(best_effective_impact, 3),
                "suitability": round(best_suitability, 3)
            })
            total_impact += best_effective_impact

    return {"success": True, "allocation": allocation, "total_impact": round(total_impact, 3)}


def optimize_allocation(zones, volunteers):
    """
    Main allocation function.
    Signature: (zones: List[Zone], volunteers: List[Volunteer])
    Returns:   {"success": True, "allocation": [...], "total_impact": float}

    Strategy:
    ---------
    When volunteers ≤ zones (or equal): pure 1-to-1 Hungarian assignment.
    When volunteers > zones: we create 'slots' (duplicate zone columns) so
      each zone can absorb multiple volunteers, then apply Hungarian on the
      expanded matrix.  This avoids the old greedy crowding problem while
      still guaranteeing global optimality.
    """
    stage = "init"

    try:
        if not zones or not volunteers:
            return {"success": True, "allocation": [], "total_impact": 0.0}

        # ── STEP 1: Need scores ─────────────────────────────────────────────
        stage = "compute_need_scores"
        zone_scores = {}
        for z in zones:
            try:
                zone_scores[z.id] = calculate_need_score(z)
            except Exception as e:
                return build_error("need_score_failed", e, zone=safe_dict(z))

        # ── STEP 2: Try Hungarian, fallback to greedy ───────────────────────
        stage = "build_assignment"
        try:
            from scipy.optimize import linear_sum_assignment

            n_v = len(volunteers)
            n_z = len(zones)

            # How many volunteers can each zone absorb?
            # Simple heuristic: at minimum 1 slot; at maximum ceil(n_v / n_z) + 1
            # This prevents a single high-need zone from monopolising all volunteers.
            max_per_zone = max(1, -(-n_v // n_z) + 1)  # ceiling division + 1 buffer

            # Expand zones into slots: zone_A × max_per_zone columns
            slot_zone_ids = []      # which zone does each column belong to?
            slot_zone_objs = []
            for z in zones:
                for _ in range(max_per_zone):
                    slot_zone_ids.append(z.id)
                    slot_zone_objs.append(z)

            n_slots = len(slot_zone_ids)

            # Build the (n_v × n_slots) impact matrix — negate for minimisation
            stage = "build_impact_matrix"
            impact_matrix = np.zeros((n_v, n_slots), dtype=float)
            suitability_cache = {}

            for i, v in enumerate(volunteers):
                for j, z in enumerate(slot_zone_objs):
                    key = (v.id, z.id)
                    if key not in suitability_cache:
                        try:
                            suitability_cache[key] = calculate_suitability(v, z)
                        except Exception:
                            suitability_cache[key] = 0.0
                    impact_matrix[i][j] = zone_scores.get(z.id, 0.0) * suitability_cache[key]

            # Solve: minimise negative impact = maximise impact
            stage = "hungarian_solve"
            row_ind, col_ind = linear_sum_assignment(-impact_matrix)

            # ── STEP 3: Build allocation result ─────────────────────────────
            stage = "build_result"
            allocation = []
            total_impact = 0.0

            for i, j in zip(row_ind, col_ind):
                v = volunteers[i]
                zone_id = slot_zone_ids[j]
                zone_obj = slot_zone_objs[j]
                impact = impact_matrix[i][j]
                suitability = suitability_cache.get((v.id, zone_obj.id), 0.0)

                allocation.append({
                    "volunteerId": v.id,
                    "zoneId": zone_id,
                    "impactScore": round(float(impact), 3),
                    "suitability": round(float(suitability), 3)
                })
                total_impact += impact

            return {
                "success": True,
                "allocation": allocation,
                "total_impact": round(float(total_impact), 3)
            }

        except ImportError:
            # scipy not available — use greedy fallback transparently
            print("⚠️ scipy not found — falling back to greedy optimizer")
            return _greedy_fallback(zones, volunteers, zone_scores)

    except Exception as e:
        return build_error(stage, e)
