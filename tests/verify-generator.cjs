/** Run from the kit root after TypeScript compilation; see README. */
const assert = require('node:assert/strict')
const {generateComposition,parseSeed,parseFamily,FAMILIES} = require('../.test-build/generator.js')
const {DEFAULT_SCULPTURE} = require('../.test-build/config.js')

assert.equal(parseSeed('0'),0)
assert.equal(parseSeed('4294967295'),4294967295)
for(const value of [null,'','-1','4294967296','1.3',' 23','12x'])assert.equal(parseSeed(value),null)
assert.equal(parseFamily('bogus'),'all')
assert.deepEqual(FAMILIES,['folded','interwoven','macro'])
const quality = JSON.stringify(DEFAULT_SCULPTURE.quality)
const families = new Set()
const fingerprints = new Set()
for(let seed=0;seed<1000;seed++){
  const a=generateComposition({seed})
  const b=generateComposition({seed})
  assert.deepEqual(a,b,`non-deterministic ${seed}`)
  families.add(a.family)
  fingerprints.add(JSON.stringify(a.config))
  assert.ok(a.config.ribbons.length>=1 && a.config.ribbons.length<=3)
  assert.equal(JSON.stringify(a.config.quality),quality)
  assert.ok(a.config.framing.zoom>=1 && a.config.framing.zoom<=5)
  assert.ok(a.config.framing.x>.5 && a.config.framing.x<.8)
  assert.ok(a.config.framing.y>.6 && a.config.framing.y<.9)
  for(const r of a.config.ribbons){
    assert.equal(r.spine.length,13)
    assert.ok(r.folds.length>=2 && r.folds.length<=4)
    assert.ok(r.accents.length>=1 && r.accents.length<=4)
    assert.ok(r.width>0 && r.opacity>0 && r.contours>=12)
  }
  const numbers = JSON.stringify(a.config)
  assert.ok(!numbers.includes('null'),`NaN serialized to null in ${seed}`)
}
assert.deepEqual([...families].sort(),[...FAMILIES].sort())
assert.ok(fingerprints.size===1000,`only ${fingerprints.size} unique configs`)
// Shared seed URLs carry an explicit family; fresh loads draw it from the rng.
// Both paths must produce the identical composition for the same seed.
for(const seed of [0,1,42,72,482719,126513267,4294967295]){
  const fresh=generateComposition({seed})
  assert.deepEqual(generateComposition({seed,family:fresh.family}),fresh,`explicit-family replay diverges for seed ${seed}`)
}
for(const family of FAMILIES){
  const x=generateComposition({seed:72,family})
  assert.equal(x.family,family)
}
const base=generateComposition({seed:3}).config
const before=JSON.stringify(base)
const lock=generateComposition({seed:499,family:'macro',base,locks:{geometry:true,framing:true,accents:true,motion:true}}).config
assert.deepEqual(lock.ribbons,base.ribbons)
assert.deepEqual(lock.framing,base.framing)
assert.deepEqual(lock.motion,base.motion)
assert.equal(lock.look.accentIntensity,base.look.accentIntensity)
assert.equal(JSON.stringify(base),before,'modified the base config')
const geomLock=generateComposition({seed:499,base,locks:{geometry:true}}).config
assert.equal(geomLock.ribbons.length,base.ribbons.length)
assert.deepEqual(geomLock.ribbons.map(r=>r.spine),base.ribbons.map(r=>r.spine))
assert.notDeepEqual(geomLock.ribbons.map(r=>r.accents),base.ribbons.map(r=>r.accents))
console.log('PASS: 1,000 deterministic seeds, 3 families, bounded configs, locked generation, seed parsing')
