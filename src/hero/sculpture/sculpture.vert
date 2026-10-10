// Both contour lines and depth occluder use this identical vertex program.
uniform float u_phase;
uniform float u_motion;
attribute float aU;
attribute float aAlpha;
attribute float aAccent;
attribute vec3 aNormal;
varying float vAlpha;
varying float vAccent;
varying float vDepth;
void main() {
  vec3 pos=position;
  float envelope=sin(3.14159265359*aU);
  float displacement=sin(u_phase*6.28318530718+aU*2.0)*u_motion*envelope;
  pos+=aNormal*displacement;
  vAlpha=aAlpha;
  vAccent=aAccent;
  vec4 viewPos=modelViewMatrix*vec4(pos,1.0);
  vDepth=-viewPos.z;
  gl_Position=projectionMatrix*viewPos;
}
