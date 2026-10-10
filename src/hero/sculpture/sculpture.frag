// Editorial ink + a deliberately visible, locally placed lime accent.
uniform float u_lineOpacity;
uniform float u_lineBrightness;
uniform float u_accentIntensity;
uniform float u_depthFade;
varying float vAlpha;
varying float vAccent;
varying float vDepth;
void main(){
  vec3 ink=vec3(0.949,0.949,0.937);
  vec3 lime=vec3(0.847,1.0,0.243);
  float highlight=clamp(vAccent*u_accentIntensity,0.0,1.0);
  vec3 color=mix(ink,lime,highlight)*u_lineBrightness;
  // Camera-space fade continues to work as the sculpture rotates.
  float fade=exp(-max(0.0,vDepth-2.25)*u_depthFade*0.85);
  float alpha=clamp(vAlpha*u_lineOpacity*fade*(1.0+0.58*highlight),0.0,1.0);
  gl_FragColor=vec4(color,alpha);
}
