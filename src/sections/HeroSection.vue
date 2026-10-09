<script setup lang="ts">
import ShaderHero from '../components/ShaderHero.vue'
</script>

<template>
  <section class="hero">
    <ShaderHero />
    <div class="hero__content">
      <h1 class="display-xl">
        <span class="rv" data-rv-delay="0.05">Aaron</span>
        <span class="rv hero__line2" data-rv-delay="0.15">Siebert<em class="accent">.</em></span>
      </h1>
      <div class="hero__meta rv" data-rv-delay="0.3">
        <p class="hero__tag">
          My work moves between economics, data science and computational
          modeling. Away from research, I build creative software and things
          for the web.
        </p>
        <div class="hero__cta">
          <a class="btn btn--solid" href="#projects">View Projects</a>
          <a class="btn" href="#about">About Me</a>
        </div>
      </div>
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

/* readability scrim — anchors text against the shader */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to top,
    rgba(10, 10, 11, 0.92) 0%,
    rgba(10, 10, 11, 0.55) 30%,
    rgba(10, 10, 11, 0) 60%
  );
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-inline: var(--gutter);
  padding-bottom: clamp(3rem, 8vh, 6rem);
  padding-top: 6rem;
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
  border-top: 1px solid rgba(242, 242, 239, 0.22);
}

.hero__tag {
  max-width: 56rem;
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  line-height: 1.5;
  color: #e2e2dd;
  text-shadow: 0 1px 12px rgba(10, 10, 11, 0.6);
}

.hero__cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

</style>
