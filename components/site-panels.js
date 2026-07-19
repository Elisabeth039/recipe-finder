class SitePanels extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="backdrop" hidden></div>
      <aside
        class="side-panel"
        id="favorites-panel"
        aria-labelledby="favorites-title"
        aria-hidden="true"
      >
        <div class="panel-heading">
          <h2 id="favorites-title">Favorites</h2>
          <button class="close-button" type="button" aria-label="Close favorites">
            ×
          </button>
        </div>
      </aside>
      <aside
        class="side-panel"
        id="about-panel"
        aria-labelledby="about-title"
        aria-hidden="true"
      >
        <div class="panel-heading">
          <h2 id="about-title">About CrumBloom</h2>
          <button class="close-button" type="button" aria-label="Close about panel">
            ×
          </button>
        </div>
        <div class="about-content">
          <p class="about-intro">
            Discover your next favourite meal, one recipe at a time.
          </p>
          <p>
            CrumBloom is a recipe discovery website for exploring meals from
            around the world. Whether you are planning dinner, trying a new
            cuisine, or simply looking for inspiration, it is here to make the
            search feel easy.
          </p>
          <h3>What you can do</h3>
          <ul class="about-features">
            <li>Search for recipes by name</li>
            <li>Filter meals by cuisine or category</li>
            <li>Sort, shuffle, and browse recipe ideas</li>
            <li>Save favourites to come back to later</li>
            <li>Find ingredients, instructions, and video tutorials</li>
          </ul>
          <p class="about-note">
            <strong>Good to know:</strong> Recipe information is provided by
            TheMealDB. Your saved favourites stay in your browser and are never
            shared with anyone.
          </p>
        </div>
      </aside>
    `;
  }
}

customElements.define("site-panels", SitePanels);
