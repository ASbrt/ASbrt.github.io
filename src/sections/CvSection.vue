<template>
  <section id="cv" class="section section--cv">
    <div class="container">
      <p class="section-tag mono"><span class="idx">05</span> CV</p>

      <div class="cv__grid">
        <h2 class="display-lg rv">Curriculum<br /><span class="accent">Vitae</span></h2>

        <div class="cv__body">
          <div class="cv__block rv">
            <p class="mono cv__block-label">Education</p>
            <ul>
              <li>
                <span class="mono">20XX — now</span>
                <div>
                  <strong>M.Sc. Data Science</strong>
                  <span>University — Germany</span>
                </div>
              </li>
              <li>
                <span class="mono">20XX — 20XX</span>
                <div>
                  <strong>B.A./B.Sc. Economics</strong>
                  <span>University — Germany</span>
                </div>
              </li>
            </ul>
          </div>

          <div class="cv__block rv">
            <p class="mono cv__block-label">Selected Projects</p>
            <ul>
              <li>
                <span class="mono">now</span>
                <div>
                  <strong>visuell</strong>
                  <span>Founder — video-sampling groovebox for live visuals</span>
                </div>
              </li>
              <li>
                <span class="mono">now</span>
                <div>
                  <strong>scoutbot</strong>
                  <span>Game engine for the card game Scout, built as a platform for ML experiments</span>
                </div>
              </li>
            </ul>
          </div>

          <p class="mono cv__placeholder rv">
            Placeholder content — send me your real CV and I'll typeset it here
            (and add a downloadable PDF).
          </p>
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
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
}

.cv__placeholder {
  border: 1px dashed var(--line);
  padding: 1rem 1.25rem;
  line-height: 1.6;
  text-transform: none;
  letter-spacing: 0.02em;
}

@media (max-width: 860px) {
  .cv__grid {
    grid-template-columns: 1fr;
  }
}
</style>
