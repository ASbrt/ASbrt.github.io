// Variant: Sculptural Flow
//
// Not contour bands of a noise field — actual streamlines. A divergence-free
// curl field (plus a large-scale meandering directional bias) is integrated
// on the CPU into polylines, seeded by importance sampling so lines cluster
// into compressed bands and dissolve away in expanded negative space.
//
// Art direction is explicit:
//  - a curved channel of compression sweeps across the upper field
//  - the lower-left stays empty behind the hero text
//  - a small subset of lines is "luminous": acid-lime, additive, closer to
//    the camera, brightening where a ridge field runs high
//  - per-line z placement gives subtle depth, faded in the vertex shader
//
// Motion is a slow advected-noise displacement in the shared line vertex
// shader — the drawing stays composed while the filaments breathe.

import * as THREE from 'three'
import {
  ACCENT_COLOR,
  INK_COLOR,
  Noise2D,
  calmBasin,
  clamp01,
  makeLineMaterial,
  makeRng,
  smoothstep,
  type HeroVariantDef,
  type VariantHandle,
} from './shared'

export const sculpturalFlow: HeroVariantDef = {
  id: 'flow',
  label: 'Flow',
  create(ctx): VariantHandle {
    const group = new THREE.Group()
    ctx.scene.add(group)

    const noise = new Noise2D(20261009)
    const rng = makeRng(987654321)

    let meshes: { mesh: THREE.LineSegments; geometry: THREE.BufferGeometry; material: THREE.ShaderMaterial }[] = []
    let disposed = false
    let resizeTimer = 0

    /* ——— field definitions (uv space, y up) ——— */

    // Authored composition: curved channel of compression across the upper
    // field, meandering like a river valley seen from above.
    function channel(u: number, v: number): number {
      const cy = 0.64 + 0.17 * Math.sin(u * 3.1 + 1.1) + 0.06 * Math.sin(u * 7.3 + 4.0)
      const d = v - cy
      return Math.exp(-(d * d) / (2 * 0.085 * 0.085))
    }

    // Compression in [0,1]: where lines are born, dense, and bright.
    // Expansion (low c) is negative space — no seeds, lines dissolve there.
    function compression(u: number, v: number): number {
      const c0 = noise.fbm(u * 1.25 + 3.1, v * 1.25 + 8.7, 4)
      let c = c0 * 0.42 + channel(u, v) * 0.95
      c *= 1 - 0.9 * calmBasin(u, v)
      return clamp01(c)
    }

    // Ridge field: picks where luminous filaments burn bright.
    function ridge(u: number, v: number, c: number): number {
      const r0 = noise.fbm(u * 2.3 + 31.4, v * 2.3 + 17.9, 3)
      return smoothstep(0.6, 0.88, c * 0.55 + r0 * 0.55)
    }

    /* ——— streamline generation ——— */

    function build() {
      if (disposed) return
      for (const m of meshes) {
        group.remove(m.mesh)
        m.geometry.dispose()
        m.material.dispose()
      }
      meshes = []

      const W = ctx.worldSize.x
      const H = ctx.worldSize.y
      const mobile = ctx.isMobile
      const maxLines = mobile ? 320 : 620

      // flow potential → curl velocity, plus meandering directional bias
      const potential = (x: number, y: number) => noise.fbm(x * 0.85 + 7.7, y * 0.85 + 3.1, 4)
      const vel = new Float64Array(2)
      function velocity(x: number, y: number) {
        const e = 0.02
        const dpx = (potential(x + e, y) - potential(x - e, y)) / (2 * e)
        const dpy = (potential(x, y + e) - potential(x, y - e)) / (2 * e)
        const a = (noise.fbm(x * 0.45 + 13.7, y * 0.45 + 4.2, 3) - 0.5) * Math.PI * 2.0
        vel[0] = dpy * 1.7 + Math.cos(a) * 0.95
        vel[1] = -dpx * 1.7 + Math.sin(a) * 0.95
      }

      const ink = { pos: [] as number[], col: [] as number[], a: [] as number[] }
      const lum = { pos: [] as number[], col: [] as number[], a: [] as number[] }

      const gridX = mobile ? 72 : 110
      const gridY = Math.max(28, Math.round((gridX * H) / W))

      let count = 0
      seeding: for (let iy = 0; iy <= gridY; iy++) {
        for (let ix = 0; ix <= gridX; ix++) {
          const u = (ix + rng()) / gridX
          const v = (iy + rng()) / gridY
          const c = compression(u, v)
          if (rng() > smoothstep(0.14, 0.9, c)) continue
          if (++count > maxLines) break seeding

          const seedRidge = ridge(u, v, c)
          const lineHash = rng()
          const luminous = lineHash < 0.06 + seedRidge * 0.55
          const zHash = rng()
          const zBase = -0.85 * (0.2 + 0.8 * zHash) + (luminous ? 0.3 : 0)

          const steps = 34 + Math.floor(c * 95)
          const hStep = 0.0115
          const x0 = (u - 0.5) * W
          const y0 = (v - 0.5) * H

          // forward + partial backward pass so lines read as filaments,
          // not comet trails
          const total = steps + Math.floor(steps * 0.35)
          const pts: { x: number; y: number; c: number; r: number }[] = []
          let px = x0
          let py = y0
          let alive = true
          for (let s = 0; s < total; s++) {
            const uu = px / W + 0.5
            const vv = py / H + 0.5
            if (uu < -0.06 || uu > 1.06 || vv < -0.06 || vv > 1.06) break
            const cc = compression(uu, vv)
            if (s > 2 && cc < 0.05) {
              alive = false
              break
            }
            const rr = ridge(uu, vv, cc)
            pts.push({ x: px, y: py, c: cc, r: rr })
            velocity(px, py)
            const len = Math.hypot(vel[0], vel[1]) || 1
            px += (vel[0] / len) * hStep
            py += (vel[1] / len) * hStep
          }
          if (pts.length < 8) continue

          const target = luminous ? lum : ink
          const n = pts.length
          for (let i = 0; i < n - 1; i++) {
            const p0 = pts[i]
            const p1 = pts[i + 1]
            const t0 = i / (n - 1)
            const t1 = (i + 1) / (n - 1)
            // taper both ends; lines that dissolved early fade at the tip
            const taper0 = smoothstep(0, 0.12, t0) * smoothstep(0, 0.12, 1 - t0)
            const taper1 = smoothstep(0, 0.12, t1) * smoothstep(0, 0.12, 1 - t1)

            for (const [p, taper] of [
              [p0, taper0],
              [p1, taper1],
            ] as const) {
              const z = zBase + p.r * 0.5
              target.pos.push(p.x, p.y, z)
              if (luminous) {
                const bright = 0.7 + p.r * 0.6
                target.col.push(
                  ACCENT_COLOR.r * bright,
                  ACCENT_COLOR.g * bright,
                  ACCENT_COLOR.b * bright,
                )
                target.a.push((0.3 + p.r * 0.55) * taper)
              } else {
                const bright = 0.16 + p.c * 0.36
                target.col.push(INK_COLOR.r * bright, INK_COLOR.g * bright, INK_COLOR.b * bright)
                target.a.push((0.06 + p.c * 0.3) * taper)
              }
            }
          }
          void alive
        }
      }

      const makeMesh = (
        data: typeof ink,
        opts: { additive: boolean; amp: number; order: number },
      ) => {
        if (data.pos.length === 0) return
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.pos, 3))
        geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(data.col, 3))
        geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(data.a, 1))
        const material = makeLineMaterial({ additive: opts.additive, amp: opts.amp })
        material.uniforms.u_worldSize.value.copy(ctx.worldSize)
        const mesh = new THREE.LineSegments(geometry, material)
        mesh.frustumCulled = false
        mesh.renderOrder = opts.order
        group.add(mesh)
        meshes.push({ mesh, geometry, material })
      }

      makeMesh(ink, { additive: false, amp: 0.042, order: 1 })
      makeMesh(lum, { additive: true, amp: 0.03, order: 2 })
    }

    build()

    return {
      update(_dt: number, t: number) {
        for (const m of meshes) {
          m.material.uniforms.u_time.value = t
          m.material.uniforms.u_mouse.value.copy(ctx.mouse)
        }
      },
      resize() {
        // streamlines are composed for a given aspect — rebuild, debounced
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(build, 250)
      },
      dispose() {
        disposed = true
        window.clearTimeout(resizeTimer)
        for (const m of meshes) {
          group.remove(m.mesh)
          m.geometry.dispose()
          m.material.dispose()
        }
        meshes = []
        ctx.scene.remove(group)
      },
    }
  },
}
