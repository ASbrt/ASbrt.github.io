# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


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

Build and type-check with `npm run build --ignore-scripts` (skips the repository-data fetch).
With Vite running and Playwright available, run `node tests/verify-explore.cjs` for browser interaction checks.
The checks use installed Chrome by default; `PLAYWRIGHT_CHANNEL` can select another Playwright browser channel.
