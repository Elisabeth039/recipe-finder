const favoritesStorageKey = "crumbloom-favorites";

function normalizeFavorite(recipe) {
  if (!recipe?.idMeal || !recipe?.strMeal || !recipe?.strMealThumb) return null;

  return {
    idMeal: String(recipe.idMeal),
    strMeal: String(recipe.strMeal),
    strMealThumb: String(recipe.strMealThumb),
  };
}

export function getFavorites() {
  try {
    const storedFavorites = JSON.parse(
      localStorage.getItem(favoritesStorageKey) || "[]",
    );
    if (!Array.isArray(storedFavorites)) return [];

    const favoriteIds = new Set();
    return storedFavorites.reduce((favorites, recipe) => {
      const favorite = normalizeFavorite(recipe);
      if (!favorite || favoriteIds.has(favorite.idMeal)) return favorites;

      favoriteIds.add(favorite.idMeal);
      favorites.push(favorite);
      return favorites;
    }, []);
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
  } catch (error) {}
}

export function isFavorite(recipeId) {
  return getFavorites().some(
    (favorite) => favorite.idMeal === String(recipeId),
  );
}

function setFavoriteButtonState(button, recipe) {
  const selected = isFavorite(recipe.idMeal);
  button.classList.toggle("is-favorite", selected);
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute(
    "aria-label",
    `${selected ? "Remove" : "Add"} ${recipe.strMeal} ${selected ? "from" : "to"} favorites`,
  );
}

export function configureFavoriteButton(button, recipe) {
  const favorite = normalizeFavorite(recipe);
  if (!favorite) return;

  button.dataset.favoriteId = favorite.idMeal;
  button.dataset.favoriteName = favorite.strMeal;
  button.dataset.favoriteImage = favorite.strMealThumb;
  setFavoriteButtonState(button, favorite);
}

function getButtonRecipe(button) {
  return normalizeFavorite({
    idMeal: button.dataset.favoriteId,
    strMeal: button.dataset.favoriteName,
    strMealThumb: button.dataset.favoriteImage,
  });
}

function requestFavoriteRemoval(recipe, onConfirm) {
  const lastFocusedElement = document.activeElement;
  const dialog = document.createElement("div");
  dialog.className = "favorite-confirmation";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "favorite-confirmation-title");

  const card = document.createElement("div");
  card.className = "favorite-confirmation-card";
  const title = document.createElement("h2");
  title.id = "favorite-confirmation-title";
  title.textContent = "Remove favorite?";
  const message = document.createElement("p");
  message.textContent = `Remove ${recipe.strMeal} from your favorites?`;
  const actions = document.createElement("div");
  actions.className = "favorite-confirmation-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "favorite-confirmation-cancel";
  cancel.textContent = "Keep recipe";
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "favorite-confirmation-remove";
  confirm.textContent = "Remove";
  actions.append(cancel, confirm);
  card.append(title, message, actions);
  dialog.append(card);

  function close(confirmed) {
    document.removeEventListener("keydown", handleKeydown);
    dialog.remove();
    lastFocusedElement?.focus();
    if (confirmed) onConfirm();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") close(false);
  }

  cancel.addEventListener("click", () => close(false));
  confirm.addEventListener("click", () => close(true));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close(false);
  });
  document.addEventListener("keydown", handleKeydown);
  document.body.append(dialog);
  cancel.focus();
}

function removeFavorite(recipeId) {
  const favorites = getFavorites().filter(
    (favorite) => favorite.idMeal !== recipeId,
  );
  saveFavorites(favorites);
  document.dispatchEvent(
    new CustomEvent("favorites-changed", { detail: { favorites } }),
  );
}

function toggleFavorite(recipe) {
  const favorites = getFavorites();
  const favoriteIndex = favorites.findIndex(
    (favorite) => favorite.idMeal === recipe.idMeal,
  );

  if (favoriteIndex === -1) {
    favorites.push(recipe);
  } else {
    requestFavoriteRemoval(recipe, () => removeFavorite(recipe.idMeal));
    return;
  }

  saveFavorites(favorites);
  document.dispatchEvent(
    new CustomEvent("favorites-changed", { detail: { favorites } }),
  );
}

function renderFavoritesPanel() {
  const panel = document.querySelector("#favorites-panel");
  if (!panel) return;

  panel.querySelector("[data-favorites-content]")?.remove();
  const content = document.createElement("div");
  content.className = "favorites-content";
  content.dataset.favoritesContent = "";
  const favorites = getFavorites();

  if (!favorites.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "favorites-empty-state";
    emptyState.textContent = "Save a recipe to find it here.";
    content.append(emptyState);
  } else {
    const list = document.createElement("ul");
    list.className = "favorites-list";
    list.setAttribute("aria-label", "Saved recipes");
    [...favorites].reverse().forEach((favorite) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "favorite-recipe-link";
      link.href = `recipe.html?id=${encodeURIComponent(favorite.idMeal)}`;
      const image = document.createElement("img");
      image.src = favorite.strMealThumb;
      image.alt = "";
      const name = document.createElement("span");
      name.textContent = favorite.strMeal;
      link.append(image, name);

      const remove = document.createElement("button");
      remove.className = "favorite-remove-button";
      remove.type = "button";
      remove.dataset.favoriteId = favorite.idMeal;
      remove.dataset.favoriteName = favorite.strMeal;
      remove.setAttribute(
        "aria-label",
        `Remove ${favorite.strMeal} from favorites`,
      );
      remove.textContent = "Remove";
      item.append(link, remove);
      list.append(item);
    });
    content.append(list);
  }

  panel.append(content);
}

export function initFavoriteButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".card-favorite");
    if (!button) return;

    const recipe = getButtonRecipe(button);
    if (recipe) toggleFavorite(recipe);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".favorite-remove-button");
    if (!button) return;

    requestFavoriteRemoval({ strMeal: button.dataset.favoriteName }, () =>
      removeFavorite(button.dataset.favoriteId),
    );
  });

  document.addEventListener("favorites-changed", () => {
    document.querySelectorAll(".card-favorite").forEach((button) => {
      const recipe = getButtonRecipe(button);
      if (recipe) setFavoriteButtonState(button, recipe);
    });
    renderFavoritesPanel();
  });

  renderFavoritesPanel();
}
