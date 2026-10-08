// Fetches public repos at build time (works locally and in GitHub Actions,
// where GITHUB_TOKEN is available). Falls back to the committed repos.json
// if the API is unreachable, so the site never renders an empty list.

import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/repos.json')
const EXCLUDE = ['ASbrt.github.io', 'mining-classification']

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'asbrt-site-build' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function main() {
  const res = await fetch('https://api.github.com/users/ASbrt/repos?sort=pushed&per_page=10', { headers })
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`)
  const repos = (await res.json())
    .filter((r) => !r.fork && !EXCLUDE.includes(r.name))
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stargazers_count: r.stargazers_count,
      html_url: r.html_url,
    }))
  writeFileSync(out, JSON.stringify(repos, null, 2))
  console.log(`repos.json: wrote ${repos.length} repos`)
}

main().catch((err) => {
  if (existsSync(out)) {
    console.warn(`repos.json: API failed (${err.message}), keeping existing file`)
  } else {
    console.warn(`repos.json: API failed (${err.message}), writing empty fallback`)
    writeFileSync(out, '[]')
  }
})
