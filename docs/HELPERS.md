# Helpers Dictionary

The `helpers/` folder contains pure utility functions used to format data, handle strings, build URLs, and manage configuration.

## Available Helpers

### `url.js`
Centralizes URL creation logic to avoid hardcoded paths across components.
- `getArtistUrl(id)`: Returns `/artist/{id}`
- `getArtistsCategoryUrl(category)`: Returns `/artists?category={category}`
- `getBlogUrl(slug)`: Returns `/blog-post/{slug}`

### `scripts/`
Maintenance and architecture scripts intended for internal CLI usage (not exported to the app bundle).
- Migration scripts
- Path aliases update scripts

### `archive/`
A cold storage for deprecated files. It allows us to safely retain historical code during heavy refactoring without cluttering the active source tree.
