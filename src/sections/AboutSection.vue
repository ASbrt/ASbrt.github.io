<template>
  <section id="about" class="section">
    <div class="container">
      <p class="section-tag mono"><span class="idx">01</span> About</p>
      <div class="about__grid">
        <h2 class="display-lg rv">
          Economics<br />→ Data<br /><span class="accent">→ Models</span>
        </h2>
        <div class="about__body">
          <p class="rv">
            I'm Aaron — a data science master's student with an economics
            background, and a long-standing habit of building things that
            shouldn't exist yet. I care about how quantitative methods change
            the way we see economic and social systems — and about making the
            tools themselves more intuitive and more alive.
          </p>
          <p class="rv">
            That habit pulled me from econometrics into machine learning, and
            eventually into creative technology: my current side project,
            <a class="ulink accent" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell</a>,
            is a video-sampling groovebox for live visuals. On the side I make
            music, which is where the groovebox came from.
          </p>
          <ul class="about__facts mono">
            <li class="rv"><span>Focus</span><span>ML · Data Science · Creative Tech</span></li>
            <li class="rv"><span>Base</span><span>Germany</span></li>
            <li class="rv"><span>Currently</span><span>M.Sc. Data Science</span></li>
            <li class="rv"><span>Also</span><span>Music · Reading circles</span></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.about__body {
  display: grid;
  gap: 1.5rem;
  font-size: clamp(1.05rem, 1.5vw, 1.3rem);
  line-height: 1.65;
  color: var(--muted);
}

.about__body p {
  max-width: 36rem;
}

.about__facts {
  list-style: none;
  margin-top: 1rem;
  border-top: 1px solid var(--line);
}

.about__facts li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
  text-transform: none;
  letter-spacing: 0.02em;
}

.about__facts li span:last-child {
  color: var(--ink);
  text-align: right;
}

@media (max-width: 860px) {
  .about__grid {
    grid-template-columns: 1fr;
  }
}
</style>
