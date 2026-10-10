// ShaderMaterial automatically supplies position, projectionMatrix and modelViewMatrix.
// The depth-only occluder and contour mesh use this EXACT shader: they breathe together.
uniform float u_time;
uniform float u_motion;
uniform float u_cycle;
attribute float aU;
attribute float aAlpha;
attribute float aAccent;
attribute vec3 aNormal;
varying float vAlpha;
varying float vAccent;
varying float vDepth;
void main() {
  vec3 pos = position;
  float phase = u_time * (6.28318530718 / max(1.0, u_cycle));
  float anchored = sin(3.14159265 * aU);
  float fold = 0.24 + 0.76 * exp(-pow((aU - 0.66) / 0.28, 2.0));
  float breathe = sin(phase) * anchored * fold;
  pos += aNormal * breathe * u_motion;
  vAlpha = aAlpha;
  vAccent = aAccent;
  vDepth = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
