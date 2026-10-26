<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__contact">
          <h2 class="footer__heading">Get in touch</h2>
          <a class="ulink footer__email" href="mailto:aaronsiebert@protonmail.com">aaronsiebert@protonmail.com</a>
        </div>
        <div class="footer__links">
          <a class="ulink" href="https://github.com/ASbrt" target="_blank" rel="noopener">GitHub</a>
          <a class="ulink" href="https://www.visuell.art/" target="_blank" rel="noopener">visuell.art</a>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© {{ new Date().getFullYear() }} Aaron Siebert</span>
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
  margin-bottom: 3rem;
}

.footer__contact {
  min-width: 0;
}

.footer__heading {
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

.footer__email {
  overflow-wrap: anywhere;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer a {
  color: var(--muted);
  transition: color 0.25s var(--ease-out);
}

.footer .footer__email {
  color: var(--accent);
}

.footer a:hover,
.footer a:focus-visible {
  color: var(--accent);
}

.footer__bottom {
  color: var(--muted);
  font-size: 0.8rem;
}

@media (max-width: 560px) {
  .footer__top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
