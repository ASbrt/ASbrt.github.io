# Personal portfolio

Vue 3, TypeScript, and Vite site with an interactive Three.js sculpture.

## Development

```sh
npm ci
npm run dev
```

- `npm run build` type-checks and builds the site into `dist/`.
- `npm run preview` previews the production build.
- `npm test` compiles the sculpture generator into ignored `.test-build/` output and runs its regression checks.

GitHub Actions deploys `main` to GitHub Pages. Project entries live in
`src/sections/ProjectsSection.vue`; downloadable documents live in `public/`.

## Exploring the hero sculpture

Choose **Explore sculpture**, then drag to rotate and scroll or pinch to zoom.
Enable **Move** to reposition with a drag, or use Shift-drag / Shift + arrow keys.
Two fingers move and pinch to zoom. Reset also restores the original position.
Arrow keys rotate; `+` / `−` zoom; Home or **Reset view** restores the view.
**Done** or Escape returns to browsing. New sculpture also resets the view.
Share links reproduce the generated artwork, without visitor zoom or rotation.
The existing advanced tuning panel is available with `?tune=1`.

For learning the implementation:
- `src/sections/HeroSection.vue` owns the Vue Explore state and focus handoff.
- `src/components/ShaderHero.vue` translates pointer and keyboard input into bounded view offsets.
- `src/hero/sculpture/index.ts` applies those offsets to the Three.js group without changing the seeded settings or rebuilding geometry.

With Vite running and Playwright available, run `node tests/verify-explore.cjs` for browser interaction checks.
The checks use installed Chrome by default; `PLAYWRIGHT_CHANNEL` can select another Playwright browser channel.

## Reading group

The standalone `/reading-circle/` page is linked from About. Edit its five
sessions in `src/data/readingCircle.ts`. To enable the participant materials
button, set `materialsUrl` in `src/pages/ReadingCirclePage.vue` to the restricted
folder URL. Access is managed by the folder provider.

Vite builds both `dist/index.html` and `dist/reading-circle/index.html`; the
existing GitHub Pages workflow deploys both pages.
