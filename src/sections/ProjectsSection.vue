<script setup lang="ts">
import repos from '../data/repos.json'
</script>

<template>
  <section id="projects" class="section">
    <div class="container">
      <h2 class="display-lg rv">Projects<span class="accent">/</span>Papers</h2>

      <div class="papers">
        <article class="paper rv">
          <h3 class="paper__title">
            Mapping Air Pollution and Exposure Inequality in Germany from
            Satellite Imagery
          </h3>
          <p class="mono paper__context">
            Course project, Deep Learning for Social Scientists · M.Sc. SEDS,
            University of Konstanz
          </p>
          <p class="paper__desc">
            Predicting annual PM2.5 concentrations from monitoring stations,
            satellite and context data, with geographic cross-validation and
            Kreis-level socioeconomic analysis. With Lisanne Dolleman, David
            Marasek and Simone Mazzoli.
          </p>
          <div class="mono paper__links">
            <a class="ulink" href="https://github.com/simone-mazzoli/air_pollution" target="_blank" rel="noopener">Repository ↗</a>
            <a
              class="ulink"
              href="https://github.com/simone-mazzoli/air_pollution/blob/main/Air_pollution_report/build/main_merged.pdf"
              target="_blank"
              rel="noopener"
              >Paper (PDF) ↗</a
            >
          </div>
        </article>

        <article class="paper rv" data-rv-delay="0.08">
          <h3 class="paper__title">
            Institutional Coordination under Interdependence
          </h3>
          <p class="mono paper__context">
            Final paper, Dynamic Social Behavior seminar · University of
            Konstanz
          </p>
          <p class="paper__desc">
            An agent-based simulation of how exchange protocols interact with
            behavioral heterogeneity when coordination capacity is scarce,
            including a tabular baseline planner as a reference strategy.
          </p>
          <div class="mono paper__links">
            <a class="ulink" href="https://github.com/ASbrt/competition-under-interdependence" target="_blank" rel="noopener">Repository ↗</a>
            <a
              class="ulink"
              href="https://github.com/ASbrt/competition-under-interdependence/blob/main/submission/FinalPaper.pdf"
              target="_blank"
              rel="noopener"
              >Paper (PDF) ↗</a
            >
          </div>
        </article>
      </div>

      <p class="group-label mono rv">Additional projects</p>
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
/* papers */
.papers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  margin-top: clamp(2rem, 5vh, 3.5rem);
}

.paper {
  display: grid;
  gap: 1rem;
  align-content: start;
  background: var(--bg);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  transition: background 0.25s var(--ease-out);
}

.paper:hover {
  background: var(--bg-raise);
}

.paper:hover .paper__title {
  color: var(--accent);
}

.paper__title {
  font-weight: 750;
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  transition: color 0.25s var(--ease-out);
}

.paper__context {
  text-transform: none;
  letter-spacing: 0.03em;
}

.paper__desc {
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.98rem;
}

.paper__links {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.25rem;
}

.group-label {
  margin-top: clamp(2.5rem, 6vh, 4rem);
  margin-bottom: 1.25rem;
  color: var(--muted);
}

/* additional projects */
.projects__list {
  list-style: none;
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

@media (max-width: 860px) {
  .papers {
    grid-template-columns: 1fr;
  }
  .projects__link {
    grid-template-columns: 1fr auto;
  }
  .projects__desc {
    grid-column: 1 / -1;
    order: 3;
  }
}
</style>
