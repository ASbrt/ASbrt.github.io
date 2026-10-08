<script setup lang="ts">
const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#visuell', label: 'Visuell' },
  { href: '#cv', label: 'CV' },
]
</script>

<template>
  <header class="nav">
    <a class="nav__logo mono" href="#top" aria-label="Back to top">
      AS<span class="accent">/</span>Siebert
    </a>
    <nav class="nav__links" aria-label="Sections">
      <a v-for="l in links" :key="l.href" class="nav__link mono ulink" :href="l.href">
        {{ l.label }}
      </a>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--gutter);
  color: #fff;
  background: linear-gradient(to bottom, rgba(10, 10, 11, 0.75), transparent);
}

.nav__logo {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
}

.nav__links {
  display: flex;
  gap: clamp(1rem, 2.5vw, 2.25rem);
}

.nav__link {
  color: #fff;
  font-size: 0.7rem;
}

@media (max-width: 720px) {
  .nav__links {
    display: none;
  }
}
</style>
