// Variant: Emergent Network
//
// A real spatial network: nodes live in uv space and evolve under soft
// forces — springs toward slowly drifting cluster anchors, local repulsion,
// a gentle noise wander, and a keep-out basin behind the hero text.
// Edges are sparse (max degree 4, distance-gated), fade in and out as the
// geometry changes, and brightness pulses travel through them. Every few
// seconds a "bridge" briefly connects two clusters, pulling them slightly
// toward each other before dissolving.
//
// Rendered as THREE.Points (soft additive sprites; a few hubs are acid-lime)
// plus THREE.LineSegments for edges. The simulation runs in uv space and is
// mapped to world coordinates only when writing buffers, so resizes are free.

import * as THREE from 'three'
import {
  ACCENT_COLOR,
  INK_COLOR,
  Noise2D,
  calmBasin,
  makeLineMaterial,
  makeRng,
  type HeroVariantDef,
  type VariantHandle,
} from './shared'

const MAX_EDGES_PER_NODE = 4

interface Node {
  u: number
  v: number
  vu: number
  vv: number
  anchor: number // -1 = free floater
  hub: boolean
}

interface Edge {
  a: number
  b: number
  alpha: number
  target: number
  lime: boolean
}

interface Bridge {
  a: number
  b: number
  t: number
  life: number
}

export const emergentNetwork: HeroVariantDef = {
  id: 'network',
  label: 'Network',
  create(ctx): VariantHandle {
    const group = new THREE.Group()
    ctx.scene.add(group)

    const noise = new Noise2D(1123581321)
    const rng = makeRng(42424242)
    const mobile = ctx.isMobile

    const N = mobile ? 84 : 130
    const ANCHORS = 4

    /* ——— anchors: slowly drifting cluster homes, biased upper/right ——— */

    const anchorHomes: { u: number; v: number }[] = []
    const anchorSeed: { ax: number; ay: number; w1: number; w2: number; p1: number; p2: number }[] = []
    const homeUV = [
      [0.64, 0.7],
      [0.86, 0.5],
      [0.42, 0.64],
      [0.72, 0.86],
    ]
    for (let i = 0; i < ANCHORS; i++) {
      anchorHomes.push({
        u: homeUV[i][0] + (rng() - 0.5) * 0.08,
        v: homeUV[i][1] + (rng() - 0.5) * 0.08,
      })
      anchorSeed.push({
        ax: 0.035 + rng() * 0.03,
        ay: 0.035 + rng() * 0.03,
        w1: (Math.PI * 2) / (22 + rng() * 18),
        w2: (Math.PI * 2) / (26 + rng() * 18),
        p1: rng() * Math.PI * 2,
        p2: rng() * Math.PI * 2,
      })
    }

    const anchorPos = anchorHomes.map(() => ({ u: 0.5, v: 0.5 }))

    function updateAnchors(t: number) {
      for (let i = 0; i < ANCHORS; i++) {
        const s = anchorSeed[i]
        anchorPos[i].u = anchorHomes[i].u + Math.sin(t * s.w1 + s.p1) * s.ax
        anchorPos[i].v = anchorHomes[i].v + Math.sin(t * s.w2 + s.p2) * s.ay
      }
    }

    /* ——— nodes ——— */

    const nodes: Node[] = []
    for (let i = 0; i < N; i++) {
      const assigned = rng() < 0.85
      const anchor = assigned ? Math.floor(rng() * ANCHORS) : -1
      const home = anchor >= 0 ? anchorHomes[anchor] : { u: 0.5 + (rng() - 0.5) * 0.7, v: 0.55 + (rng() - 0.5) * 0.6 }
      nodes.push({
        u: home.u + (rng() - 0.5) * 0.09,
        v: home.v + (rng() - 0.5) * 0.09,
        vu: 0,
        vv: 0,
        anchor,
        hub: false,
      })
    }

    // hubs: the two nodes nearest each anchor
    for (let k = 0; k < ANCHORS; k++) {
      const dist = nodes
        .map((n, i) => ({ i, d: Math.hypot(n.u - anchorHomes[k].u, n.v - anchorHomes[k].v) }))
        .filter((e) => nodes[e.i].anchor === k)
        .sort((x, y) => x.d - y.d)
      for (const e of dist.slice(0, 2)) nodes[e.i].hub = true
    }

    /* ——— buffers ——— */

    const MAX_SEGMENTS = N * 2

    const pointGeo = new THREE.BufferGeometry()
    const pointPos = new Float32Array(N * 3)
    const pointSize = new Float32Array(N)
    const pointLime = new Float32Array(N)
    const pointAlpha = new Float32Array(N)
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPos, 3).setUsage(THREE.DynamicDrawUsage))
    pointGeo.setAttribute('aSize', new THREE.BufferAttribute(pointSize, 1).setUsage(THREE.DynamicDrawUsage))
    pointGeo.setAttribute('aLime', new THREE.BufferAttribute(pointLime, 1).setUsage(THREE.DynamicDrawUsage))
    pointGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pointAlpha, 1).setUsage(THREE.DynamicDrawUsage))

    const pointMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform float u_time;
        uniform float u_px;
        attribute float aSize;
        attribute float aLime;
        attribute float aAlpha;
        varying float vLime;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float pulse = 1.0 + 0.15 * sin(u_time * 1.3 + position.x * 17.0);
          gl_PointSize = aSize * u_px * pulse * (140.0 / -mv.z);
          vLime = aLime;
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vLime;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = pow(smoothstep(0.5, 0.0, d), 1.6);
          vec3 col = mix(vec3(${INK_COLOR.r}, ${INK_COLOR.g}, ${INK_COLOR.b}), vec3(${ACCENT_COLOR.r}, ${ACCENT_COLOR.g}, ${ACCENT_COLOR.b}), vLime);
          gl_FragColor = vec4(col, a * vAlpha);
        }
      `,
      uniforms: {
        u_time: { value: 0 },
        u_px: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(pointGeo, pointMat)
    points.frustumCulled = false
    points.renderOrder = 3
    group.add(points)

    const lineGeo = new THREE.BufferGeometry()
    const linePos = new Float32Array(MAX_SEGMENTS * 2 * 3)
    const lineCol = new Float32Array(MAX_SEGMENTS * 2 * 3)
    const lineA = new Float32Array(MAX_SEGMENTS * 2)
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage))
    lineGeo.setAttribute('aColor', new THREE.BufferAttribute(lineCol, 3).setUsage(THREE.DynamicDrawUsage))
    lineGeo.setAttribute('aAlpha', new THREE.BufferAttribute(lineA, 1).setUsage(THREE.DynamicDrawUsage))
    const lineMat = makeLineMaterial({ additive: false, amp: 0.005 })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    lines.frustumCulled = false
    lines.renderOrder = 1
    group.add(lines)

    const bridgeGeo = new THREE.BufferGeometry()
    const bridgePos = new Float32Array(4 * 3)
    const bridgeCol = new Float32Array(4 * 3)
    const bridgeA = new Float32Array(4)
    bridgeGeo.setAttribute('position', new THREE.BufferAttribute(bridgePos, 3).setUsage(THREE.DynamicDrawUsage))
    bridgeGeo.setAttribute('aColor', new THREE.BufferAttribute(bridgeCol, 3).setUsage(THREE.DynamicDrawUsage))
    bridgeGeo.setAttribute('aAlpha', new THREE.BufferAttribute(bridgeA, 1).setUsage(THREE.DynamicDrawUsage))
    const bridgeMat = makeLineMaterial({ additive: true, amp: 0.002 })
    const bridgeLines = new THREE.LineSegments(bridgeGeo, bridgeMat)
    bridgeLines.frustumCulled = false
    bridgeLines.renderOrder = 2
    group.add(bridgeLines)

    /* ——— simulation ——— */

    const edges = new Map<string, Edge>()
    const bridges: Bridge[] = []
    let nextBridgeAt = 4 + rng() * 4
    let simTime = 0

    function edgeKey(a: number, b: number) {
      return a < b ? `${a}_${b}` : `${b}_${a}`
    }

    function step(dt: number) {
      simTime += dt
      updateAnchors(simTime)

      // bridges lifecycle
      nextBridgeAt -= dt
      if (nextBridgeAt <= 0 && bridges.length < 2) {
        nextBridgeAt = 5 + rng() * 5
        const i = Math.floor(rng() * ANCHORS)
        let j = Math.floor(rng() * ANCHORS)
        if (j === i) j = (j + 1) % ANCHORS
        const membersI: number[] = []
        const membersJ: number[] = []
        nodes.forEach((n, idx) => {
          if (n.anchor === i) membersI.push(idx)
          if (n.anchor === j) membersJ.push(idx)
        })
        if (membersI.length && membersJ.length) {
          const a = membersI[Math.floor(rng() * membersI.length)]
          const b = membersJ[Math.floor(rng() * membersJ.length)]
          bridges.push({ a, b, t: 0, life: 4.5 })
        }
      }
      for (let i = bridges.length - 1; i >= 0; i--) {
        bridges[i].t += dt
        if (bridges[i].t >= bridges[i].life) bridges.splice(i, 1)
      }

      // node dynamics
      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        let fu = 0
        let fv = 0

        // spring toward anchor (floaters lean toward their nearest)
        let ai = n.anchor
        if (ai < 0) {
          let best = 1e9
          for (let k = 0; k < ANCHORS; k++) {
            const d = Math.hypot(n.u - anchorPos[k].u, n.v - anchorPos[k].v)
            if (d < best) {
              best = d
              ai = k
            }
          }
        }
        const spring = n.anchor >= 0 ? 2.2 : 0.5
        fu += (anchorPos[ai].u - n.u) * spring
        fv += (anchorPos[ai].v - n.v) * spring

        // local repulsion
        for (let j = 0; j < N; j++) {
          if (j === i) continue
          const dx = n.u - nodes[j].u
          const dy = n.v - nodes[j].v
          const d = Math.hypot(dx, dy)
          if (d < 0.05 && d > 1e-6) {
            const f = ((0.05 - d) / 0.05) * 3.0
            fu += (dx / d) * f
            fv += (dy / d) * f
          }
        }

        // gentle wander
        const wa = noise.fbm(n.u * 3 + 40, n.v * 3 + 9, 2) * Math.PI * 4 + simTime * 0.1
        fu += Math.cos(wa) * 0.22
        fv += Math.sin(wa) * 0.22

        // keep the hero text basin empty
        const bd = Math.hypot((n.u - 0.3) * 1.0, (n.v - 0.16) * 1.3)
        if (bd < 0.4) {
          const f = (0.4 - bd) * 4
          fu += ((n.u - 0.3) / Math.max(bd, 1e-4)) * f
          fv += (((n.v - 0.16) * 1.3) / Math.max(bd, 1e-4)) * f
        }

        // soft walls
        const m = 0.05
        if (n.u < m) fu += (m - n.u) * 8
        if (n.u > 1 - m) fu -= (n.u - (1 - m)) * 8
        if (n.v < m) fv += (m - n.v) * 8
        if (n.v > 1 - m) fv -= (n.v - (1 - m)) * 8

        n.vu = (n.vu + fu * dt) * Math.exp(-1.6 * dt)
        n.vv = (n.vv + fv * dt) * Math.exp(-1.6 * dt)

        // restrained motion — cap speed
        const sp = Math.hypot(n.vu, n.vv)
        const maxSp = n.hub ? 0.028 : 0.05
        if (sp > maxSp) {
          n.vu = (n.vu / sp) * maxSp
          n.vv = (n.vv / sp) * maxSp
        }
        n.u += n.vu * dt
        n.v += n.vv * dt
        n.u = Math.min(1.02, Math.max(-0.02, n.u))
        n.v = Math.min(1.02, Math.max(-0.02, n.v))
      }

      // bridge pull — clusters lean toward each other while bridged
      for (const b of bridges) {
        const na = nodes[b.a]
        const nb = nodes[b.b]
        const dx = nb.u - na.u
        const dy = nb.v - na.v
        const d = Math.hypot(dx, dy) || 1
        const pull = 0.5 * dt
        na.vu += (dx / d) * pull
        na.vv += (dy / d) * pull
        nb.vu -= (dx / d) * pull
        nb.vv -= (dy / d) * pull
      }

      rebuildEdges(dt)
    }

    function rebuildEdges(dt: number) {
      // sparse meaningful connections: distance-gated, degree-capped
      const cand: { j: number; d: number }[][] = Array.from({ length: N }, () => [])
      const R = 0.2
      for (let i = 0; i < N; i++) {
        const ni = nodes[i]
        for (let j = i + 1; j < N; j++) {
          const nj = nodes[j]
          const d = Math.hypot(ni.u - nj.u, ni.v - nj.v)
          if (d < R) {
            cand[i].push({ j, d })
            cand[j].push({ j: i, d })
          }
        }
      }

      const next = new Map<string, Edge>()
      for (let i = 0; i < N; i++) {
        cand[i].sort((x, y) => x.d - y.d)
        let degree = 0
        for (const c of cand[i]) {
          if (degree >= MAX_EDGES_PER_NODE) break
          if (c.j < i) continue // dedupe: only emit from lower index
          const key = edgeKey(i, c.j)
          const existing = edges.get(key)
          const lime = nodes[i].hub || nodes[c.j].hub
          const target = Math.min(0.65, (1 - c.d / R) * (lime ? 0.6 : 0.5))
          next.set(key, existing ?? { a: i, b: c.j, alpha: 0, target, lime })
          next.get(key)!.target = target
          next.get(key)!.lime = lime
          degree++
        }
      }

      edges.clear()
      for (const [key, e] of next) {
        e.alpha += (e.target - e.alpha) * Math.min(1, dt * 2.5)
        if (e.alpha > 0.015) edges.set(key, e)
      }
    }

    /* ——— buffer writing ——— */

    function writeBuffers() {
      const W = ctx.worldSize.x
      const H = ctx.worldSize.y

      for (let i = 0; i < N; i++) {
        const n = nodes[i]
        const basin = calmBasin(n.u, n.v)
        pointPos[i * 3] = (n.u - 0.5) * W
        pointPos[i * 3 + 1] = (n.v - 0.5) * H
        pointPos[i * 3 + 2] = n.hub ? 0.2 : -0.2
        const energy = Math.min(1, Math.hypot(n.vu, n.vv) / 0.05)
        pointSize[i] = (n.hub ? 0.24 : 0.11) * (1 + energy * 0.4)
        pointLime[i] = n.hub ? 1 : 0
        pointAlpha[i] = (n.hub ? 0.95 : 0.68 + energy * 0.25) * (1 - basin * 0.85)
      }
      pointGeo.attributes.position.needsUpdate = true
      pointGeo.attributes.aSize.needsUpdate = true
      pointGeo.attributes.aLime.needsUpdate = true
      pointGeo.attributes.aAlpha.needsUpdate = true

      let seg = 0
      for (const e of edges.values()) {
        if (seg >= MAX_SEGMENTS) break
        const na = nodes[e.a]
        const nb = nodes[e.b]
        const bright = e.lime ? 0.7 : 0.5
        const cr = e.lime ? ACCENT_COLOR.r : INK_COLOR.r * bright
        const cg = e.lime ? ACCENT_COLOR.g : INK_COLOR.g * bright
        const cb = e.lime ? ACCENT_COLOR.b : INK_COLOR.b * bright
        const o = seg * 6
        linePos[o] = (na.u - 0.5) * W
        linePos[o + 1] = (na.v - 0.5) * H
        linePos[o + 2] = 0
        linePos[o + 3] = (nb.u - 0.5) * W
        linePos[o + 4] = (nb.v - 0.5) * H
        linePos[o + 5] = 0
        lineCol[o] = cr
        lineCol[o + 1] = cg
        lineCol[o + 2] = cb
        lineCol[o + 3] = cr
        lineCol[o + 4] = cg
        lineCol[o + 5] = cb
        lineA[seg * 2] = e.alpha
        lineA[seg * 2 + 1] = e.alpha
        seg++
      }
      lineGeo.setDrawRange(0, seg * 2)
      lineGeo.attributes.position.needsUpdate = true
      lineGeo.attributes.aColor.needsUpdate = true
      lineGeo.attributes.aAlpha.needsUpdate = true

      let bseg = 0
      for (const b of bridges) {
        if (bseg >= 2) break
        const env = Math.pow(Math.sin(Math.PI * Math.min(1, b.t / b.life)), 0.7)
        const na = nodes[b.a]
        const nb = nodes[b.b]
        const o = bseg * 6
        bridgePos[o] = (na.u - 0.5) * W
        bridgePos[o + 1] = (na.v - 0.5) * H
        bridgePos[o + 2] = 0.1
        bridgePos[o + 3] = (nb.u - 0.5) * W
        bridgePos[o + 4] = (nb.v - 0.5) * H
        bridgePos[o + 5] = 0.1
        for (let k = 0; k < 2; k++) {
          bridgeCol[o + k * 3] = ACCENT_COLOR.r
          bridgeCol[o + k * 3 + 1] = ACCENT_COLOR.g
          bridgeCol[o + k * 3 + 2] = ACCENT_COLOR.b
          bridgeA[bseg * 2 + k] = env * 0.55
        }
        bseg++
      }
      bridgeGeo.setDrawRange(0, bseg * 2)
      bridgeGeo.attributes.position.needsUpdate = true
      bridgeGeo.attributes.aColor.needsUpdate = true
      bridgeGeo.attributes.aAlpha.needsUpdate = true
    }

    // reduced motion: pre-roll the simulation to a settled, composed state
    if (ctx.reducedMotion) {
      for (let i = 0; i < 500; i++) step(1 / 30)
    } else {
      for (let i = 0; i < 60; i++) step(1 / 30)
    }
    writeBuffers()

    lineMat.uniforms.u_worldSize.value.copy(ctx.worldSize)
    bridgeMat.uniforms.u_worldSize.value.copy(ctx.worldSize)

    let disposed = false

    return {
      update(dt: number, t: number) {
        if (disposed) return
        step(Math.min(dt, 0.033))
        writeBuffers()
        pointMat.uniforms.u_time.value = t
        lineMat.uniforms.u_time.value = t
        bridgeMat.uniforms.u_time.value = t
        lineMat.uniforms.u_mouse.value.copy(ctx.mouse)
      },
      resize() {
        lineMat.uniforms.u_worldSize.value.copy(ctx.worldSize)
        bridgeMat.uniforms.u_worldSize.value.copy(ctx.worldSize)
        pointMat.uniforms.u_px.value = Math.min(
          window.devicePixelRatio,
          window.innerWidth < 720 ? 1.25 : 1.5,
        )
        writeBuffers()
      },
      dispose() {
        disposed = true
        pointGeo.dispose()
        pointMat.dispose()
        lineGeo.dispose()
        lineMat.dispose()
        bridgeGeo.dispose()
        bridgeMat.dispose()
        ctx.scene.remove(group)
      },
    }
  },
}
