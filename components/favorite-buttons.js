export function initFavoriteButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".card-favorite");
    if (!button) return;

    const selected = button.classList.toggle("is-favorite");
    button.setAttribute("aria-pressed", selected);
    button.setAttribute(
      "aria-label",
      `${selected ? "Remove" : "Add"} recipe ${selected ? "from" : "to"} favorites`,
    );
  });
}
