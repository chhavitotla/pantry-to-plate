import unittest

from app.db.queries import _ingredient_matches_pantry, _pantry_terms


class QueryHelperTests(unittest.TestCase):
    def test_pantry_terms_split_into_normalized_tokens(self):
        self.assertEqual(
            _pantry_terms(["Full Cream Milk", "Basmati Rice (Soaked)"]),
            ["full", "cream", "milk", "basmati", "rice", "soaked"],
        )

    def test_ingredient_matching_handles_partial_real_world_names(self):
        pantry_terms = _pantry_terms(["rice", "milk"])

        self.assertTrue(_ingredient_matches_pantry("Full Cream Milk", pantry_terms))
        self.assertTrue(_ingredient_matches_pantry("Basmati Rice (Soaked)", pantry_terms))
        self.assertFalse(_ingredient_matches_pantry("Saffron Strands", pantry_terms))


if __name__ == "__main__":
    unittest.main()
