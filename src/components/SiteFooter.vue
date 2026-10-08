<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <p class="display-lg footer__cta">
          Let's build<br /><span class="accent">something.</span>
        </p>
        <div class="footer__links mono">
          <a class="ulink" href="https://github.com/ASbrt" target="_blank" rel="noopener">GitHub</a>
          <a class="ulink" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell.art</a>
          <!-- TODO: LinkedIn / email once you want them public -->
        </div>
      </div>
      <div class="footer__bottom mono">
        <span>© {{ new Date().getFullYear() }} Aaron Siebert</span>
        <span>Built by hand — Vue, Three.js, GLSL</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-block: clamp(3rem, 8vh, 5rem) 2rem;
}

.footer__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: clamp(3rem, 8vh, 5rem);
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-start;
}

.footer__links a {
  color: var(--muted);
  transition: color 0.25s var(--ease-out);
}

.footer__links a:hover {
  color: var(--accent);
}

.footer__bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1.5rem;
}
</style>
