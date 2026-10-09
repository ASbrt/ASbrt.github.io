// Variant A — Flow: refined contour / flow field.
// Large-scale domain-warped fbm forms rendered as thin, precise contour
// lines with spatially varying density; a second selection field picks
// where contours turn acid-lime. Art-directed composition: active structure
// upper-right, calm negative space behind the hero text.

import { buildFragment } from './common'

const main = /* glsl */ `
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float aspect = u_res.x / u_res.y;
  vec2 p = uv;
  p.x *= aspect;
  p *= screenScale(u_res);

  float t = u_time * 0.05;

  // large-scale domain-warped flow field — coherent forms, little micro-noise
  vec2 q = vec2(fbm(p * 0.85 + t * 0.7), fbm(p * 0.85 - t * 0.5 + 4.7));
  vec2 r = vec2(
    fbm(p * 0.85 + 1.9 * q + vec2(1.7, 9.2) + t * 0.35),
    fbm(p * 0.85 + 1.9 * q + vec2(8.3, 2.8) - t * 0.28)
  );
  float f = fbm(p * 0.85 + 2.0 * r);

  // subtle mouse lens — gently bends the field, nothing flashy
  vec2 m = u_mouse;
  m.x *= aspect;
  float md = distance(p, m);
  f += 0.05 * exp(-md * 3.2) * sin(u_time * 0.6 - md * 9.0);

  float calm = calmBasin(uv);
  float activity = smoothstep(0.18, 0.85, f) * (1.0 - 0.62 * calm);

  // contour lines with spatially varying density — dense in active regions,
  // sparse and broad in the calm basin
  float density = mix(11.0, 5.0, calm);
  float ph = f * density - t * 0.9;
  float band = abs(fract(ph) - 0.5);
  float lw = mix(0.015, 0.05, activity);
  float line = 1.0 - smoothstep(0.0, lw, band);
  float lineVis = line * mix(0.2, 1.0, activity);

  vec3 col = BG;
  col = mix(col, INK * 0.13, smoothstep(0.2, 0.9, f) * (1.0 - 0.5 * calm)); // ghostly lift
  col = mix(col, INK * 0.26, lineVis * 0.75);                                // ink contours

  // sparse acid-lime contours where a second field selects them —
  // kept away from the logo corner
  float sel = smoothstep(0.58, 0.78, fbm(p * 1.4 + r * 1.1 + 17.3));
  sel *= smoothstep(0.02, 0.2, distance(uv, vec2(0.0, 1.0)));
  float major = 1.0 - smoothstep(0.0, lw * 1.6, abs(fract(ph * 0.25 + 0.13) - 0.5));
  col = mix(col, ACCENT * 0.75, lineVis * sel * 0.9);
  col = mix(col, ACCENT, lineVis * sel * major * 0.45);

  col *= vignette(uv);
  col += dither(gl_FragCoord.xy, u_time);

  gl_FragColor = vec4(col, 1.0);
`

export const flowFieldFragment = buildFragment(main)
