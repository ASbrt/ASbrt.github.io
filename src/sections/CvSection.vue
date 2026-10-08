<template>
  <section id="cv" class="section section--cv">
    <div class="container">
      <div class="cv__grid">
        <div class="cv__intro">
          <h2 class="display-lg rv">Curriculum<br /><span class="accent">Vitae</span></h2>
          <a class="btn rv" href="/cv.pdf" target="_blank" rel="noopener">Download PDF ↗</a>
        </div>

        <div class="cv__body">
          <div class="cv__block rv">
            <p class="mono cv__block-label">Education</p>
            <ul>
              <li>
                <span class="mono">2025 —</span>
                <div>
                  <strong>M.Sc. Social and Economic Data Science</strong>
                  <span>University of Konstanz</span>
                </div>
              </li>
              <li>
                <span class="mono">2021 — 2025</span>
                <div>
                  <strong>B.A. Social Economics, focus: Economics</strong>
                  <span>University of Hamburg — final grade 1.7</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="cv__block rv">
            <p class="mono cv__block-label">Experience</p>
            <ul>
              <li>
                <span class="mono">2026 —</span>
                <div>
                  <strong>Student Research Assistant</strong>
                  <span>International Politics and Conflict Research, University of Konstanz</span>
                </div>
              </li>
              <li>
                <span class="mono">2026 —</span>
                <div>
                  <strong>Tutor — ICSS</strong>
                  <span>Course by David Garcia, University of Konstanz</span>
                </div>
              </li>
              <li>
                <span class="mono">11/2026 —</span>
                <div>
                  <strong>Student Research Assistant</strong>
                  <span>Research project with David Garcia, University of Konstanz</span>
                </div>
              </li>
              <li>
                <span class="mono">2024 — 2025</span>
                <div>
                  <strong>Student Research Assistant</strong>
                  <span>Chair of Economics, esp. Empirical Economic Research, University of Hamburg</span>
                </div>
              </li>
              <li>
                <span class="mono">2023 — 2026</span>
                <div>
                  <strong>Student Research Assistant</strong>
                  <span>Chair of Sociology, esp. Empirical Social Research, University of Hamburg</span>
                </div>
              </li>
              <li>
                <span class="mono">2023 — 2025</span>
                <div>
                  <strong>Tutor</strong>
                  <span>Introduction to Empirical Methods, Econometrics, Regression Analysis — University of Hamburg</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="cv__block rv">
            <p class="mono cv__block-label">Skills</p>
            <ul class="cv__skills">
              <li><span class="mono">Programming</span><span>Python, R, SQL / PostgreSQL, Rust (learning)</span></li>
              <li><span class="mono">Machine Learning</span><span>PyTorch, scikit-learn, Hugging Face</span></li>
              <li><span class="mono">Data Analysis</span><span>pandas, NumPy, Jupyter</span></li>
              <li><span class="mono">Statistical Methods</span><span>econometrics, regression, time-series analysis</span></li>
              <li><span class="mono">Tools</span><span>Git, GitHub, Supabase, Docker</span></li>
              <li><span class="mono">Additional</span><span>geospatial data analysis, web app development (Vue.js)</span></li>
            </ul>
          </div>

          <div class="cv__block rv">
            <p class="mono cv__block-label">Other</p>
            <ul>
              <li>
                <span class="mono">2024</span>
                <div>
                  <strong>Development Award Music Worx</strong>
                  <span>Hamburger Kreativgesellschaft</span>
                </div>
              </li>
              <li>
                <span class="mono">—</span>
                <div>
                  <strong>Co-Founder, Tiny Room eG</strong>
                  <span>Hamburg</span>
                </div>
              </li>
              <li>
                <span class="mono">Lang</span>
                <div>
                  <strong>German (native), English (fluent)</strong>
                  <span></span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section--cv {
  background: var(--bg-raise);
  border-block: 1px solid var(--line);
}

.cv__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.cv__intro {
  position: sticky;
  top: 6rem;
  display: grid;
  gap: 2rem;
  justify-items: start;
}

.cv__body {
  display: grid;
  gap: 2.5rem;
}

.cv__block-label {
  color: var(--accent);
  margin-bottom: 1rem;
}

.cv__block ul {
  list-style: none;
  border-top: 1px solid var(--line);
}

.cv__block li {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}

.cv__block li > span {
  padding-top: 0.2rem;
}

.cv__block li div {
  display: grid;
  gap: 0.2rem;
}

.cv__block strong {
  font-size: 1.1rem;
}

.cv__block li div span {
  color: var(--muted);
  line-height: 1.5;
}

.cv__skills li {
  align-items: baseline;
}

.cv__skills li > span:last-child {
  color: var(--ink);
}

@media (max-width: 860px) {
  .cv__grid {
    grid-template-columns: 1fr;
  }
  .cv__intro {
    position: static;
  }
}
</style>
