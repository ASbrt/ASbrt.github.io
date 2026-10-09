<template>
  <section id="reading-circle" class="section">
    <div class="container">
      <div class="rc__grid">
        <h2 class="display-lg rv">
          Money, the<br />State &amp; the<br /><span class="accent">Economy</span>
        </h2>

        <div class="rc__body">
          <p class="rv">
            A critical reading circle at my university. We read classic and
            contemporary texts on where money comes from, what states do with
            it, and how the monetary system shapes the economy. From commodity
            theories to modern monetary theory and beyond.
          </p>
          <p class="rv">
            Session materials and readings are hosted here. If your institution
            blocks GitHub Pages assets or you'd like the raw archive, mirrored
            copies live on Cloudflare R2.
          </p>

          <div class="rc__sessions">
            <div class="rc__session rv">
              <span class="mono">Session 01 · TBA</span>
              <span class="rc__session-title">What is money, actually?</span>
              <span class="mono rc__session-status">Materials forthcoming</span>
            </div>
            <div class="rc__session rv">
              <span class="mono">Session 02 · TBA</span>
              <span class="rc__session-title">The state as issuer</span>
              <span class="mono rc__session-status">Materials forthcoming</span>
            </div>
            <div class="rc__session rc__session--soon rv">
              <span class="mono">More sessions</span>
              <span class="rc__session-title">Announced per semester</span>
              <span class="mono rc__session-status">TBA</span>
            </div>
          </div>

          <div class="rc__cta rv">
            <a
              class="btn"
              href="mailto:aaronsiebert@protonmail.com?subject=Reading%20circle%3A%20Money%2C%20the%20State%20and%20the%20Economy"
            >
              Get in touch to join
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rc__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.rc__body {
  display: grid;
  gap: 1.25rem;
  color: var(--muted);
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.65;
}

.rc__sessions {
  margin-top: 1rem;
  border-top: 1px solid var(--line);
}

.rc__session {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: baseline;
  padding: 1rem 0;
  border-bottom: 1px solid var(--line);
}

.rc__session-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--ink);
}

.rc__session--soon .rc__session-title {
  color: var(--muted);
}

.rc__cta {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 860px) {
  .rc__grid {
    grid-template-columns: 1fr;
  }
  .rc__session {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
