<template>
  <section id="about" class="section">
    <div class="container">
      <div class="about__grid">
        <div class="about__left">
          <h2 class="display-lg rv">About<span class="accent">.</span></h2>
        </div>

        <div class="about__body">
          <p class="rv">
            I'm a master's student in Social and Economic Data Science at the
            University of Konstanz, where I also work as a research assistant
            in the
            <a
              class="ulink"
              href="https://www.polver.uni-konstanz.de/research-group-international-politics-and-conflict/"
              target="_blank"
              rel="noopener"
              >International Politics and Conflict Research</a
            >
            group of Prof. Nina von Uexkull. My current work involves
            geospatial data processing and building data pipelines for
            research on natural disasters and conflict. I also tutor
            introductory computing for social science students. Before moving
            to Konstanz, I studied Social Economics with a focus on Economics
            at the University of Hamburg, where I also tutored empirical
            methods, econometrics, and regression analysis.
          </p>
          <p class="rv">
            My interests span economics, computational social science, and
            machine learning. I'm particularly interested in macroeconomics,
            environmental economics, and how economic and political systems
            shape the world around us. For my bachelor's thesis, I explored
            economic and environmental dynamics through
            <strong>stock-flow-consistent agent-based modeling</strong>. This
            interest in understanding economic systems also motivates a
            <a class="ulink" href="#reading-circle">reading circle</a> I'm
            organizing on money, the state, and the economy. On the
            computational side, I've increasingly been drawn toward machine
            learning, complex systems, and the behavior and coordination of
            interacting AI agents.
          </p>
          <p class="rv">
            Away from research I build things. My current project is
            <a class="ulink" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell</a>,
            a video-sampling groovebox for live visuals and a 2024 Music Worx
            Development Award winner, born from making music and wanting VJ
            tools that work more like instruments. I also enjoy designing and
            building websites and interactive applications, including this
            one.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: clamp(2rem, 6vw, 6rem);
  align-items: start;
}

.about__left {
  position: sticky;
  top: 6rem;
}

.about__body {
  display: grid;
  gap: 1.75rem;
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.7;
  color: var(--muted);
}

.about__body p {
  max-width: 40rem;
}

.about__body strong {
  color: var(--ink);
  font-weight: 650;
}

@media (max-width: 860px) {
  .about__grid {
    grid-template-columns: 1fr;
  }
  .about__left {
    position: static;
  }
}
</style>
