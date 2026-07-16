export function initSearchForm() {
  const form = document.querySelector(".search-form");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(form).get("search")?.trim() || "";
    document.dispatchEvent(
      new CustomEvent("recipe-search", { detail: { query } }),
    );
  });
}
