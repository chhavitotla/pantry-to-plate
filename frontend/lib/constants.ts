export const dietaryOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non_vegetarian", label: "Non-Vegetarian" },
] as const;

export const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "brunch", label: "Brunch" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "dessert", label: "Dessert" },
  { value: "post_workout", label: "Post-workout" },
] as const;

export const maxTimeOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
] as const;

export const nutritionPreferenceOptions = [
  {
    title: "Nutrition profile",
    options: [
      { value: "balanced", label: "Balanced" },
      { value: "fibre_rich", label: "Fibre rich" },
      { value: "indulgent", label: "Indulgent" },
      { value: "light", label: "Light" },
      { value: "protein_rich", label: "Protein rich" },
    ],
  },
  {
    title: "Cooking style",
    options: [
      { value: "beginner_friendly", label: "Beginner friendly" },
      { value: "minimal_prep", label: "Minimal prep" },
      { value: "no_cook", label: "No cook" },
      { value: "one_pot", label: "One pot" },
    ],
  },
] as const;

export const allergyOptions = [
  { value: "dairy", label: "Dairy" },
  { value: "eggs", label: "Eggs" },
  { value: "fish", label: "Fish" },
  { value: "gluten", label: "Gluten" },
  { value: "mustard", label: "Mustard" },
  { value: "nuts", label: "Nuts" },
  { value: "sesame", label: "Sesame" },
  { value: "shellfish", label: "Shellfish" },
  { value: "soy", label: "Soy" },
] as const;

export const heroWords = [
  "dinner?",
  "breakfast?",
  "post-workout fuel?",
  "a late-night bite?",
  "something quick?",
] as const;
