/** Run from the repo root after TypeScript compilation; see README of the v4 kit.
 * Covers: determinism, versioned seed compatibility, family-draw alignment,
 * visibility scoring, seeded fragmentation, accent modes, rotation behavior,
 * locks, and bounded framing retries. */
const assert = require('node:assert/strict')
const {createHash} = require('node:crypto')
const {
  generateComposition, parseSeed, parseFamily, parseVersion, FAMILIES,
  scoreCompositionVisibility, MAX_FRAMING_CANDIDATES,
  VISIBILITY_ACCEPT, GENERATOR_VERSION,
} = require('../.test-build/generator.js')
const {DEFAULT_SCULPTURE} = require('../.test-build/config.js')

const fp = (c) => createHash('sha256').update(JSON.stringify(c)).digest('hex').slice(0, 16)

// --- parsing ---
assert.equal(parseSeed('0'), 0)
assert.equal(parseSeed('4294967295'), 4294967295)
for (const value of [null, '', '-1', '4294967296', '1.3', ' 23', '12x']) assert.equal(parseSeed(value), null)
assert.equal(parseFamily('bogus'), 'all')
assert.deepEqual(FAMILIES, ['folded', 'interwoven', 'macro'])
assert.equal(parseVersion('2'), 2)
assert.equal(parseVersion('1'), 1)
assert.equal(parseVersion(null), 1) // unversioned share links = frozen v4
assert.equal(parseVersion('9'), 1)

// --- version compatibility: v1 output frozen by anchors ---
const V1_ANCHORS = [
  [0, null, '9deee2e588cfdb54'],
  [42, null, '4e87c99385f4e09a'],
  [482719, null, '65a5dda15e3e7448'],
  [123456789, 'macro', '7d3f83f60894fcbd'],
  [777, 'interwoven', '0c573b459a941e33'],
]
for (const [seed, family, expected] of V1_ANCHORS) {
  const c = generateComposition(family ? {seed, family, version: 1} : {seed, version: 1})
  assert.equal(fp(c.config), expected, `v1 anchor drifted for seed ${seed}`)
}

// --- family-draw alignment: explicit family must replay implicit generation ---
for (const seed of [0, 1, 42, 72, 482719, 126513267, 4294967295]) {
  for (const version of [1, 2]) {
    const fresh = generateComposition({seed, version})
    assert.deepEqual(generateComposition({seed, family: fresh.family, version}), fresh,
      `v${version} explicit-family replay diverges for seed ${seed}`)
  }
}

// --- v1 and v2 differ (v2 is a refinement, not a relabel) ---
assert.notEqual(fp(generateComposition({seed: 42, version: 1}).config), fp(generateComposition({seed: 42, version: 2}).config))

// --- main 1,000-seed suite, per version ---
const quality = JSON.stringify(DEFAULT_SCULPTURE.quality)
const t0 = Date.now()
for (const version of [1, 2]) {
  const families = new Set()
  const fingerprints = new Set()
  let rotationOn = 0
  for (let seed = 0; seed < 1000; seed++) {
    const a = generateComposition({seed, version})
    const b = generateComposition({seed, version})
    assert.deepEqual(a, b, `v${version} non-deterministic ${seed}`)
    families.add(a.family)
    fingerprints.add(JSON.stringify(a.config))
    assert.ok(a.config.ribbons.length >= 1 && a.config.ribbons.length <= 3)
    assert.equal(JSON.stringify(a.config.quality), quality)
    assert.ok(a.config.framing.zoom >= 1 && a.config.framing.zoom <= 5)
    assert.ok(a.config.framing.x > .4 && a.config.framing.x < .95)
    assert.ok(a.config.framing.y > .5 && a.config.framing.y < .95)
    for (const r of a.config.ribbons) {
      assert.equal(r.spine.length, 13)
      assert.ok(r.folds.length >= 2 && r.folds.length <= 4)
      assert.ok(r.accents.length >= 1 && r.accents.length <= 4)
      assert.ok(r.width > 0 && r.opacity > 0 && r.contours >= 12)
    }
    const numbers = JSON.stringify(a.config)
    assert.ok(!numbers.includes('null'), `NaN serialized to null in ${seed}`)
    if (version === 1) {
      // Legacy behavior preserved: unseeded fragmentation, patch accents, no Z drift.
      assert.equal(a.config.look.fragmentSeed, 0)
      assert.equal(a.config.look.accentMode, 'patches')
      assert.equal(a.config.motion.rotationZ, 0)
      assert.ok(a.config.motion.mode === 'both' || a.config.motion.mode === 'shadows')
    } else {
      // v4.1 invariants.
      assert.ok(a.config.look.fragmentSeed > 0)
      assert.ok(['scattered', 'edges', 'mixed'].includes(a.config.look.accentMode))
      assert.ok(a.config.look.accentDensity >= .1 && a.config.look.accentDensity <= .34)
      assert.ok(a.config.look.accentSegLen >= .05 && a.config.look.accentSegLen <= .22)
      assert.ok(a.config.look.edgeProbability >= .18 && a.config.look.edgeProbability <= .5)
      assert.ok(a.config.look.edgeLength >= .25 && a.config.look.edgeLength <= .8)
      assert.ok(a.config.motion.rotationX >= 4 && a.config.motion.rotationX <= 8)
      assert.ok(a.config.motion.rotationY >= 6 && a.config.motion.rotationY <= 12)
      assert.ok(a.config.motion.rotationZ >= 2 && a.config.motion.rotationZ <= 6)
      if (a.config.motion.mode === 'rotate' || a.config.motion.mode === 'both') rotationOn++
    }
  }
  assert.deepEqual([...families].sort(), [...FAMILIES].sort())
  assert.ok(fingerprints.size === 1000, `v${version}: only ${fingerprints.size} unique configs`)
  if (version === 2) {
    const share = rotationOn / 1000
    assert.ok(share >= .80 && share <= .93, `rotation prevalence ${share} outside 85-90% target band`)
  }
}
console.log(`1000 seeds x 2 versions scored+generated in ${Date.now() - t0} ms`)
assert.ok(Date.now() - t0 < 30000, 'generation too slow')
assert.ok(Number.isInteger(MAX_FRAMING_CANDIDATES) && MAX_FRAMING_CANDIDATES >= 1 && MAX_FRAMING_CANDIDATES <= 16,
  'framing search must be bounded')

// --- seeded fragmentation: stable per seed, genuinely different across seeds ---
{
  const salts = new Set()
  for (let seed = 0; seed < 200; seed++) salts.add(generateComposition({seed}).config.look.fragmentSeed)
  assert.ok(salts.size >= 195, 'fragment salts should differ across seeds')
  assert.equal(generateComposition({seed: 42}).config.look.fragmentSeed, generateComposition({seed: 42}).config.look.fragmentSeed)
}

// --- accent modes appear in varied combinations across seeds ---
{
  const modes = new Set()
  for (let seed = 0; seed < 200; seed++) modes.add(generateComposition({seed}).config.look.accentMode)
  assert.deepEqual([...modes].sort(), ['edges', 'mixed', 'scattered'])
}

// --- visibility: accepted compositions are never near-empty, at desktop AND
// mobile aspects, at the extremes of their intended rotation range ---
{
  let worstScore = Infinity, worstVisible = Infinity, worstCoverage = Infinity
  for (let seed = 0; seed < 300; seed++) {
    const m = scoreCompositionVisibility(generateComposition({seed}).config)
    worstScore = Math.min(worstScore, m.score)
    worstVisible = Math.min(worstVisible, m.visibleFrac)
    worstCoverage = Math.min(worstCoverage, m.coverage)
  }
  assert.ok(worstVisible >= 0.09, `near-empty composition survives: visibleFrac ${worstVisible}`)
  assert.ok(worstCoverage >= 0.05, `fragmented visibility survives: coverage ${worstCoverage}`)
  assert.ok(worstScore >= VISIBILITY_ACCEPT - 0.10, `worst score ${worstScore} far below accept threshold`)
}

// --- locks (regression from v4 kit, now on the default v2 path) ---
for (const family of FAMILIES) {
  const x = generateComposition({seed: 72, family})
  assert.equal(x.family, family)
}
const base = generateComposition({seed: 3}).config
const before = JSON.stringify(base)
const lock = generateComposition({seed: 499, family: 'macro', base, locks: {geometry: true, framing: true, accents: true, motion: true}}).config
assert.deepEqual(lock.ribbons, base.ribbons)
assert.deepEqual(lock.framing, base.framing)
assert.deepEqual(lock.motion, base.motion)
assert.equal(lock.look.accentIntensity, base.look.accentIntensity)
assert.equal(lock.look.accentMode, base.look.accentMode)
assert.equal(JSON.stringify(base), before, 'modified the base config')
const geomLock = generateComposition({seed: 499, base, locks: {geometry: true}}).config
assert.equal(geomLock.ribbons.length, base.ribbons.length)
assert.deepEqual(geomLock.ribbons.map(r => r.spine), base.ribbons.map(r => r.spine))
assert.notDeepEqual(geomLock.ribbons.map(r => r.accents), base.ribbons.map(r => r.accents))

console.log('PASS: determinism, v1 anchors, family-draw alignment, versioned replay,')
console.log('      seeded fragmentation, accent modes, rotation bounds + prevalence,')
console.log('      visibility floor (desktop+mobile, rotation extremes), locks, bounded retries')
