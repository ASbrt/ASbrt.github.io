<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteNav from './components/SiteNav.vue'
import HeroSection from './sections/HeroSection.vue'
import AboutSection from './sections/AboutSection.vue'
import ProjectsSection from './sections/ProjectsSection.vue'
import VisuellSection from './sections/VisuellSection.vue'
import ReadingCircleSection from './sections/ReadingCircleSection.vue'
import CvSection from './sections/CvSection.vue'
import SiteFooter from './components/SiteFooter.vue'

gsap.registerPlugin(ScrollTrigger)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

// smooth-scroll all in-page anchor links instead of jumping
const onAnchorClick = (e: MouseEvent) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
  if (!a || !lenis) return
  const hash = a.getAttribute('href')
  if (!hash || hash === '#') return
  const el = document.querySelector(hash)
  if (!el) return
  e.preventDefault()
  lenis.scrollTo(el as HTMLElement, { duration: 1.4 })
}

onMounted(() => {
  if (reducedMotion) return // .rv elements are shown via CSS; native scroll & no parallax

  // inertia scroll driving ScrollTrigger
  lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis!.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  document.addEventListener('click', onAnchorClick)

  // generic reveal-on-scroll
  gsap.utils.toArray<HTMLElement>('.rv').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: parseFloat(el.dataset.rvDelay ?? '0'),
      scrollTrigger: { trigger: el, start: 'top 88%' },
    })
  })

  // parallax drift for tagged media blocks
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax ?? '0.15')
    gsap.fromTo(
      el,
      { yPercent: -speed * 100 },
      {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onAnchorClick)
})</script>

<template>
  <SiteNav />
  <main id="top">
    <HeroSection />
    <AboutSection />
    <ProjectsSection />
    <VisuellSection />
    <ReadingCircleSection />
    <CvSection />
  </main>
  <SiteFooter />
</template>
