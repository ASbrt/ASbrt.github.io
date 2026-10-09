<template>
  <section id="visuell" class="section section--visuell">
    <div class="container">
      <div class="visuell__grid">
        <figure class="visuell__media rv" data-parallax="0.05">
          <img
            src="../assets/visuell-app.jpg"
            alt="The visuell app: layered video engine, scenes, and step sequencer in the browser"
            loading="lazy"
          />
          <figcaption class="mono">
            The visuell engine in the browser: layers, scenes, and a step
            sequencer
          </figcaption>
        </figure>

        <div class="visuell__copy">
          <h2 class="display-lg rv">visuell<span class="accent">.</span></h2>
          <p class="visuell__sub display-lg rv" data-rv-delay="0.05">
            A video instrument for live visuals.
          </p>
          <p class="visuell__body rv" data-rv-delay="0.1">
            Visuell grew out of making music and wanting VJ tools that work
            more like instruments. It's a browser-based video-sampling
            groovebox for chopping, sequencing, and performing with moving
            images.
          </p>
          <p class="mono visuell__award rv" data-rv-delay="0.15">
            Music Worx Development Award 2024
          </p>
          <a
            class="btn btn--solid rv"
            data-rv-delay="0.2"
            href="https://www.visuell.art/"
            target="_blank"
            rel="noopener"
          >
            Explore visuell ↗
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* visuell's own brand accent, used sparingly inside this section */
.section--visuell {
  --accent: #f2ca00;
  background: var(--bg-raise);
  border-block: 1px solid var(--line);
}

.visuell__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}

/* media */
.visuell__media {
  position: relative;
  border: 1px solid var(--line);
  overflow: hidden;
  background: var(--bg);
}

.visuell__media img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.8s var(--ease-out);
}

.visuell__media:hover img {
  transform: scale(1.015);
}

.visuell__media figcaption {
  position: absolute;
  left: 1rem;
  bottom: 0.9rem;
  max-width: calc(100% - 2rem);
  padding: 0.35rem 0.65rem;
  background: rgba(10, 10, 11, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  text-transform: none;
  letter-spacing: 0.03em;
}

/* copy */
.visuell__copy {
  display: grid;
  gap: 1.4rem;
  justify-items: start;
}

.visuell__sub {
  font-weight: 650;
  font-size: clamp(1.3rem, 2.2vw, 1.9rem);
  line-height: 1.2;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--muted);
  margin-top: -0.5rem;
}

.visuell__body {
  color: var(--muted);
  font-size: clamp(1.05rem, 1.5vw, 1.2rem);
  line-height: 1.65;
  max-width: 30rem;
}

.visuell__award {
  color: var(--accent);
}

@media (max-width: 860px) {
  .visuell__grid {
    grid-template-columns: 1fr;
  }
}
</style>
