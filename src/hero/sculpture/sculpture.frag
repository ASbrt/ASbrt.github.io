uniform float u_time;
uniform float u_opacity;
uniform float u_brightness;
uniform float u_depthFade;
uniform float u_accentIntensity;
uniform vec4 u_accentA[4]; // (u, v, longitudinal radius, lateral radius)
uniform vec4 u_accentB[4]; // (strength,0,0,0)
uniform float u_fragmentation;
uniform float u_fragScale;
uniform float u_fragmentSoftness;
uniform float u_shadowEnabled;
uniform float u_shadowStrength;
uniform float u_shadowWidth;
uniform float u_shadowRepeats;
uniform float u_shadowSlant;
uniform float u_lineFade;
uniform float u_phase;
varying float vU;
varying float vV;
varying float vLine;
varying float vDepth;
varying float vFacing;
float hash(float n){return fract(sin(n*127.1+78.233)*43758.5453);}
void main(){
  float accent=0.0;
  for(int i=0;i<4;i++){
    vec4 zone=u_accentA[i];
    float du=(vU-zone.x)/max(.001,zone.z),dv=(vV-zone.y)/max(.001,zone.w);
    accent=max(accent,exp(-1.5*(du*du+dv*dv))*u_accentB[i].x);
  }
  accent=clamp(accent*u_accentIntensity,0.0,1.0);
  float falloff=exp(-max(0.0,vDepth-2.20)*u_depthFade*.75);
  float alpha=u_opacity*(.24+.70*pow(clamp(vFacing,0.0,1.0),.8))*falloff;
  alpha*=smoothstep(0.0,.045,vU)*(1.0-smoothstep(.955,1.0,vU));
  // Stable irregular gaps. Adjusting camera/folds never changes the mask.
  float cell=floor(vU*u_fragScale+vLine*2.0);
  float rand=hash(cell+floor(vLine*500.0)*37.17);
  float local=fract(vU*u_fragScale+vLine*2.0);
  float gap=1.0-smoothstep(u_fragmentation*.30,u_fragmentation*.30+u_fragmentSoftness*6.0,abs(local-.5));
  float gapActive=step(rand,clamp(u_fragmentation,0.0,.99));
  alpha*=1.0-gapActive*gap*.97;
  // Traveling darkness along contour, phase-offset by nearby lines.
  float travel=fract(vU*u_shadowRepeats-u_phase*u_time+vLine*u_shadowSlant);
  float distanceFromPatch=min(travel,1.0-travel);
  float shadowPatch=1.0-smoothstep(u_shadowWidth*.5,u_shadowWidth*.5+.06,distanceFromPatch);
  alpha*=1.0-u_shadowEnabled*u_shadowStrength*shadowPatch;
  // Slow coherent variations between neighboring filaments.
  float lineOsc=.5+.5*sin(u_time*0.10+vLine*13.0+sin(vLine*9.0)*.7);
  alpha*=1.0-u_shadowEnabled*u_lineFade*(1.0-lineOsc);
  vec3 ink=vec3(.949,.949,.937),lime=vec3(.847,1.0,.243);
  vec3 color=mix(ink,lime,accent)*u_brightness;
  alpha*=1.0+.40*accent;
  gl_FragColor=vec4(color,clamp(alpha,0.0,1.0));
}
