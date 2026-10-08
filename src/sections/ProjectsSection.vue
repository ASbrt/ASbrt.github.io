<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Repo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  fork: boolean
}

const repos = ref<Repo[]>([])
const failed = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/users/ASbrt/repos?sort=pushed&per_page=8')
    if (!res.ok) throw new Error()
    repos.value = (await res.json()).filter((r: Repo) => !r.fork)
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <section id="projects" class="section">
    <div class="container">
      <h2 class="display-lg rv">Projects<span class="accent">/</span>Repos</h2>

      <p v-if="failed" class="mono projects__note rv">
        Live GitHub data unavailable — visit
        <a class="ulink" href="https://github.com/ASbrt" target="_blank" rel="noopener">github.com/ASbrt</a>.
      </p>

      <ul v-else class="projects__list">
        <li v-for="(r, i) in repos" :key="r.name" class="projects__row rv" :data-rv-delay="(i % 4) * 0.06">
          <a :href="r.html_url" target="_blank" rel="noopener" class="projects__link">
            <span class="projects__name">{{ r.name }}</span>
            <span class="projects__desc">{{ r.description ?? '—' }}</span>
            <span class="mono projects__lang">{{ r.language ?? '·' }}</span>
            <span class="mono projects__arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.projects__note {
  margin-top: 2rem;
}

.projects__list {
  list-style: none;
  margin-top: clamp(2rem, 5vh, 3.5rem);
  border-top: 1px solid var(--line);
}

.projects__row {
  border-bottom: 1px solid var(--line);
}

.projects__link {
  display: grid;
  grid-template-columns: minmax(10rem, 1.1fr) 2fr auto auto;
  align-items: center;
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 1.4rem 0;
  transition: padding-left 0.35s var(--ease-out);
}

.projects__link:hover {
  padding-left: 1rem;
}

.projects__link:hover .projects__name {
  color: var(--accent);
}

.projects__name {
  font-weight: 700;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  letter-spacing: -0.01em;
  transition: color 0.25s var(--ease-out);
  overflow-wrap: anywhere;
}

.projects__desc {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.projects__arrow {
  color: var(--muted);
  font-size: 1.1rem;
  transition: color 0.25s var(--ease-out), transform 0.35s var(--ease-out);
}

.projects__link:hover .projects__arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}

@media (max-width: 860px) {
  .projects__link {
    grid-template-columns: 1fr auto;
  }
  .projects__desc {
    grid-column: 1 / -1;
    order: 3;
  }
}
</style>
