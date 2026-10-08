<template>
  <section id="about" class="section">
    <div class="container">
      <div class="about__grid">
        <h2 class="display-lg rv">
          Hi, I'm<br />Aaron<span class="accent">.</span>
        </h2>
        <div class="about__body">
          <p class="rv">
            I'm a Research Assistant at the University of Konstanz and a
            student in the M.Sc. Social and Economic Data Science program. I
            hold a Bachelor's degree in Social Economics from the University of
            Hamburg, where I also worked as a tutor for empirical methods,
            econometrics, and regression analysis.
          </p>
          <p class="rv">
            My interests lie in environmental economics, conflict research, and
            computational social science — in particular how environmental and
            economic factors shape social and political dynamics, and how
            quantitative methods and agent-based modeling can be applied to the
            study of societal processes. Lately this has been pulling me toward
            machine learning and AI research; a run of ML courses last semester
            set the direction, and I'm currently going deeper — and learning
            Rust along the way.
          </p>
          <p class="rv">
            Away from research I build things: my current project is
            <a class="ulink accent" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell</a>,
            a video-sampling groovebox for live visuals — a Hamburg
            Kreativgesellschaft Development Award winner, born from making
            music and wanting VJ tools that work like instruments.
          </p>
          <ul class="about__facts mono">
            <li class="rv"><span>Focus</span><span>Data Science · Computational Social Science</span></li>
            <li class="rv"><span>Interests</span><span>ML &amp; AI Research · Environmental Economics · Conflict Research · ABM</span></li>
            <li class="rv"><span>Currently</span><span>Tutor &amp; Research Assistant, Konstanz</span></li>
            <li class="rv"><span>Also</span><span>Music · Live Visuals · Rust (learning)</span></li>
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
