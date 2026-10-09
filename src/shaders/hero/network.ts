// Variant B — Network: emergent nodes and connecting filaments.
// An animated voronoi system: feature points drift on slow paths, edge
// brightness pulses travel from cell to cell, and a few cells carry
// acid-lime nodes. Stretched cells and dim ink filaments keep it
// structural — a coordination system, not a particle wallpaper.

import { buildFragment } from './common'

const main = /* glsl */ `
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv;
  p.x *= aspect;
  p *= screenScale(u_res);

  // stretched cell grid — architectural, not a dot cloud
  vec2 grid = p * vec2(3.4, 2.6);

  // the system subtly leans toward the pointer instead of reacting to it
  vec2 m = u_mouse;
  m.x *= aspect;
  vec2 pull = (m - uv) * vec2(aspect, 1.0);
  grid += 0.18 * pull * exp(-distance(p, m) * 1.6);

  vec2 cell;
  vec2 v = voro(grid, u_time * 0.55, cell);
  float f1 = v.x;
  float f2 = v.y;
  float cellRnd = hash12(cell);

  float calm = calmBasin(uv);
  float calmVis = mix(0.12, 1.0, smoothstep(0.85, 0.35, calm));

  // filaments — brightness pulses travel cell to cell
  float pulse = 0.5 + 0.5 * sin(u_time * 0.9 + cellRnd * 6.2831853);
  float edge = 1.0 - smoothstep(0.0, mix(0.028, 0.05, pulse), f2 - f1);
  float edgeVis = edge * (0.14 + 0.5 * pulse) * calmVis;

  // nodes — small, glowing, mostly quiet ink; a sparse few are lime
  float tw = 0.55 + 0.45 * sin(u_time * (0.4 + cellRnd * 0.5) + cellRnd * 40.0);
  float node = exp(-f1 * mix(16.0, 9.0, cellRnd)) * tw;
  float accentNode = step(0.86, cellRnd);

  vec3 col = BG;
  col = mix(col, INK * 0.12, exp(-f1 * 4.0) * 0.5 * calmVis); // faint halo field
  col = mix(col, INK * 0.24, edgeVis);                        // dim ink filaments
  col = mix(col, INK * 0.75, node * (1.0 - accentNode) * 0.8 * calmVis);
  col += ACCENT * edgeVis * accentNode * 0.35;                // lime-tinted cell edges
  col = mix(col, ACCENT, node * accentNode * 1.2 * mix(0.3, 1.0, calmVis));

  col *= vignette(uv);
  col += dither(gl_FragCoord.xy, u_time);

  gl_FragColor = vec4(col, 1.0);
`

export const networkFragment = buildFragment(main)
