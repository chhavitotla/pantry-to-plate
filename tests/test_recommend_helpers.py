import unittest

from app.models.request import RecommendRequest
from app.routes.recommend import _build_semantic_query, _effective_preference_tags


class RecommendHelperTests(unittest.TestCase):
    def test_effective_preference_tags_strip_duplicate_time_tags(self):
        self.assertEqual(
            _effective_preference_tags(
                ["balanced", "under_30_minutes", "one_pot", "under_45_minutes"]
            ),
            ["balanced", "one_pot"],
        )

    def test_build_semantic_query_uses_time_once_and_keeps_non_time_tags(self):
        body = RecommendRequest(
            pantry_items=["rice", "milk"],
            dietary_type="vegetarian",
            meal_type="dessert",
            max_time_minutes=60,
            nutrition_preferences=["balanced", "under_45_minutes", "one_pot"],
            allergies=[],
        )

        query = _build_semantic_query(body)

        self.assertIn("ingredients: rice, milk", query)
        self.assertIn("meal type: dessert", query)
        self.assertIn("dietary type: vegetarian", query)
        self.assertIn("preference tags: balanced, one_pot", query)
        self.assertIn("time: under 60 minutes", query)
        self.assertNotIn("under_45_minutes", query)


if __name__ == "__main__":
    unittest.main()
