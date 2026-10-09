<template>
  <section id="projects" class="section">
    <div class="container">
      <h2 class="display-lg rv">Selected Work<span class="accent">.</span></h2>

      <div class="work">
        <article class="work__item rv">
          <h3 class="work__title">
            Energy, Emissions and Economic Policy: An Agent-Based Approach to
            Simulating Systemic Shifts
          </h3>
          <p class="mono work__context">
            Bachelor's thesis · University of Hamburg · 2025
          </p>
          <p class="work__desc">
            Developed a prototype stock-flow-consistent agent-based
            macroeconomic model integrating production, banking, energy use,
            emissions and economic policy. The architecture includes
            carbon-pricing and public job-guarantee scenarios, with an
            emphasis on interactions between monetary, economic and ecological
            systems.
          </p>
          <div class="mono work__links">
            <a class="ulink" href="/thesis.pdf" target="_blank" rel="noopener">Thesis (PDF) ↗</a>
          </div>
        </article>

        <article class="work__item rv" data-rv-delay="0.06">
          <h3 class="work__title">
            Mapping Air Pollution and Exposure Inequality in Germany from
            Satellite Imagery
          </h3>
          <p class="mono work__context">
            Course project, Deep Learning for Social Scientists · M.Sc. SEDS,
            University of Konstanz
          </p>
          <p class="work__desc">
            Predicting annual PM2.5 concentrations from monitoring stations,
            satellite and context data, with geographic cross-validation and
            Kreis-level socioeconomic analysis. With Lisanne Dolleman, David
            Marasek and Simone Mazzoli.
          </p>
          <div class="mono work__links">
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

        <article class="work__item rv" data-rv-delay="0.12">
          <h3 class="work__title">
            Institutional Coordination under Interdependence
          </h3>
          <p class="mono work__context">
            Final paper, Dynamic Social Behavior seminar · University of
            Konstanz
          </p>
          <p class="work__desc">
            An agent-based simulation of how exchange protocols interact with
            behavioral heterogeneity when coordination capacity is scarce,
            including a tabular baseline planner as a reference strategy.
          </p>
          <div class="mono work__links">
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

      <p class="mono work__more rv">
        <a class="ulink" href="https://github.com/ASbrt" target="_blank" rel="noopener">Other experiments and code on GitHub ↗</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.work {
  margin-top: clamp(2rem, 5vh, 3.5rem);
  border-top: 1px solid var(--line);
}

.work__item {
  display: grid;
  gap: 1rem;
  padding: clamp(1.75rem, 4vw, 3rem) 0;
  border-bottom: 1px solid var(--line);
}

.work__title {
  font-weight: 750;
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  max-width: 44rem;
  transition: color 0.25s var(--ease-out);
}

.work__item:hover .work__title {
  color: var(--accent);
}

.work__context {
  text-transform: none;
  letter-spacing: 0.03em;
  color: var(--muted);
}

.work__desc {
  color: var(--muted);
  line-height: 1.65;
  font-size: 1.02rem;
  max-width: 44rem;
}

.work__links {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.25rem;
}

.work__more {
  margin-top: 1.75rem;
}
</style>
