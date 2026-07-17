const mealsByFirstLetterUrl =
  "https://www.themealdb.com/api/json/v1/1/search.php?f=";
const apiUrl = "https://www.themealdb.com/api/json/v1/1/";

async function getMeals(endpoint) {
  const response = await fetch(`${apiUrl}${endpoint}`);
  if (!response.ok) throw new Error("Recipe request failed");
  return response.json();
}

export async function getAllRecipes() {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const results = await Promise.all(
    letters.map(async (letter) => {
      const response = await fetch(`${mealsByFirstLetterUrl}${letter}`);
      if (!response.ok) throw new Error("Recipe request failed");
      return response.json();
    }),
  );

  const recipesById = new Map();
  results
    .flatMap((result) => result.meals || [])
    .forEach((meal) => {
      recipesById.set(meal.idMeal, meal);
    });

  const recipes = [...recipesById.values()].sort((first, second) =>
    first.strMeal.localeCompare(second.strMeal),
  );
  if (!recipes.length) throw new Error("No recipes returned");

  return recipes;
}

export async function getAreas() {
  const result = await getMeals("list.php?a=list");
  return (result.meals || []).map((area) => area.strArea).filter(Boolean).sort();
}

export async function getCategories() {
  const result = await getMeals("list.php?c=list");
  return (result.meals || [])
    .map((category) => category.strCategory)
    .filter(Boolean)
    .sort();
}

export async function searchRecipesByName(query) {
  const result = await getMeals(`search.php?s=${encodeURIComponent(query)}`);
  return result.meals || [];
}

export async function getRecipeById(id) {
  const result = await getMeals(`lookup.php?i=${encodeURIComponent(id)}`);
  return result.meals?.[0] || null;
}

export async function getRecipesByCategory(category) {
  const result = await getMeals(
    `filter.php?c=${encodeURIComponent(category)}`,
  );
  return result.meals || [];
}
