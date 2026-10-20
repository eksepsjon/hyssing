# Hyssing

Small developer utilities that run entirely in the browser — no server, no network calls.

- **Base64** – encode/decode UTF-8 text (standard or URL-safe)
- **JSON** – validate, format and minify
- **XML** – validate, format and minify
- **Markdown** – tidy up with Prettier

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
