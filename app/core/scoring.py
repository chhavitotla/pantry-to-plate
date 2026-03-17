from typing import List, Dict, Any


def time_fit_score(total_time: int, max_time: int) -> float:
    if max_time <= 0:
        return 0.0
    diff = abs(max_time - total_time)
    score = 1.0 - (diff / max_time)
    return max(0.0, min(1.0, score))


def nutrition_tag_match(
    nutrition_profile: List[str],
    time_effort_tags: List[str],
    prefs: List[str],
) -> float:
    if not prefs:
        return 1.0
    np_set = {s.lower() for s in nutrition_profile}
    te_set = {s.lower() for s in time_effort_tags}
    pref_set = {s.lower() for s in prefs}
    matches = len(pref_set.intersection(np_set.union(te_set)))
    return matches / max(1, len(pref_set))


def score_recipe(recipe: Dict[str, Any], max_time: int, prefs: List[str]) -> float:
    pantry_match = float(recipe.get("pantry_match", 0.0))
    total_time = int(recipe.get("time", {}).get("total_time_minutes", 0))
    tf = time_fit_score(total_time, max_time)
    nm = nutrition_tag_match(
        recipe.get("nutrition_profile", []),
        recipe.get("time_effort_tags", []),
        prefs,
    )
    return (pantry_match * 0.6) + (tf * 0.2) + (nm * 0.2)
