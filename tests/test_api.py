import unittest
from unittest.mock import ANY, patch

from fastapi.testclient import TestClient

from app.core.rate_limit import RateLimitError
from app.main import app


REQUEST_BODY = {
    "pantry_items": ["rice", "tomato", "onion", "garlic"],
    "dietary_type": "vegetarian",
    "meal_type": "lunch",
    "max_time_minutes": 45,
    "nutrition_preferences": ["high protein"],
    "allergies": [],
}

SAMPLE_RECIPE = {
    "_id": "mongo-id-1",
    "recipe_id": "REC_202",
    "recipe_name": "Desi Masala Macaroni",
    "allergens": ["gluten"],
    "dietary_type": ["vegetarian"],
    "ingredients": [
        {"item": "Macaroni Pasta", "quantity": "1 cup"},
        {"item": "Onion", "quantity": "1 medium"},
    ],
    "macros_per_serving": {
        "calories_kcal": 320,
        "protein_g": 9,
        "carbs_g": 60,
        "fibre_g": 3,
    },
    "meal_type": ["lunch"],
    "nutrition_profile": ["indulgent"],
    "serving": {
        "serving_size": "1 plate",
        "servings_count": 2,
        "scalable": True,
        "serving_scaling_tags": ["family_size"],
    },
    "steps": [
        "Boil macaroni with salt until soft, then drain.",
        "Toss the boiled macaroni in the masala and serve hot.",
    ],
    "time": {
        "prep_time_minutes": 10,
        "cook_time_minutes": 15,
        "total_time_minutes": 25,
    },
    "time_effort_tags": ["under_30_minutes", "one_pot"],
    "ingredients_norm": ["macaroni pasta", "onion"],
    "pantry_match": 0.33,
    "final_score": 0.31,
}

SECOND_RECIPE = {
    "_id": "mongo-id-2",
    "recipe_id": "REC_999",
    "recipe_name": "Savory Miso Oats",
    "allergens": [],
    "dietary_type": ["vegetarian"],
    "ingredients": [
        {"item": "Oats", "quantity": "1 cup"},
        {"item": "Onion", "quantity": "1 small"},
    ],
    "macros_per_serving": {
        "calories_kcal": 280,
        "protein_g": 12,
        "carbs_g": 41,
        "fibre_g": 6,
    },
    "meal_type": ["lunch"],
    "nutrition_profile": ["high_fiber"],
    "serving": {
        "serving_size": "1 bowl",
        "servings_count": 1,
        "scalable": True,
        "serving_scaling_tags": [],
    },
    "steps": ["Cook oats and fold in aromatics."],
    "time": {
        "prep_time_minutes": 5,
        "cook_time_minutes": 10,
        "total_time_minutes": 15,
    },
    "time_effort_tags": ["under_30_minutes"],
    "ingredients_norm": ["oats", "onion"],
    "pantry_match": 0.5,
    "final_score": 0.25,
}


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    @patch("app.routes.recommend.run_llm", return_value="Use the macaroni.")
    @patch("app.routes.recommend.retrieve_similar_recipe_ids", return_value=["REC_202"])
    @patch("app.routes.recommend.diversity_prune", side_effect=lambda recipes: recipes)
    @patch("app.routes.recommend.score_recipe", return_value=0.31)
    @patch("app.routes.recommend.find_filtered_recipes", return_value=[SAMPLE_RECIPE.copy()])
    @patch("app.routes.recommend.rate_limiter.check_tokens")
    @patch("app.routes.recommend.rate_limiter.check_request")
    def test_recommend_hides_internal_fields(
        self,
        mock_check_request,
        mock_check_tokens,
        mock_find_filtered_recipes,
        mock_score_recipe,
        mock_diversity_prune,
        mock_retrieve_similar_recipe_ids,
        mock_run_llm,
    ):
        response = self.client.post("/api/recommend", json=REQUEST_BODY)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "OK")
        self.assertEqual(body["assistant_response"], "Use the macaroni.")

        recipe = body["recipes"][0]
        self.assertEqual(recipe["recipe_id"], "REC_202")
        self.assertEqual(recipe["recipe_name"], "Desi Masala Macaroni")
        self.assertNotIn("_id", recipe)
        self.assertNotIn("ingredients_norm", recipe)
        self.assertNotIn("pantry_match", recipe)
        self.assertNotIn("final_score", recipe)

        mock_check_request.assert_called_once_with()
        mock_check_tokens.assert_called_once()
        mock_find_filtered_recipes.assert_called_once()
        mock_score_recipe.assert_called_once()
        mock_diversity_prune.assert_called_once()
        mock_retrieve_similar_recipe_ids.assert_called_once()
        mock_run_llm.assert_called_once()

    @patch("app.routes.recommend.run_llm", return_value="Use the oats.")
    @patch("app.routes.recommend.retrieve_similar_recipe_ids", return_value=["REC_999", "REC_202"])
    @patch("app.routes.recommend.diversity_prune", side_effect=lambda recipes: recipes)
    @patch("app.routes.recommend.score_recipe", side_effect=[0.31, 0.25])
    @patch(
        "app.routes.recommend.find_filtered_recipes",
        return_value=[SAMPLE_RECIPE.copy(), SECOND_RECIPE.copy()],
    )
    @patch("app.routes.recommend.rate_limiter.check_tokens")
    @patch("app.routes.recommend.rate_limiter.check_request")
    def test_recommend_uses_semantic_order_for_results_and_top_recipe(
        self,
        mock_check_request,
        mock_check_tokens,
        mock_find_filtered_recipes,
        mock_score_recipe,
        mock_diversity_prune,
        mock_retrieve_similar_recipe_ids,
        mock_run_llm,
    ):
        response = self.client.post("/api/recommend", json=REQUEST_BODY)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "OK")
        self.assertEqual(body["recipes"][0]["recipe_id"], "REC_999")
        self.assertEqual(body["recipes"][1]["recipe_id"], "REC_202")

        mock_check_request.assert_called_once_with()
        mock_check_tokens.assert_called_once()
        mock_find_filtered_recipes.assert_called_once()
        self.assertEqual(mock_score_recipe.call_count, 2)
        mock_diversity_prune.assert_called_once()
        mock_retrieve_similar_recipe_ids.assert_called_once()
        mock_run_llm.assert_called_once_with(ANY)
        top_recipe = mock_run_llm.call_args.args[0]
        self.assertEqual(top_recipe["recipe_id"], "REC_999")

    @patch("app.routes.recommend.run_llm", return_value="Fallback order used.")
    @patch("app.routes.recommend.retrieve_similar_recipe_ids", return_value=[])
    @patch("app.routes.recommend.diversity_prune", side_effect=lambda recipes: recipes)
    @patch("app.routes.recommend.score_recipe", side_effect=[0.31, 0.25])
    @patch(
        "app.routes.recommend.find_filtered_recipes",
        return_value=[SAMPLE_RECIPE.copy(), SECOND_RECIPE.copy()],
    )
    @patch("app.routes.recommend.rate_limiter.check_tokens")
    @patch("app.routes.recommend.rate_limiter.check_request")
    def test_recommend_falls_back_to_score_order_when_semantic_results_missing(
        self,
        mock_check_request,
        mock_check_tokens,
        mock_find_filtered_recipes,
        mock_score_recipe,
        mock_diversity_prune,
        mock_retrieve_similar_recipe_ids,
        mock_run_llm,
    ):
        response = self.client.post("/api/recommend", json=REQUEST_BODY)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["recipes"][0]["recipe_id"], "REC_202")
        self.assertEqual(body["recipes"][1]["recipe_id"], "REC_999")

        mock_check_request.assert_called_once_with()
        mock_check_tokens.assert_called_once()
        mock_find_filtered_recipes.assert_called_once()
        self.assertEqual(mock_score_recipe.call_count, 2)
        mock_diversity_prune.assert_called_once()
        mock_retrieve_similar_recipe_ids.assert_called_once()
        mock_run_llm.assert_called_once_with(ANY)
        top_recipe = mock_run_llm.call_args.args[0]
        self.assertEqual(top_recipe["recipe_id"], "REC_202")

    @patch(
        "app.routes.recommend.rate_limiter.check_request",
        side_effect=RateLimitError("Requests per minute exceeded"),
    )
    def test_recommend_returns_429_for_request_limit(self, _mock_check_request):
        response = self.client.post("/api/recommend", json=REQUEST_BODY)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json(), {"detail": "Requests per minute exceeded"})

    @patch("app.routes.recommend.run_llm", return_value="Use the macaroni.")
    @patch("app.routes.recommend.retrieve_similar_recipe_ids", return_value=["REC_202"])
    @patch("app.routes.recommend.diversity_prune", side_effect=lambda recipes: recipes)
    @patch("app.routes.recommend.score_recipe", return_value=0.31)
    @patch("app.routes.recommend.find_filtered_recipes", return_value=[SAMPLE_RECIPE.copy()])
    @patch(
        "app.routes.recommend.rate_limiter.check_tokens",
        side_effect=RateLimitError("Tokens per minute exceeded"),
    )
    @patch("app.routes.recommend.rate_limiter.check_request")
    def test_recommend_returns_429_for_token_limit(
        self,
        _mock_check_request,
        _mock_check_tokens,
        _mock_find_filtered_recipes,
        _mock_score_recipe,
        _mock_diversity_prune,
        _mock_retrieve_similar_recipe_ids,
        _mock_run_llm,
    ):
        response = self.client.post("/api/recommend", json=REQUEST_BODY)

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json(), {"detail": "Tokens per minute exceeded"})

    @patch("app.routes.recipe_chat.run_recipe_follow_up", return_value="Add lime and chili flakes.")
    @patch(
        "app.routes.recipe_chat.find_recipes_by_ids",
        return_value=[SAMPLE_RECIPE.copy()],
    )
    @patch(
        "app.routes.recipe_chat.retrieve_related_recipe_ids",
        return_value=["REC_202"],
    )
    @patch("app.routes.recipe_chat.find_recipe_by_id", return_value=SAMPLE_RECIPE.copy())
    @patch("app.routes.recipe_chat.rate_limiter.check_tokens")
    @patch("app.routes.recipe_chat.rate_limiter.check_request")
    def test_recipe_chat_returns_follow_up_answer(
        self,
        mock_check_request,
        mock_check_tokens,
        mock_find_recipe_by_id,
        mock_retrieve_related_recipe_ids,
        mock_find_recipes_by_ids,
        mock_run_recipe_follow_up,
    ):
        response = self.client.post(
            "/api/recipe-chat",
            json={"recipe_id": "REC_202", "question": "Make it tangy"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"answer": "Add lime and chili flakes.", "status": "OK", "message": None},
        )

        mock_check_request.assert_called_once_with()
        mock_check_tokens.assert_called_once()
        mock_find_recipe_by_id.assert_called_once_with("REC_202")
        mock_retrieve_related_recipe_ids.assert_called_once()
        mock_find_recipes_by_ids.assert_called_once_with(["REC_202"])
        mock_run_recipe_follow_up.assert_called_once()

    @patch("app.routes.recipe_chat.find_recipe_by_id", return_value=None)
    @patch("app.routes.recipe_chat.rate_limiter.check_request")
    def test_recipe_chat_returns_not_found_when_recipe_missing(
        self,
        mock_check_request,
        _mock_find_recipe_by_id,
    ):
        response = self.client.post(
            "/api/recipe-chat",
            json={"recipe_id": "REC_MISSING", "question": "Make it spicy"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"answer": "", "status": "NOT_FOUND", "message": "Recipe not found"},
        )
        mock_check_request.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
