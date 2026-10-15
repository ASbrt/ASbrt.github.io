<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ShaderHero from '../components/ShaderHero.vue'
import SculptureControls from '../components/SculptureControls.vue'
import SculptureShuffle from '../components/SculptureShuffle.vue'
import { tuneMode, compositionSeed } from '../hero/sculpture/state'
const exploring = ref(false)
const canExplore = ref(false)
const shader = ref<InstanceType<typeof ShaderHero> | null>(null)
const actions = ref<InstanceType<typeof SculptureShuffle> | null>(null)
async function stopExploring() {
  if (!exploring.value) return
  exploring.value = false
  await nextTick()
  actions.value?.focusExplore()
}
function toggleExplore() {
  if (exploring.value) void stopExploring()
  else exploring.value = true
}
watch(compositionSeed, () => shader.value?.resetView())
</script>

<template>
  <section class="hero" :class="{ 'hero--exploring': exploring }" @keydown.esc="stopExploring">
    <ShaderHero ref="shader" :exploring="exploring" @ready="canExplore = true" />
    <SculptureShuffle v-if="!tuneMode" ref="actions" :exploring="exploring" :can-explore="canExplore" @explore="toggleExplore" @reset="shader?.resetView()" />
    <p v-if="exploring" id="explore-help" class="hero__help mono">Drag to rotate · Scroll or pinch to zoom<br />Arrow keys rotate · + / − zoom · Home resets · Esc exits</p>
    <div class="hero__content" :inert="exploring" :aria-hidden="exploring">
      <h1 class="display-xl">
        <span class="rv" data-rv-delay="0.05">Aaron</span>
        <span class="rv hero__line2" data-rv-delay="0.15">Siebert<em class="accent">.</em></span>
      </h1>
      <div class="hero__meta rv" data-rv-delay="0.3">
        <p class="hero__tag">
          My work moves between economics, data science and computational modeling. I also build creative software and design for the web.
        </p>
        <div class="hero__cta">
          <a class="btn btn--solid" href="#projects">View Projects</a>
          <a class="btn" href="#about">About Me</a>
        </div>
      </div>
    </div>
    <SculptureControls v-if="tuneMode" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to top,
    rgba(10,10,11,.92) 0%,
    rgba(10,10,11,.55) 30%,
    rgba(10,10,11,0) 60%
  );
  pointer-events: none;
}
.hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-inline: var(--gutter);
  padding-bottom: clamp(3rem,8vh,6rem);
  padding-top: 6rem;
}
.hero--exploring .hero__content { opacity: 0; pointer-events: none; }
.hero__help { position: absolute; bottom: 2rem; left: var(--gutter); right: var(--gutter); z-index: 3; pointer-events: none; text-align: center; line-height: 1.8; color: var(--ink); }
.hero__line2 { display: block; }
.hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-top: clamp(1.5rem,4vh,3rem);
  padding-top: 1.5rem;
  border-top: 1px solid rgba(242,242,239,.22);
}
.hero__tag {
  max-width: 56rem;
  font-size: clamp(1.15rem,2vw,1.55rem);
  line-height: 1.5;
  color: #e2e2dd;
  text-shadow: 0 1px 12px rgba(10,10,11,.6);
}
.hero__cta { display: flex; gap: .75rem; flex-wrap: wrap; }
</style>
