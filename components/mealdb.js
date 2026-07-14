//checked
const mealsByFirstLetterUrl =
  "https://www.themealdb.com/api/json/v1/1/search.php?f=";

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
