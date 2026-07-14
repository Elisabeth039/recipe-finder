import { getAllRecipes } from "./mealdb.js";
import { createRecipeCard } from "./recipe-card.js";

const recipesPerPage = 28;
const recipeOrderStorageKey = "crumbloom-recipe-order";

function sortAlphabetically(recipeList) {
  return [...recipeList].sort((first, second) =>
    first.strMeal.localeCompare(second.strMeal),
  );
}

function getSavedRecipeOrder() {
  try {
    const savedOrder = JSON.parse(
      sessionStorage.getItem(recipeOrderStorageKey),
    );
    return Array.isArray(savedOrder) ? savedOrder : [];
  } catch (error) {
    return [];
  }
}

function restoreRecipeOrder(recipeList) {
  const savedOrder = getSavedRecipeOrder();
  if (!savedOrder.length) return recipeList;

  const savedPositions = new Map(
    savedOrder.map((recipeId, index) => [recipeId, index]),
  );

  return [...recipeList].sort((first, second) => {
    const firstPosition = savedPositions.get(first.idMeal);
    const secondPosition = savedPositions.get(second.idMeal);

    if (firstPosition !== undefined && secondPosition !== undefined) {
      return firstPosition - secondPosition;
    }
    if (firstPosition !== undefined) return -1;
    if (secondPosition !== undefined) return 1;
    return first.strMeal.localeCompare(second.strMeal);
  });
}

function saveRecipeOrder(recipeList) {
  try {
    sessionStorage.setItem(
      recipeOrderStorageKey,
      JSON.stringify(recipeList.map((recipe) => recipe.idMeal)),
    );
  } catch (error) {}
}

function clearSavedRecipeOrder() {
  try {
    sessionStorage.removeItem(recipeOrderStorageKey);
  } catch (error) {}
}

export function initHomeRecipes() {
  const recipeGrid = document.querySelector("[data-home-recipes]");
  const pagination = document.querySelector(".pagination");
  const message = document.querySelector(".status-message");
  const areaFilter = document.querySelector("#area-filter");
  const categoryFilter = document.querySelector("#category-filter");
  const shuffleButton = document.querySelector(".shuffle-button");
  const alphabetizeButton = document.querySelector(".alphabetize-button");
  let allRecipes = [];
  let recipes = [];
  let currentPage = 1;

  if (!recipeGrid || !pagination || !message) return;

  function renderPagination() {
    const pageCount = Math.ceil(recipes.length / recipesPerPage);
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";
    previous.disabled = currentPage === 1;
    previous.addEventListener("click", () => renderPage(currentPage - 1));
    pagination.append(previous);

    for (let page = 1; page <= pageCount; page += 1) {
      const pageButton = document.createElement("button");
      pageButton.type = "button";
      pageButton.textContent = page;
      pageButton.setAttribute("aria-label", `Page ${page}`);
      if (page === currentPage) {
        pageButton.className = "is-current";
        pageButton.setAttribute("aria-current", "page");
      }
      pageButton.addEventListener("click", () => renderPage(page));
      pagination.append(pageButton);
    }

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    next.disabled = currentPage === pageCount;
    next.addEventListener("click", () => renderPage(currentPage + 1));
    pagination.append(next);
  }

  function renderPage(page) {
    const pageCount = Math.ceil(recipes.length / recipesPerPage);
    currentPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
    const start = (currentPage - 1) * recipesPerPage;
    const pageRecipes = recipes.slice(start, start + recipesPerPage);

    recipeGrid.replaceChildren(...pageRecipes.map(createRecipeCard));
    message.textContent = recipes.length
      ? `Showing ${start + 1}–${start + pageRecipes.length} of ${recipes.length} recipes`
      : "No recipes match these filters.";
    renderPagination();
  }

  function addFilterOptions(filter, values) {
    if (!filter) return;

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      filter.append(option);
    });
  }

  function applyFilters() {
    const selectedArea = areaFilter?.value || "";
    const selectedCategory = categoryFilter?.value || "";
    recipes = allRecipes.filter(
      (recipe) =>
        (!selectedArea || recipe.strArea === selectedArea) &&
        (!selectedCategory || recipe.strCategory === selectedCategory),
    );
    renderPage(1);
  }

  function shuffleRecipes() {
    if (allRecipes.length < 2) return;

    const previousOrder = [...allRecipes];

    for (let index = allRecipes.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [allRecipes[index], allRecipes[randomIndex]] = [
        allRecipes[randomIndex],
        allRecipes[index],
      ];
    }

    if (allRecipes.every((recipe, index) => recipe === previousOrder[index])) {
      allRecipes.push(allRecipes.shift());
    }

    saveRecipeOrder(allRecipes);
    applyFilters();
  }

  function alphabetizeRecipes() {
    if (!allRecipes.length) return;

    allRecipes = sortAlphabetically(allRecipes);
    clearSavedRecipeOrder();
    applyFilters();
  }

  async function loadRecipes() {
    message.textContent = "Loading recipes…";
    recipeGrid.setAttribute("aria-busy", "true");

    try {
      allRecipes = restoreRecipeOrder(await getAllRecipes());
      addFilterOptions(
        areaFilter,
        [
          ...new Set(
            allRecipes.map((recipe) => recipe.strArea).filter(Boolean),
          ),
        ].sort(),
      );
      addFilterOptions(
        categoryFilter,
        [
          ...new Set(
            allRecipes.map((recipe) => recipe.strCategory).filter(Boolean),
          ),
        ].sort(),
      );
      applyFilters();
    } catch (error) {
      recipeGrid.replaceChildren();
      pagination.hidden = true;
      message.textContent =
        "Recipes could not be loaded. Please try again later.";
    } finally {
      recipeGrid.setAttribute("aria-busy", "false");
    }
  }

  areaFilter?.addEventListener("change", applyFilters);
  categoryFilter?.addEventListener("change", applyFilters);
  shuffleButton?.addEventListener("click", shuffleRecipes);
  alphabetizeButton?.addEventListener("click", alphabetizeRecipes);
  loadRecipes();
}
