//checked
export function initSearchForm() {
  const form = document.querySelector(".search-form");
  const message = document.querySelector(".status-message");

  if (!form || !message) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "No recipes found. Try a different search term.";
  });
}
