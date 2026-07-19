# CrumBloom — Recipe Finder

CrumBloom is a responsive recipe-discovery web app for finding meals from around the world. Browse a large collection, narrow it by cuisine or category, save recipes you love, and open a full recipe page for ingredients, instructions, and video tutorials.

Recipe data is provided by [TheMealDB](https://www.themealdb.com/api.php).

## Features

- Browse recipes in a paginated card grid
- Search recipes by name
- Filter recipes by area (cuisine) and category
- Shuffle recipes or return them to alphabetical order
- Open a dedicated recipe page with ingredients, measurements, instructions, and a YouTube link when available
- Discover related recipes from the same category
- Save favorites in the browser with `localStorage`
- Use accessible controls, live status messages, keyboard-friendly panels, and responsive layouts for mobile through desktop

## Built with

- HTML5
- CSS3
- Vanilla JavaScript (ES modules and Web Components)
- [TheMealDB API](https://www.themealdb.com/api.php)

No framework, package manager, or build step is required.

## Run locally

Because the app loads JavaScript modules and requests recipe data from an API, serve the folder through a local web server instead of opening the HTML files directly.

1. Clone or download this repository.
2. In the project directory, start a local server. For example, with Python:

   ```bash
   python -m http.server 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000) in your browser.

You can also use the **Live Server** extension in VS Code or any other static-file server.

## Project structure

```text
recipe-finder/
├── assets/             # Logo and favicon
├── components/         # UI components, API requests, and app behavior
│   ├── mealdb.js       # TheMealDB API client
│   ├── home-recipes.js # Browse, filter, sort, shuffle, pagination
│   ├── recipe-details.js
│   ├── favorites.js    # Browser-persisted favorites
│   └── ...
├── styles/             # Component-specific styles and responsive rules
├── index.html          # Recipe finder
├── recipe.html         # Individual recipe details page
├── app.js              # Application entry point
└── styles.css          # Style imports
```

## How it works

On load, CrumBloom fetches meals from TheMealDB and displays them in pages of 32 cards. Filters, search, sorting, and shuffling update the current collection in the browser. Saved favorites are stored only in the current browser under the `crumbloom-favorites` key; they are not sent to a server.

## Notes

- An internet connection is required to load recipe data, images, and optional YouTube videos.
- Recipe availability and details are determined by TheMealDB.
- Favorites are specific to the browser and device where they were saved.

## License

This project does not currently include a license. Add one before distributing or reusing the code publicly.
