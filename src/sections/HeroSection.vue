<script setup lang="ts">
import ShaderHero from '../components/ShaderHero.vue'
</script>

<template>
  <section class="hero">
    <ShaderHero />
    <div class="hero__content container">
      <p class="mono hero__kicker rv">Data Science × Economics × Live Visuals — Germany</p>
      <h1 class="display-xl">
        <span class="rv" data-rv-delay="0.05">Aaron</span>
        <span class="rv hero__line2" data-rv-delay="0.15">Siebert<em class="accent">.</em></span>
      </h1>
      <div class="hero__meta rv" data-rv-delay="0.3">
        <p class="hero__tag">
          Data scientist in training, economist by foundation, building
          <a class="ulink accent" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell</a>
          — a video-sampling groovebox for live visuals.
        </p>
        <div class="hero__cta">
          <a class="btn btn--solid" href="#projects">View Projects</a>
          <a class="btn" href="#reading-circle">Reading Circle</a>
        </div>
      </div>
    </div>
    <div class="hero__scroll mono" aria-hidden="true">
      <span>Scroll</span>
      <span class="hero__scroll-line"></span>
    </div>
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

.hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-bottom: clamp(3rem, 8vh, 6rem);
  padding-top: 6rem;
}

.hero__kicker {
  margin-bottom: 1.25rem;
}

.hero__line2 {
  display: block;
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-top: clamp(1.5rem, 4vh, 3rem);
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
}

.hero__tag {
  max-width: 34rem;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.55;
  color: var(--muted);
}

.hero__cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero__scroll {
  position: absolute;
  right: var(--gutter);
  bottom: clamp(3rem, 8vh, 6rem);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  writing-mode: vertical-rl;
}

.hero__scroll-line {
  width: 1px;
  height: 4.5rem;
  background: var(--line);
  position: relative;
  overflow: hidden;
}

.hero__scroll-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  animation: drip 2.2s var(--ease-out) infinite;
}

@keyframes drip {
  0% { transform: translateY(-100%); }
  60% { transform: translateY(100%); }
  100% { transform: translateY(100%); }
}

@media (max-width: 720px) {
  .hero__scroll {
    display: none;
  }
}
</style>
