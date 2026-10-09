<script setup lang="ts">
import { ref, watch } from 'vue'

const links = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#visuell', label: 'Visuell' },
  { href: '#reading-circle', label: 'Reading Circle' },
  { href: '#cv', label: 'CV' },
]

const open = ref(false)

// close the mobile menu whenever it becomes desktop-width again
watch(open, (v) => {
  document.documentElement.classList.toggle('nav-open', v)
})
</script>

<template>
  <header class="nav">
    <a class="nav__logo mono" href="#top" aria-label="Back to top" @click="open = false">
      AS<span class="accent">/</span>Siebert
    </a>

    <nav class="nav__links" aria-label="Sections">
      <a v-for="l in links" :key="l.href" class="nav__link mono ulink" :href="l.href">
        {{ l.label }}
      </a>
    </nav>

    <button
      class="nav__burger mono"
      :aria-expanded="open"
      aria-label="Toggle menu"
      @click="open = !open"
    >
      {{ open ? 'Close' : 'Menu' }}
    </button>
  </header>

  <transition name="menu">
    <nav v-if="open" class="nav__menu" aria-label="Mobile sections">
      <a
        v-for="l in links"
        :key="l.href"
        class="nav__menu-link display-lg"
        :href="l.href"
        @click="open = false"
      >
        {{ l.label }}
      </a>
    </nav>
  </transition>
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

.nav__burger {
  display: none;
  background: transparent;
  border: 1px solid rgba(242, 242, 239, 0.3);
  color: #fff;
  padding: 0.45rem 0.9rem;
  font-size: 0.7rem;
  cursor: pointer;
}

/* mobile menu overlay */
.nav__menu {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: var(--gutter);
  background: rgba(10, 10, 11, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav__menu-link {
  font-size: clamp(2.2rem, 9vw, 3.5rem);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  transition: color 0.2s var(--ease-out);
}

.nav__menu-link:hover {
  color: var(--accent);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.25s var(--ease-out);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .nav__links {
    display: none;
  }
  .nav__burger {
    display: block;
  }
}
</style>
