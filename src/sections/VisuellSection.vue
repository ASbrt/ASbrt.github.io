<template>
  <section id="visuell" class="section section--visuell">
    <div class="container">
      <div class="visuell__stage" data-parallax="0.12">
        <div class="visuell__panel" aria-hidden="true">
          <span class="visuell__panel-label mono">VISUELL / SIGNAL 001</span>
          <div class="visuell__bars">
            <span v-for="i in 24" :key="i" :style="{ '--d': `${(i * 137.5) % 100}ms` }"></span>
          </div>
        </div>

        <div class="visuell__copy">
          <h2 class="display-lg rv">Visuell<span class="accent">.</span></h2>
          <p class="rv">
            A video-sampling groovebox for live visuals. Built from the
            intersection of two habits: making music and training models.
            VJing deserves the same workflow language as DJing.
          </p>
          <ul class="visuell__specs mono">
            <li class="rv"><span>Type</span><span>Startup / Creative Tool</span></li>
            <li class="rv"><span>Role</span><span>Founder, Design &amp; Build</span></li>
            <li class="rv"><span>Status</span><span>In development</span></li>
          </ul>
          <a class="btn btn--solid rv" href="https://www.visuell.art/" target="_blank" rel="noopener">
            Visit visuell.art ↗
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section--visuell {
  background: var(--bg-raise);
  border-block: 1px solid var(--line);
}

.visuell__stage {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}

.visuell__panel {
  position: relative;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--line);
  background:
    radial-gradient(120% 100% at 20% 0%, rgba(216, 255, 62, 0.07), transparent 55%),
    var(--bg);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
}

.visuell__panel-label {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
}

.visuell__bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  width: 100%;
  height: 45%;
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

.visuell__copy {
  display: grid;
  gap: 1.5rem;
  justify-items: start;
}

.visuell__copy p {
  color: var(--muted);
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.65;
  max-width: 30rem;
}

.visuell__specs {
  list-style: none;
  width: 100%;
  border-top: 1px solid var(--line);
}

.visuell__specs li {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
  letter-spacing: 0.02em;
  text-transform: none;
}

.visuell__specs li span:last-child {
  color: var(--ink);
  text-align: right;
}

@media (max-width: 860px) {
  .visuell__stage {
    grid-template-columns: 1fr;
  }
}
</style>
