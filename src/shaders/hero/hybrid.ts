// Variant C — Hybrid: smooth flow-field topology with a network that
// condenses inside it. The voronoi grid is advected by the same warped fbm
// field that drives faint background contours, so filaments appear to
// emerge from the flow where the field runs hot — smooth-flow regions and
// dense network regions transition softly into each other.

import { buildFragment } from './common'

const main = /* glsl */ `
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv;
  p.x *= aspect;
  p *= screenScale(u_res);

  float t = u_time * 0.05;

  // smooth topology field (shared by contours and network placement)
  vec2 q = vec2(fbm(p * 0.8 + t * 0.6), fbm(p * 0.8 - t * 0.45 + 4.7));
  vec2 r = vec2(
    fbm(p * 0.8 + 1.8 * q + vec2(1.7, 9.2) + t * 0.3),
    fbm(p * 0.8 + 1.8 * q + vec2(8.3, 2.8) - t * 0.25)
  );
  float field = fbm(p * 0.8 + 1.8 * r);

  // subtle mouse lens
  vec2 m = u_mouse;
  m.x *= aspect;
  float md = distance(p, m);
  field += 0.04 * exp(-md * 3.0) * sin(u_time * 0.5 - md * 8.0);

  // network advected by the field — filaments follow the topology
  vec2 grid = p * vec2(3.0, 2.3) + r * 1.1;
  vec2 cell;
  vec2 v = voro(grid, u_time * 0.5, cell);
  float f1 = v.x;
  float f2 = v.y;
  float cellRnd = hash12(cell);

  // emergence: the network condenses where the field runs hot,
  // and stays quiet behind the hero text
  float emerge = smoothstep(0.52, 0.78, field);
  emerge *= 1.0 - 0.7 * calmBasin(uv);

  float pulse = 0.5 + 0.5 * sin(u_time * 0.8 + cellRnd * 6.2831853);
  float edge = 1.0 - smoothstep(0.0, mix(0.03, 0.055, pulse), f2 - f1);
  float edgeVis = edge * (0.1 + 0.5 * pulse) * emerge;

  float tw = 0.55 + 0.45 * sin(u_time * (0.4 + cellRnd * 0.5) + cellRnd * 40.0);
  float node = exp(-f1 * mix(22.0, 12.0, cellRnd)) * tw * emerge;
  float accentNode = step(0.88, cellRnd);

  // faint contours survive in the smooth-flow regions — topology stays
  // readable even where the network has not condensed yet
  float band = abs(fract(field * 7.0 - t * 0.8) - 0.5);
  float line = (1.0 - smoothstep(0.0, 0.032, band)) * (1.0 - emerge) * 0.8;

  vec3 col = BG;
  col = mix(col, INK * 0.12, smoothstep(0.2, 0.9, field)); // atmospheric lift
  col = mix(col, INK * 0.20, line);
  col = mix(col, INK * 0.22, edgeVis);
  col = mix(col, INK * 0.7, node * (1.0 - accentNode) * 0.7);
  col += ACCENT * edgeVis * accentNode * 0.3;
  col = mix(col, ACCENT * 0.9, node * accentNode);

  col *= vignette(uv);
  col += dither(gl_FragCoord.xy, u_time);

  gl_FragColor = vec4(col, 1.0);
`

export const hybridFragment = buildFragment(main)
