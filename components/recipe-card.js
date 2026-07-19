import { configureFavoriteButton } from "./favorites.js";

export function createRecipeCard(meal) {
  const card = document.createElement("article");
  card.className = "recipe-card";

  const favorite = document.createElement("button");
  favorite.className = "card-favorite";
  favorite.type = "button";
  favorite.textContent = "★";
  configureFavoriteButton(favorite, meal);

  const link = document.createElement("a");
  link.href = `recipe.html?id=${encodeURIComponent(meal.idMeal)}`;
  link.setAttribute("aria-label", `View ${meal.strMeal}`);

  const image = document.createElement("img");
  image.className = "recipe-image";
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;

  const title = document.createElement("h2");
  title.textContent = meal.strMeal;

  const metadata = [meal.strCategory, meal.strArea].filter(Boolean).join(" · ");
  link.append(image, title);
  if (metadata) {
    const details = document.createElement("p");
    details.textContent = metadata;
    link.append(details);
  }

  card.append(favorite, link);
  return card;
}
