import { getRecipeById, getRecipesByCategory } from "./mealdb.js";
import { configureFavoriteButton } from "./favorites.js";
import { createRecipeCard } from "./recipe-card.js";

function getIngredients(meal) {
  return Array.from({ length: 20 }, (_, index) => index + 1)
    .map((number) => ({
      name: meal[`strIngredient${number}`]?.trim(),
      measure: meal[`strMeasure${number}`]?.trim(),
    }))
    .filter(({ name }) => name);
}

function setState(container, message, state) {
  container.dataset.state = state;
  container.setAttribute("aria-busy", "false");
  container.replaceChildren();
  const text = document.createElement("p");
  text.className = "details-status";
  text.textContent = message;
  container.append(text);
}

function buildDetails(meal) {
  const article = document.createElement("article");
  article.className = "recipe-details";

  const titleRow = document.createElement("div");
  titleRow.className = "details-title";
  const title = document.createElement("h1");
  title.textContent = meal.strMeal;
  const favorite = document.createElement("button");
  favorite.className = "card-favorite info-title";
  favorite.type = "button";
  favorite.textContent = "★";
  configureFavoriteButton(favorite, meal);
  titleRow.append(title, favorite);

  const grid = document.createElement("div");
  grid.className = "details-grid";
  const image = document.createElement("img");
  image.className = "recipe-image detail-image";
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;

  const copy = document.createElement("div");
  copy.className = "recipe-copy";
  const metadata = document.createElement("p");
  const regionLabel = document.createElement("strong");
  regionLabel.textContent = "Region:";
  const categoryLabel = document.createElement("strong");
  categoryLabel.className = "category-label";
  categoryLabel.textContent = "Category:";
  metadata.append(
    regionLabel,
    ` ${meal.strArea || "Not listed"}  `,
    categoryLabel,
    ` ${meal.strCategory || "Not listed"}`,
  );
  const instructionsTitle = document.createElement("h2");
  instructionsTitle.textContent = "Instructions";
  const instructions = document.createElement("p");
  instructions.className = "instructions";
  instructions.textContent =
    meal.strInstructions || "Instructions are not available for this recipe.";
  copy.append(metadata);
  if (meal.strYoutube) {
    const video = document.createElement("a");
    video.className = "youtube-button";
    video.href = meal.strYoutube;
    video.target = "_blank";
    video.rel = "noopener noreferrer";
    video.textContent = "Watch on YouTube →";
    copy.append(video);
  }
  copy.append(instructionsTitle, instructions);

  const ingredients = document.createElement("section");
  ingredients.className = "ingredients";
  ingredients.setAttribute("aria-labelledby", "ingredients-title");
  const ingredientsTitle = document.createElement("h2");
  ingredientsTitle.id = "ingredients-title";
  ingredientsTitle.textContent = "Ingredients";
  const list = document.createElement("ul");
  getIngredients(meal).forEach(({ name, measure }) => {
    const item = document.createElement("li");
    const ingredient = document.createElement("span");
    ingredient.textContent = name;
    const quantity = document.createElement("span");
    quantity.textContent = measure || "As needed";
    item.append(ingredient, quantity);
    list.append(item);
  });
  ingredients.append(ingredientsTitle, list);
  grid.append(image, copy, ingredients);
  article.append(titleRow, grid);
  return article;
}

async function loadRelatedRecipes(meal, related) {
  if (!meal.strCategory) {
    related.hidden = true;
    return;
  }

  try {
    const recipes = await getRecipesByCategory(meal.strCategory);
    const cards = recipes
      .filter((recipe) => recipe.idMeal !== meal.idMeal)
      .slice(0, 6)
      .map(createRecipeCard);
    related.querySelector("[data-related-grid]").replaceChildren(...cards);
    related.hidden = !cards.length;
  } catch (error) {
    related.hidden = true;
  }
}

export function initRecipeDetails() {
  const details = document.querySelector("[data-recipe-details]");
  const related = document.querySelector("[data-related-recipes]");
  if (!details || !related) return;

  const mealId = new URLSearchParams(window.location.search).get("id")?.trim();
  if (!mealId) {
    setState(
      details,
      "Choose a recipe from the recipe finder to view its details.",
      "missing",
    );
    related.hidden = true;
    return;
  }

  setState(details, "Loading recipe…", "loading");
  related.hidden = true;
  getRecipeById(mealId)
    .then((meal) => {
      if (!meal) {
        setState(details, "That recipe could not be found.", "missing");
        return;
      }
      details.dataset.state = "ready";
      details.setAttribute("aria-busy", "false");
      details.replaceChildren(buildDetails(meal));
      document.title = `${meal.strMeal} | CrumBloom`;
      loadRelatedRecipes(meal, related);
    })
    .catch(() => {
      setState(
        details,
        "Recipe details could not be loaded. Please try again later.",
        "error",
      );
    });
}
