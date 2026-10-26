# Hyssing

Small developer utilities that run entirely in the browser — no server, and your data never leaves the page.

- **Base64** – encode/decode UTF-8 text (standard or URL-safe)
- **JSON** – validate, format and minify
- **XML** – validate, format and minify
- **Markdown** – tidy up with Prettier
- **Text** – line operations: sort (A→Z, Z→A, natural number order, per-language alphabet such as Norwegian æ ø å), remove duplicates, shuffle, reverse, remove empty lines, filter by regex, and regex find-and-replace with capture groups
- **Pipeline** – node graph that chains any of the tools: each node transforms its input and feeds the next; start from text, the current time or a URL (fetched only when you click Fetch, and only from sites that allow cross-origin requests), work with JSON (get by path, map over arrays with a path or a `{field.path}` template, pick fields, filter, sort, keys, length, to CSV, lines to array, escape/unescape), format dates in any time zone, branch, merge with Concat, inspect any node in the viewer, and share a pipeline as a link or Base64 string
- **JWT** – decode, check expiry, verify signatures (HS/RS/PS/ES with a secret, PEM or JWK) and sign HS256/384/512 tokens
- **GeoJSON** – render on a map with a bundled offline world outline; OpenStreetMap tiles are opt-in
- **Time** – live clock in Unix seconds/ms, ISO 8601, RFC 2822, ISO week and any time zone, plus a timestamp/date converter

Built with React + Vite.

```sh
npm install
npm run dev      # start the dev server
npm test         # run unit tests
npm run build    # production build into dist/
npm run preview  # serve the production build
```

The previous Vue version of this project is preserved at the `vue-legacy` tag.

## Deployment

Every push and pull request is linted, tested and built by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pushes to `main` are
then published to GitHub Pages (repo **Settings → Pages → Source: GitHub Actions**).
