<script setup lang="ts">
import repos from '../data/repos.json'
</script>

<template>
  <section id="projects" class="section">
    <div class="container">
      <h2 class="display-lg rv">Projects<span class="accent">/</span>Repos</h2>

      <a
        class="featured rv"
        href="https://github.com/simone-mazzoli/air_pollution"
        target="_blank"
        rel="noopener"
      >
        <span class="mono featured__tag">Deep Learning · Course Project</span>
        <span class="featured__title">
          Mapping Air Pollution and Exposure Inequality in Germany from
          Satellite Imagery
        </span>
        <span class="featured__desc">
          Predicting annual PM2.5 concentrations from monitoring stations,
          satellite, and context data, with geographic cross-validation and
          Kreis-level socioeconomic analysis. Deep learning course project,
          M.Sc. Social and Economic Data Science, University of Konstanz.
        </span>
        <span class="mono featured__cta">View repository ↗</span>
      </a>

      <ul class="projects__list">
        <li v-for="(r, i) in repos" :key="r.name" class="projects__row rv" :data-rv-delay="(i % 4) * 0.06">
          <a :href="r.html_url" target="_blank" rel="noopener" class="projects__link">
            <span class="projects__name">{{ r.name }}</span>
            <span class="projects__desc">{{ r.description ?? 'No description yet' }}</span>
            <span class="mono projects__lang">{{ r.language ?? '·' }}</span>
            <span class="mono projects__arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>

      <p class="mono projects__more rv">
        Full archive on
        <a class="ulink" href="https://github.com/ASbrt" target="_blank" rel="noopener">github.com/ASbrt</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.projects__list {
  list-style: none;
  margin-top: clamp(2rem, 5vh, 3.5rem);
  border-top: 1px solid var(--line);
}

.projects__row {
  border-bottom: 1px solid var(--line);
}

.projects__link {
  display: grid;
  grid-template-columns: minmax(10rem, 1.1fr) 2fr auto auto;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 1.4rem 0;
  transition: padding-left 0.35s var(--ease-out);
}

.projects__link:hover {
  padding-left: 1rem;
}

.projects__link:hover .projects__name {
  color: var(--accent);
}

.projects__name {
  font-weight: 700;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  letter-spacing: -0.01em;
  transition: color 0.25s var(--ease-out);
  overflow-wrap: anywhere;
}

.projects__desc {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.projects__arrow {
  color: var(--muted);
  font-size: 1.1rem;
  transition: color 0.25s var(--ease-out), transform 0.35s var(--ease-out);
}

.projects__link:hover .projects__arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}

.projects__more {
  margin-top: 1.5rem;
}

.featured {
  display: grid;
  gap: 1rem;
  margin-top: clamp(2rem, 5vh, 3.5rem);
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid var(--line);
  background:
    radial-gradient(120% 140% at 0% 0%, rgba(216, 255, 62, 0.06), transparent 55%),
    var(--bg-raise);
  transition: border-color 0.3s var(--ease-out);
}

.featured:hover {
  border-color: var(--accent);
}

.featured:hover .featured__title {
  color: var(--accent);
}

.featured__tag {
  color: var(--accent);
}

.featured__title {
  font-weight: 750;
  font-size: clamp(1.4rem, 2.6vw, 2.1rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  transition: color 0.25s var(--ease-out);
}

.featured__desc {
  color: var(--muted);
  line-height: 1.6;
  max-width: 44rem;
}

.featured__cta {
  color: var(--muted);
}

.featured:hover .featured__cta {
  color: var(--accent);
}

@media (max-width: 860px) {
  .projects__link {
    grid-template-columns: 1fr auto;
  }
  .projects__desc {
    grid-column: 1 / -1;
    order: 3;
  }
}
</style>
