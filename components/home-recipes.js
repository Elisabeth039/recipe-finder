import { getAllRecipes, getCategories, searchRecipesByName } from "./mealdb.js";
import { createRecipeCard } from "./recipe-card.js";

const recipesPerPage = 32;
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
  const paginationControls = document.querySelector(".pagination-controls");
  const pagePagination = document.querySelector(".page-pagination");
  const scrollTopButton = document.querySelector(".scroll-top-button");
  const message = document.querySelector(".status-message");
  const areaFilter = document.querySelector("#area-filter");
  const categoryFilter = document.querySelector("#category-filter");
  const shuffleButton = document.querySelector(".shuffle-button");
  const alphabetizeButton = document.querySelector(".alphabetize-button");
  let allRecipes = [];
  let recipes = [];
  let currentPage = 1;
  let searchResults = null;
  let searchRequest = 0;

  if (
    !recipeGrid ||
    !pagination ||
    !paginationControls ||
    !pagePagination ||
    !message
  ) return;

  function renderPagination() {
    const pageCount = Math.ceil(recipes.length / recipesPerPage);
    pagination.replaceChildren();
    paginationControls.hidden = pageCount <= 1;
    pagePagination.replaceChildren();
    pagePagination.hidden = pageCount <= 1;

    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";
    previous.disabled = currentPage === 1;
    previous.addEventListener("click", () => renderPage(currentPage - 1, true));
    pagination.append(previous);

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    next.disabled = currentPage === pageCount;
    next.addEventListener("click", () => renderPage(currentPage + 1, true));
    pagination.append(next);

    const visiblePages = [
      1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      pageCount,
    ]
      .filter((page) => page >= 1 && page <= pageCount)
      .filter((page, index, pages) => pages.indexOf(page) === index)
      .sort((first, second) => first - second);

    visiblePages.forEach((page, index) => {
      const previousPage = visiblePages[index - 1];
      if (previousPage && page - previousPage > 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "…";
        ellipsis.setAttribute("aria-hidden", "true");
        pagePagination.append(ellipsis);
      }

      const pageButton = document.createElement("button");
      pageButton.type = "button";
      pageButton.textContent = page;
      pageButton.setAttribute("aria-label", `Page ${page}`);
      if (page === currentPage) {
        pageButton.className = "is-current";
        pageButton.setAttribute("aria-current", "page");
      }
      pageButton.addEventListener("click", () => renderPage(page, true));
      pagePagination.append(pageButton);
    });
  }

  function renderPage(page, scrollToFilters = false) {
    const pageCount = Math.ceil(recipes.length / recipesPerPage);
    currentPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
    const start = (currentPage - 1) * recipesPerPage;
    const pageRecipes = recipes.slice(start, start + recipesPerPage);

    recipeGrid.replaceChildren(...pageRecipes.map(createRecipeCard));
    message.textContent = recipes.length
      ? `Showing ${start + 1}–${start + pageRecipes.length} of ${recipes.length} recipes`
      : "No recipes match these filters.";
    renderPagination();

    if (scrollToFilters) {
      document.querySelector(".search-controls")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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

  function createFilterMenu(filter) {
    if (!filter || filter.dataset.customMenu) return;

    const menu = document.createElement("div");
    const trigger = document.createElement("button");
    const options = document.createElement("div");
    const menuId = `${filter.id}-options`;

    menu.className = "filter-select";
    trigger.className = "filter-select-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menuId);
    options.className = "filter-select-options";
    options.id = menuId;
    options.setAttribute("role", "listbox");
    options.hidden = true;

    [...filter.options].forEach((option) => {
      const choice = document.createElement("button");
      choice.className = "filter-select-option";
      choice.type = "button";
      choice.textContent = option.textContent;
      choice.setAttribute("role", "option");
      choice.setAttribute("aria-selected", String(option.selected));
      choice.addEventListener("click", () => {
        filter.value = option.value;
        filter.dispatchEvent(new Event("change", { bubbles: true }));
        closeMenu();
        trigger.focus();
      });
      options.append(choice);
    });

    function syncMenu() {
      const selected = filter.selectedOptions[0];
      trigger.textContent = selected?.textContent || "Select";
      [...options.children].forEach((choice, index) => {
        choice.setAttribute(
          "aria-selected",
          String(filter.options[index].selected),
        );
      });
    }

    function closeMenu() {
      options.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", () => {
      const isOpen = !options.hidden;
      document.querySelectorAll(".filter-select-options").forEach((list) => {
        list.hidden = true;
      });
      document.querySelectorAll(".filter-select-trigger").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
      options.hidden = isOpen;
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
    filter.addEventListener("change", syncMenu);
    filter.classList.add("is-native-filter");
    filter.dataset.customMenu = "true";
    menu.append(trigger, options);
    filter.after(menu);
    syncMenu();
  }

  function applyFilters() {
    const selectedArea = areaFilter?.value || "";
    const selectedCategory = categoryFilter?.value || "";
    const sourceRecipes = searchResults ?? allRecipes;
    recipes = sourceRecipes.filter(
      (recipe) =>
        (!selectedArea || recipe.strArea === selectedArea) &&
        (!selectedCategory || recipe.strCategory === selectedCategory),
    );
    renderPage(1);
  }

  function shuffleRecipes() {
    const recipesToShuffle = searchResults ?? allRecipes;
    if (recipesToShuffle.length < 2) return;

    const previousOrder = [...recipesToShuffle];

    for (let index = recipesToShuffle.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [recipesToShuffle[index], recipesToShuffle[randomIndex]] = [
        recipesToShuffle[randomIndex],
        recipesToShuffle[index],
      ];
    }

    if (
      recipesToShuffle.every((recipe, index) => recipe === previousOrder[index])
    ) {
      recipesToShuffle.push(recipesToShuffle.shift());
    }

    if (!searchResults) saveRecipeOrder(allRecipes);
    applyFilters();
  }

  function alphabetizeRecipes() {
    if (searchResults) {
      searchResults = sortAlphabetically(searchResults);
      applyFilters();
      return;
    }

    if (!allRecipes.length) return;

    allRecipes = sortAlphabetically(allRecipes);
    clearSavedRecipeOrder();
    applyFilters();
  }

  async function loadRecipes() {
    message.textContent = "Loading recipes…";
    recipeGrid.setAttribute("aria-busy", "true");

    try {
      const [loadedRecipes, categories] = await Promise.all([
        getAllRecipes(),
        getCategories(),
      ]);
      allRecipes = restoreRecipeOrder(loadedRecipes);
      addFilterOptions(
        areaFilter,
        [
          ...new Set(
            allRecipes.map((recipe) => recipe.strArea).filter(Boolean),
          ),
        ].sort(),
      );
      addFilterOptions(categoryFilter, categories);
      createFilterMenu(areaFilter);
      createFilterMenu(categoryFilter);
      applyFilters();
    } catch (error) {
      recipeGrid.replaceChildren();
      paginationControls.hidden = true;
      pagePagination.hidden = true;
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
  scrollTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.addEventListener("recipe-search", async (event) => {
    const query = event.detail?.query || "";
    const requestId = ++searchRequest;

    if (!query) {
      searchResults = null;
      applyFilters();
      return;
    }

    message.textContent = "Searching recipes…";
    recipeGrid.setAttribute("aria-busy", "true");

    try {
      const foundRecipes = await searchRecipesByName(query);
      if (requestId !== searchRequest) return;
      searchResults = foundRecipes;
      applyFilters();
    } catch (error) {
      if (requestId !== searchRequest) return;
      recipeGrid.replaceChildren();
      paginationControls.hidden = true;
      pagePagination.hidden = true;
      message.textContent =
        "Search could not be completed. Please try again later.";
    } finally {
      if (requestId === searchRequest) {
        recipeGrid.setAttribute("aria-busy", "false");
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".filter-select")) {
      document.querySelectorAll(".filter-select-options").forEach((list) => {
        list.hidden = true;
      });
      document.querySelectorAll(".filter-select-trigger").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
    }
  });
  loadRecipes();
}
