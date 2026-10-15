<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import ShaderHero from '../components/ShaderHero.vue'
import SculptureControls from '../components/SculptureControls.vue'
import SculptureShuffle from '../components/SculptureShuffle.vue'
import { tuneMode, compositionSeed } from '../hero/sculpture/state'
const exploring = ref(false)
const moving = ref(false)
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
    <ShaderHero ref="shader" :exploring="exploring" :moving="moving" @ready="canExplore = true" />
    <Transition name="dock">
      <div v-show="exploring" class="hero__dock">
        <SculptureShuffle :exploring="true" :can-explore="canExplore" :moving="moving" @move="moving = $event" @explore="stopExploring" @reset="shader?.resetView()" />
      </div>
    </Transition>
    <div class="hero__content" :inert="exploring" :aria-hidden="exploring">
      <div class="hero__heading">
      <h1 class="display-xl">
        <span class="rv" data-rv-delay="0.05">Aaron</span>
        <span class="rv hero__line2" data-rv-delay="0.15">Siebert<em class="accent">.</em></span>
      </h1>
      <SculptureShuffle v-if="!tuneMode" ref="actions" :exploring="false" :can-explore="canExplore" :moving="moving" @explore="toggleExplore" />
      </div>
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
  transition: transform .4s var(--ease-out), opacity .3s ease;
}
.hero--exploring .hero__content { opacity: 0; transform: translateY(2.5rem); pointer-events: none; }
.hero__heading { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem; }
.hero__dock { position: absolute; bottom: max(1.25rem, env(safe-area-inset-bottom)); left: var(--gutter); right: var(--gutter); z-index: 3; display: flex; justify-content: center; }
.dock-enter-active, .dock-leave-active { transition: opacity .25s ease, transform .35s var(--ease-out); }
.dock-enter-from, .dock-leave-to { opacity: 0; transform: translateY(1rem); }
.dock-leave-active { pointer-events: none; }
@media(max-width:720px) {
  .hero__heading > :last-child { width: 100%; display: flex; justify-content: flex-end; }
}
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
@media (prefers-reduced-motion: reduce) {
  .hero__content, .dock-enter-active, .dock-leave-active { transition: none; }
}
</style>
