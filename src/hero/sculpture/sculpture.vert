// WebGL2 / Three.js ShaderMaterial, GLSL 1.00 compatibility syntax.
// Attributes position.x/y store parametric (u,v), not world coordinates.
// All 13 spline points and fold values are GPU uniforms.
uniform vec3 u_spine[13];
uniform vec4 u_foldA[4]; // (position u, radius, twist, pinch)
uniform vec4 u_foldB[4]; // (lift, curl, unused, unused)
uniform float u_width;
uniform float u_cup;
uniform float u_baseTwist;
uniform float u_contours;
uniform float u_phase;
attribute float aLine;
varying float vU;
varying float vV;
varying float vLine;
varying float vDepth;
varying float vFacing;

vec3 catmull(vec3 a,vec3 b,vec3 c,vec3 d,float t){
  return .5*((2.0*b)+(-a+c)*t+(2.0*a-5.0*b+4.0*c-d)*t*t+(-a+3.0*b-3.0*c+d)*t*t*t);
}
vec3 spine(float u){
  float x=clamp(u,0.0,.999999)*12.0;
  float t=fract(x);
  if(x<1.0)return catmull(u_spine[0],u_spine[0],u_spine[1],u_spine[2],t);
  if(x<2.0)return catmull(u_spine[0],u_spine[1],u_spine[2],u_spine[3],t);
  if(x<3.0)return catmull(u_spine[1],u_spine[2],u_spine[3],u_spine[4],t);
  if(x<4.0)return catmull(u_spine[2],u_spine[3],u_spine[4],u_spine[5],t);
  if(x<5.0)return catmull(u_spine[3],u_spine[4],u_spine[5],u_spine[6],t);
  if(x<6.0)return catmull(u_spine[4],u_spine[5],u_spine[6],u_spine[7],t);
  if(x<7.0)return catmull(u_spine[5],u_spine[6],u_spine[7],u_spine[8],t);
  if(x<8.0)return catmull(u_spine[6],u_spine[7],u_spine[8],u_spine[9],t);
  if(x<9.0)return catmull(u_spine[7],u_spine[8],u_spine[9],u_spine[10],t);
  if(x<10.0)return catmull(u_spine[8],u_spine[9],u_spine[10],u_spine[11],t);
  if(x<11.0)return catmull(u_spine[9],u_spine[10],u_spine[11],u_spine[12],t);
  return catmull(u_spine[10],u_spine[11],u_spine[12],u_spine[12],t);
}
float ease(float a,float b,float x){float f=clamp((x-a)/(b-a),0.0,1.0);return f*f*(3.0-2.0*f);}
vec3 sculpture(float u,float v,out vec3 surfaceNormal){
  vec3 center=spine(u);
  vec3 tangent=normalize(spine(min(.999999,u+.003))-spine(max(0.0,u-.003))+vec3(.00001));
  vec3 lateral=normalize(vec3(-tangent.y,tangent.x,0.00001));
  vec3 depth=normalize(cross(tangent,lateral));
  float twist=u_baseTwist*u;
  float pinch=0.0,lift=0.0,curl=0.0;
  for(int i=0;i<4;i++){
    vec4 a=u_foldA[i],b=u_foldB[i];
    float d=(u-a.x)/max(.008,a.y);
    float weight=exp(-d*d);
    twist+=a.z*weight;
    pinch+=a.w*weight;
    lift+=b.x*weight;
    curl+=b.y*weight;
  }
  float taper=pow(ease(0.0,.13,u)*ease(0.0,.14,1.0-u),.72);
  float w=u_width*taper*(.77+.23*exp(-pow((u-.52)/.35,2.0)))*clamp(1.0-pinch,.09,2.0);
  float cs=cos(twist),sn=sin(twist);
  float side=v*w;
  float cupped=u_cup*u_width*taper*(v*v-.33333);
  float ripple=curl*u_width*taper*(v*v-.2);
  surfaceNormal=normalize(cross(tangent,lateral*cs+depth*sn));
  return center+lateral*(side*cs-cupped*sn+.10*ripple*v)+depth*(side*sn+cupped*cs+lift+ripple);
}
void main(){
  float u=position.x,v=position.y;
  vec3 normal;
  vec3 p=sculpture(u,v,normal);
  vU=u;vV=v;vLine=aLine/max(1.0,u_contours-1.0);
  vec4 view=modelViewMatrix*vec4(p,1.0);
  vFacing=abs(dot(normalize(normalMatrix*normal),normalize(-view.xyz)));
  vDepth=-view.z;
  gl_Position=projectionMatrix*view;
}
