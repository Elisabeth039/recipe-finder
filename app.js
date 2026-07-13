// This file handles only static, presentational interactions for now.
document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.querySelector(".backdrop");
  const panels = document.querySelectorAll(".side-panel");
  let lastTrigger;

  function closePanels() {
    panels.forEach((panel) => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    });
    document
      .querySelectorAll("[data-panel-target]")
      .forEach((button) => button.setAttribute("aria-expanded", "false"));
    backdrop.hidden = true;
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll("[data-panel-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.dataset.panelTarget);
      closePanels();
      lastTrigger = button;
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      backdrop.hidden = false;
      button.setAttribute("aria-expanded", "true");
      panel.querySelector(".close-button").focus();
    });
  });
  document
    .querySelectorAll(".close-button")
    .forEach((button) => button.addEventListener("click", closePanels));
  backdrop.addEventListener("click", closePanels);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closePanels();
  });

  document.querySelectorAll(".card-favorite").forEach((button) =>
    button.addEventListener("click", () => {
      const selected = button.classList.toggle("is-favorite");
      button.setAttribute("aria-pressed", selected);
      button.setAttribute(
        "aria-label",
        `${selected ? "Remove" : "Add"} recipe ${selected ? "from" : "to"} favorites`,
      );
    }),
  );

  const form = document.querySelector(".search-form");
  const message = document.querySelector(".status-message");
  if (form)
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      message.textContent = "No recipes found. Try a different search term.";
    });
});
