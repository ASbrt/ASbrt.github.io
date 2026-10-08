<template>
  <section id="visuell" class="section section--visuell">
    <div class="visuell__word" aria-hidden="true" data-parallax="0.08">VISUELL</div>

    <div class="container">
      <div class="visuell__grid">
        <div class="visuell__copy">
          <h2 class="display-lg rv">
            A groovebox that treats video like
            <span class="accent">samples</span>.
          </h2>
          <p class="rv">
            DJ gear changed how we play music. VJ tools never got the same
            treatment. Visuell closes that gap: a video-sampling instrument
            where clips are cut into pads and performed live, with the timing
            and feel of a drum machine.
          </p>

          <ol class="visuell__steps">
            <li class="rv">
              <span class="mono">01</span>
              <strong>Load</strong>
              <span>Drop in video clips, a camera feed, anything visual.</span>
            </li>
            <li class="rv">
              <span class="mono">02</span>
              <strong>Slice</strong>
              <span>Cut footage into segments and map them to pads.</span>
            </li>
            <li class="rv">
              <span class="mono">03</span>
              <strong>Perform</strong>
              <span>Trigger, layer, and play visuals live like an instrument.</span>
            </li>
          </ol>

          <ul class="visuell__specs mono">
            <li class="rv"><span>Type</span><span>Startup / Creative Tool</span></li>
            <li class="rv"><span>Role</span><span>Founder, Design &amp; Build</span></li>
            <li class="rv"><span>Recognition</span><span>Development Award Music Worx 2024</span></li>
            <li class="rv"><span>Status</span><span>In development</span></li>
          </ul>

          <a class="btn btn--solid rv" href="https://www.visuell.art/" target="_blank" rel="noopener">
            Visit visuell.art ↗
          </a>
        </div>

        <div class="visuell__panel rv" data-parallax="0.1" aria-hidden="true">
          <span class="visuell__panel-label mono">VISUELL / SIGNAL 001</span>
          <div class="visuell__pads">
            <span
              v-for="i in 16"
              :key="i"
              class="visuell__pad"
              :class="{ 'visuell__pad--hot': hotPad === i }"
              :style="i === hotPad ? { '--intensity': intensity } : {}"
            ></span>
          </div>
          <div class="visuell__bars">
            <span v-for="i in 24" :key="i" :style="{ '--d': `${(i * 137.5) % 100}ms` }"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// pads light up in a random pattern, like a clip being performed
const hotPad = ref(0)
const intensity = ref(0.9)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    hotPad.value = Math.floor(Math.random() * 16) + 1
    intensity.value = 0.4 + Math.random() * 0.6
  }, 420)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.section--visuell {
  background: var(--bg-raise);
  border-block: 1px solid var(--line);
  overflow: hidden;
}

/* giant outlined wordmark bleeding off the right edge */
.visuell__word {
  font-weight: 800;
  font-size: clamp(5rem, 17vw, 17rem);
  line-height: 0.85;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1px var(--line);
  user-select: none;
  margin-bottom: clamp(2rem, 6vh, 4rem);
  transform: translateX(-0.05em);
}

.visuell__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}

.visuell__copy {
  display: grid;
  gap: 1.75rem;
  justify-items: start;
}

.visuell__copy > p {
  color: var(--muted);
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.65;
  max-width: 32rem;
}

/* how it works */
.visuell__steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  width: 100%;
}

.visuell__steps li {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  background: var(--bg-raise);
  padding: 1.1rem 1.25rem;
  transition: background 0.25s var(--ease-out);
}

.visuell__steps li:hover {
  background: var(--bg);
}

.visuell__steps li:hover .mono {
  color: var(--accent);
}

.visuell__steps strong {
  font-size: 1.05rem;
}

.visuell__steps li > span:last-child {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* specs */
.visuell__specs {
  list-style: none;
  width: 100%;
  border-top: 1px solid var(--line);
}

.visuell__specs li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
  letter-spacing: 0.02em;
  text-transform: none;
}

.visuell__specs li span:last-child {
  color: var(--ink);
  text-align: right;
}

/* instrument panel */
.visuell__panel {
  position: relative;
  aspect-ratio: 4 / 4.6;
  border: 1px solid var(--line);
  background:
    radial-gradient(120% 100% at 20% 0%, rgba(216, 255, 62, 0.07), transparent 55%),
    var(--bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
}

.visuell__panel-label {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
}

.visuell__pads {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 2rem;
}

.visuell__pad {
  aspect-ratio: 1;
  border: 1px solid var(--line);
  background: var(--bg-raise);
  transition:
    background 0.18s ease-out,
    box-shadow 0.18s ease-out,
    border-color 0.18s ease-out;
}

.visuell__pad--hot {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 calc(24px * var(--intensity, 0.8)) rgba(216, 255, 62, 0.45);
}

.visuell__bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  width: 100%;
  height: 18%;
}

.visuell__bars span {
  flex: 1;
  background: var(--accent);
  height: 20%;
  animation: bar 1.6s ease-in-out infinite alternate;
  animation-delay: var(--d);
  opacity: 0.85;
}

@keyframes bar {
  from { height: 12%; }
  to { height: 96%; }
}

@media (max-width: 860px) {
  .visuell__grid {
    grid-template-columns: 1fr;
  }
  .visuell__steps {
    grid-template-columns: 1fr;
  }
  .visuell__panel {
    aspect-ratio: 4 / 3.4;
  }
}
</style>
