class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="CrumBloom home">
          <img src="assets/Head-logo.png" alt="CrumBloom" />
        </a>
        <nav class="header-actions" aria-label="Site information">
          <button class="icon-button fav-btn" type="button" data-panel-target="favorites-panel" aria-label="Open favorites" aria-expanded="false">★</button>
          <button class="icon-button info-button" type="button" data-panel-target="about-panel" aria-label="About CrumBloom" aria-expanded="false">i</button>
        </nav>
      </header>
    `;
  }
}

customElements.define("site-header", SiteHeader);
