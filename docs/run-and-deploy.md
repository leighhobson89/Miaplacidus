# Run and deploy MIAPLACIDUS

## Run locally

Use Node.js 22.12+, 24, or 26+ from the `IncrementalGame` project folder. Install dependencies once:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`. Vite watches the source files and reloads the page as you edit them. Use `npm run dev:test` only for the automated browser tests; that mode enables test controls and is not the player build.

The source [`index.html`](../index.html) is the app entry, but it imports TypeScript/TSX and npm packages. It needs Vite to compile those files. Opening the source file directly or serving the source folder with a plain static server such as VS Code Live Server will not run the game. The page shows a Vite startup message if the app does not mount.

## Check the production build locally

Build the full game and serve the built files locally:

```sh
npm run build
npm run preview
```

`npm run build` runs the TypeScript check and writes the production site to `dist/`. `npm run preview` serves that built site locally, usually at `http://localhost:4173/`. This checks the same bundled HTML, JavaScript, CSS and assets that a static host will publish.

## Deploy to a static host

The production site is static browser HTML, JavaScript, CSS and assets. Configure the host to install dependencies with `npm ci`, run `npm run build`, and publish the `dist/` directory. Do not publish the source `index.html` by itself. This Hydrogen slice does not need a server runtime or database.

- **Vercel:** import the repository, then verify the build command is `npm run build` and the output directory is `dist`. Vercel's Vite integration can detect those defaults automatically. See [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).
- **GitHub Pages:** use a GitHub Actions workflow to install dependencies, run `npm run build`, and upload `dist/` as the Pages artifact. In repository Settings → Pages, choose GitHub Actions as the source. See Vite's [GitHub Pages deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

Vite's `base` must match the public URL path when the app is hosted below a domain root. The default `/` works for a custom domain or a GitHub Pages user site such as `https://name.github.io/`. A GitHub Pages project site at `https://name.github.io/repository/` needs `base: "/repository/"` in `vite.config.ts` before building. Replace `repository` with the actual repository name. The target host and URL are not selected yet, so no host-specific deployment workflow is configured in this project.

See the official [Vite static deployment guide](https://vite.dev/guide/static-deploy.html) for provider-specific setup.
