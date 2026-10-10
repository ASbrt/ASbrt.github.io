// No bloom. Off-white contours and ONE sparingly highlighted lime ridge.
uniform float u_lineOpacity;
uniform float u_lineBrightness;
uniform float u_limeAmount;
uniform float u_depthFade;
varying float vAlpha;
varying float vAccent;
varying float vDepth;
void main() {
  vec3 ink = vec3(0.949, 0.949, 0.937);
  vec3 lime = vec3(0.847, 1.0, 0.243);
  float highlight = clamp(vAccent * u_limeAmount, 0.0, 1.0);
  vec3 color = mix(ink, lime, highlight) * u_lineBrightness;
  float naturalFade = clamp(0.73 + vDepth * 0.25, 0.28, 1.0);
  float fade = mix(1.0, naturalFade, u_depthFade);
  float alpha = clamp(vAlpha * u_lineOpacity * fade * (1.0 + 0.28 * highlight), 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
