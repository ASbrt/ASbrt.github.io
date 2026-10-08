<template>
  <section id="visuell" class="section section--visuell">
    <div class="visuell__word" aria-hidden="true" data-parallax="0.08">VISUELL</div>

    <div class="container">
      <div class="visuell__grid">
        <div class="visuell__copy">
          <h2 class="display-lg rv">
            A groovebox that treats video like
            <span class="accent">samples</span>.
          </h2>
          <p class="rv">
            Visuell is a browser-based video instrument for live visuals.
            Sample clips from a built-in pool or your own files, cut them on a
            filmstrip, map them to pads, and perform live: scene sequencing,
            MIDI control, WebGL effects, and a recordable master output. No
            install, runs in the browser.
          </p>

          <ol class="visuell__steps">
            <li class="rv">
              <span class="mono">01</span>
              <strong>Sample</strong>
              <span>Grab clips and trim them on a filmstrip.</span>
            </li>
            <li class="rv">
              <span class="mono">02</span>
              <strong>Sequence</strong>
              <span>Arrange scenes and morph between them.</span>
            </li>
            <li class="rv">
              <span class="mono">03</span>
              <strong>Perform</strong>
              <span>Play pads live with MIDI, effects, and recording.</span>
            </li>
          </ol>

          <ul class="visuell__feats mono">
            <li class="rv">Live video inputs</li>
            <li class="rv">MIDI mapping + clock sync</li>
            <li class="rv">WebGL effects + procedural generators</li>
            <li class="rv">Master-output recording</li>
          </ul>

          <ul class="visuell__specs mono">
            <li class="rv"><span>Recognition</span><span>Development Award Music Worx 2024</span></li>
            <li class="rv"><span>Status</span><span>In development</span></li>
          </ul>

          <a class="btn btn--solid rv" href="https://www.visuell.art/" target="_blank" rel="noopener">
            Open visuell.art ↗
          </a>
        </div>

        <figure class="visuell__media rv" data-parallax="0.06">
          <img
            src="../assets/visuell-brand.jpg"
            alt="Visuell wordmark on an orange and blue abstract visual"
            loading="lazy"
          />
          <figcaption class="mono">Visuell / brand visual, visuell.art</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section--visuell {
  background: var(--bg-raise);
  border-block: 1px solid var(--line);
  overflow: hidden;
}

/* giant outlined wordmark bleeding off the left edge */
.visuell__word {
  font-weight: 800;
  font-size: clamp(5rem, 17vw, 17rem);
  line-height: 0.85;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1px var(--line);
  user-select: none;
  margin-bottom: clamp(2rem, 6vh, 4rem);
  transform: translateX(-0.05em);
}

.visuell__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: center;
}

.visuell__copy {
  display: grid;
  gap: 1.75rem;
  justify-items: start;
}

.visuell__copy > p {
  color: var(--muted);
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.65;
  max-width: 34rem;
}

/* how it works */
.visuell__steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  width: 100%;
}

.visuell__steps li {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  background: var(--bg-raise);
  padding: 1.1rem 1.25rem;
  transition: background 0.25s var(--ease-out);
}

.visuell__steps li:hover {
  background: var(--bg);
}

.visuell__steps li:hover .mono {
  color: var(--accent);
}

.visuell__steps strong {
  font-size: 1.05rem;
}

.visuell__steps li > span:last-child {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* real feature chips */
.visuell__feats {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.visuell__feats li {
  border: 1px solid var(--line);
  padding: 0.45rem 0.85rem;
  text-transform: none;
  letter-spacing: 0.03em;
  color: var(--muted);
  transition:
    border-color 0.25s var(--ease-out),
    color 0.25s var(--ease-out);
}

.visuell__feats li:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* specs */
.visuell__specs {
  list-style: none;
  width: 100%;
  border-top: 1px solid var(--line);
}

.visuell__specs li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
  letter-spacing: 0.02em;
  text-transform: none;
}

.visuell__specs li span:last-child {
  color: var(--ink);
  text-align: right;
}

/* brand visual */
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
  filter: saturate(0.85);
  transition: filter 0.4s var(--ease-out), transform 0.8s var(--ease-out);
}

.visuell__media:hover img {
  filter: saturate(1.15);
  transform: scale(1.02);
}

.visuell__media figcaption {
  position: absolute;
  left: 1rem;
  bottom: 0.9rem;
  padding: 0.3rem 0.6rem;
  background: rgba(10, 10, 11, 0.7);
  backdrop-filter: blur(4px);
}

@media (max-width: 860px) {
  .visuell__grid {
    grid-template-columns: 1fr;
  }
  .visuell__steps {
    grid-template-columns: 1fr;
  }
}
</style>
