<template>
  <section id="about" class="section">
    <div class="container">
      <div class="about__grid">
        <div class="about__left">
          <h2 class="display-lg rv">
            Hi, I'm<br />Aaron<span class="accent">.</span>
          </h2>
          <p class="about__pull display-lg rv" data-rv-delay="0.1">
            I use data and models to understand
            <span class="accent">conflict and the environment</span>.
            Off the clock, I build tools and instruments.
          </p>
        </div>

        <div class="about__body">
          <p class="rv">
            I'm a Research Assistant in the
            <a
              class="ulink"
              href="https://www.polver.uni-konstanz.de/research-group-international-politics-and-conflict/"
              target="_blank"
              rel="noopener"
              >International Politics and Conflict Research</a
            >
            group of
            <a
              class="ulink"
              href="https://www.polver.uni-konstanz.de/research-group-international-politics-and-conflict/"
              target="_blank"
              rel="noopener"
              >Prof. Nina von Uexküll</a
            >
            at the University of Konstanz and a student in the M.Sc.
            Social and Economic Data Science program. I hold a Bachelor's
            degree in Social Economics from the University of Hamburg, where I
            also worked as a tutor for empirical methods, econometrics, and
            regression analysis.
          </p>
          <p class="rv">
            My interests lie in environmental economics, conflict research, and
            computational social science: in particular how environmental and
            economic factors shape social and political dynamics, and how
            quantitative methods and agent-based modeling can be applied to the
            study of societal processes. Lately this has been pulling me toward
            machine learning and AI research. A run of ML courses last semester
            set the direction, and I'm currently going deeper and learning Rust
            along the way.
          </p>
          <p class="rv">
            Away from research I build things. My current project is
            <a class="ulink" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell</a>,
            a video-sampling groovebox for live visuals and a Hamburg
            Kreativgesellschaft Development Award winner, born from making
            music and wanting VJ tools that work like instruments. I also
            design and build websites by hand, this one included: no template,
            just Vue, Three.js, and a custom shader.
          </p>

          <ul class="about__facts">
            <li class="rv"><span class="mono">Focus</span><span>Data Science · Computational Social Science</span></li>
            <li class="rv"><span class="mono">Interests</span><span>ML &amp; AI Research · ABM · Conflict Research</span></li>
            <li class="rv"><span class="mono">Currently</span><span>Tutor &amp; Research Assistant, Konstanz</span></li>
            <li class="rv"><span class="mono">Also</span><span>Music · Live Visuals · Web Design</span></li>
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

.about__left {
  position: sticky;
  top: 6rem;
  display: grid;
  gap: clamp(1.5rem, 4vh, 2.5rem);
}

.about__pull {
  font-weight: 650;
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-transform: none;
  color: var(--muted);
  padding-top: 1.5rem;
  border-top: 1px solid var(--line);
  max-width: 24rem;
}

.about__body {
  display: grid;
  gap: 1.5rem;
  font-size: clamp(1.05rem, 1.5vw, 1.3rem);
  line-height: 1.65;
  color: var(--muted);
}

.about__body p {
  max-width: 38rem;
}

.about__facts {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  margin-top: 0.5rem;
}

.about__facts li {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  background: var(--bg);
  padding: 1.1rem 1.25rem;
  font-size: 0.95rem;
  line-height: 1.45;
  transition: background 0.25s var(--ease-out);
}

.about__facts li:hover {
  background: var(--bg-raise);
}

.about__facts li:hover .mono {
  color: var(--accent);
}

.about__facts .mono {
  transition: color 0.25s var(--ease-out);
}

@media (max-width: 860px) {
  .about__grid {
    grid-template-columns: 1fr;
  }
  .about__left {
    position: static;
  }
  .about__facts {
    grid-template-columns: 1fr;
  }
}
</style>
