<script setup lang="ts">
import SiteFooter from '../components/SiteFooter.vue'
import { sessions } from '../data/readingCircle'

const materialsUrl = 'https://drive.google.com/drive/folders/15KXOs0CDFdKkOAXSNtsy3hSWxvNfwVAE?usp=sharing'
</script>

<template>
  <div class="rc-page">
    <header class="rc__header">
      <a class="rc__brand mono" href="/" aria-label="Back to portfolio home">
        <span class="accent">/</span>Siebert
      </a>
      <a class="rc__back mono ulink" href="/">← Portfolio</a>
    </header>

    <main>
      <section class="section rc__section">
        <div class="container">
          <div class="rc__grid">
            <div class="rc__heading">
              <h1 class="display-lg">
                Money, the<br />State and the<br /><span class="accent">Economy.</span>
              </h1>
            </div>

            <div class="rc__body">
              <p>
                How do modern economies work? What roles do money, financial
                institutions, governments and markets play in shaping economic
                outcomes? And how do economic structures interact with
                political decisions and social relations?
              </p>
              <p>
                This reading group at the University of Konstanz explores these questions through classic and
                contemporary texts in political economy. We compare different
                theoretical perspectives, assess their arguments and connect
                them to contemporary economic debates.
              </p>

              <div class="rc__sessions">
                <details v-for="session in sessions" :key="session.number" class="rc__session">
                  <summary class="rc__summary">
                    <span class="mono rc__number">Session {{ session.number }}</span>
                    <span class="rc__summary-text">
                      <span class="mono">{{ session.date }} · 17:30h</span>
                      <span class="rc__session-title">{{ session.title }}</span>
                      <span class="rc__session-subtitle">{{ session.subtitle }}</span>
                    </span>
                    <span class="rc__expand" aria-hidden="true">+</span>
                  </summary>

                  <div class="rc__readings">
                    <div>
                      <h2 class="mono rc__reading-label">Required reading</h2>
                      <ul>
                        <li v-for="reading in session.required" :key="reading">{{ reading }}</li>
                      </ul>
                    </div>
                    <div>
                      <h2 class="mono rc__reading-label">Optional reading</h2>
                      <ul>
                        <li v-for="reading in session.optional" :key="reading">{{ reading }}</li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>

              <div class="rc__participation">
                <h2 class="rc__participation-heading">Participation &amp; materials</h2>
                <p>
                  Each session combines a short introduction, discussion of the
                  required texts, and an application to a contemporary economic
                  question. Optional readings are available for further exploration.
                </p>
                <p>
                  The reading list is public. Participants receive access to a
                  restricted materials folder for texts that can be shared. Contact me for more details.
                </p>
                <div class="rc__actions">
                  <a
                    class="btn"
                    href="mailto:aaronsiebert@protonmail.com?subject=Reading%20group%3A%20Money%2C%20the%20State%20and%20the%20Economy"
                  >
                    Get in touch to join
                  </a>
                  <a
                    v-if="materialsUrl"
                    class="btn"
                    :href="materialsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Materials ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* Reuses the portfolio's global type, colour and spacing tokens. */
.rc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem var(--gutter);
  background: linear-gradient(to bottom, rgba(10, 10, 11, 0.75), transparent);
}

.rc__brand {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
}

.rc__back {
  color: var(--ink);
  font-size: 0.8rem;
}

.rc__section {
  padding-top: clamp(4rem, 11vh, 8rem);
}

.rc__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.rc__heading {
  position: sticky;
  top: 4rem;
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
  border-bottom: 1px solid var(--line);
}

.rc__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 1rem;
  padding: 1.25rem 0;
  cursor: pointer;
  list-style: none;
}

.rc__summary::-webkit-details-marker {
  display: none;
}

.rc__summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 5px;
}

.rc__number {
  white-space: nowrap;
}

.rc__summary-text {
  display: grid;
  gap: 0.25rem;
}

.rc__session-title {
  color: var(--ink);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
}

.rc__session-subtitle {
  font-size: 0.87rem;
  color: var(--muted);
}

.rc__expand {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 1.2rem;
  line-height: 1;
  transition: transform 0.2s var(--ease-out);
}

.rc__session[open] .rc__expand {
  transform: rotate(45deg);
}

.rc__readings {
  display: grid;
  gap: 1.25rem;
  padding: 0.25rem 0 1.5rem;
  font-size: 0.92rem;
  line-height: 1.6;
}

.rc__reading-label {
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.rc__readings ul {
  list-style: none;
  display: grid;
  gap: 0.65rem;
  padding-left: 1rem;
  border-left: 1px solid var(--line);
}

.rc__participation {
  display: grid;
  justify-items: start;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--line);
}

.rc__participation-heading {
  color: var(--ink);
  font-size: clamp(1.4rem, 2vw, 1.8rem);
}

.rc__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

@media (max-width: 860px) {
  .rc__grid {
    grid-template-columns: 1fr;
  }

  .rc__heading {
    position: static;
  }
}

@media (max-width: 560px) {
  .rc__summary {
    grid-template-columns: 1fr auto;
    gap: 0.4rem 1rem;
  }

  .rc__number {
    grid-column: 1;
  }

  .rc__summary-text {
    grid-column: 1;
    grid-row: 2;
  }

  .rc__expand {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
  }
}
</style>
