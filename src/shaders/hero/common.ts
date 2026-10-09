// Shared GLSL chunks for the hero shader variants.
// Every variant is a fullscreen-quad fragment shader built from the same
// header (uniforms) + common library (noise, voronoi, palette, dither).

export const FRAGMENT_HEADER = /* glsl */ `
  precision highp float;

  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_mouse;
`

export const COMMON_GLSL = /* glsl */ `
  const vec3 BG     = vec3(0.040, 0.040, 0.043);
  const vec3 INK    = vec3(0.949, 0.949, 0.937);
  const vec3 ACCENT = vec3(0.847, 1.000, 0.243);

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
      mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.03;
      a *= 0.5;
    }
    return v;
  }

  // Animated voronoi: returns (F1, F2) distances, writes the nearest cell id.
  // Feature points drift on slow Lissajous paths so structures feel alive
  // without ever snapping.
  vec2 voro(vec2 p, float t, out vec2 cellId) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = hash22(ip + g);
        o = 0.5 + 0.36 * sin(t * 0.4 + 6.2831853 * o);
        vec2 r = g + o - fp;
        float d = dot(r, r);
        if (d < f1) {
          f2 = f1;
          f1 = d;
          cellId = ip + g;
        } else if (d < f2) {
          f2 = d;
        }
      }
    }
    return sqrt(vec2(f1, f2));
  }

  // Shared composition helper: a calm basin in the lower-left where the hero
  // name and subline sit, so every variant stays quiet behind the text.
  float calmBasin(vec2 uv) {
    return smoothstep(0.9, 0.2, distance(uv * vec2(1.0, 1.3), vec2(0.30, 0.16)));
  }

  // Slightly larger forms on small screens (fewer, cheaper features).
  float screenScale(vec2 res) {
    return mix(0.72, 1.0, smoothstep(420.0, 900.0, res.x));
  }

  float vignette(vec2 uv) {
    return mix(0.55, 1.0, smoothstep(1.25, 0.35, distance(uv, vec2(0.5))));
  }

  float dither(vec2 fc, float t) {
    return (hash12(fc + fract(t) * 61.7) - 0.5) * 0.014;
  }
`

/** Assemble a complete fragment shader from a `main()` body string. */
export function buildFragment(mainBody: string): string {
  return `${FRAGMENT_HEADER}\n${COMMON_GLSL}\nvoid main() {\n${mainBody}\n}\n`
}
