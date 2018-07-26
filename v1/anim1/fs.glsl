precision mediump float;
varying vec4 color;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform sampler2D u_texture3;

uniform bool u_load0;
uniform bool u_load1;
uniform bool u_load2;
uniform bool u_playback;
uniform bool u_playnext;
uniform float u_FadeSpeed;

#define iTime u_time
#define iResolution u_resolution
#define iChannel0 u_texture1
#define iChannel1 u_texture2
#define iChannel2 u_texture3

#define FadeSpeed u_FadeSpeed
#define load0 u_load0
#define load1 u_load1
#define load2 u_load2
#define playback u_playback
#define playnext u_playnext

#define back iChannel0
#define from iChannel1
#define to iChannel2
#define resolution (iResolution.xy)

float progress;
float reflection = .4;
float perspective = .2;
float depth = 3.;

vec4 loading(){
    return vec4(0.1,0.1,0.4,1.);
}
 
const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}
 
vec2 project (vec2 p) {
  return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
}

vec2 refx(vec2 c){
	return vec2(c.x,1.-c.y);
}
 
vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
  vec4 c = black;
  pfr = project(pfr);
  if (inBounds(pfr)) {
    c += mix(black, playback?(!load0?loading():texture2D(back, refx(pfr))):(!load1?loading():texture2D(from, refx(pfr))), reflection * mix(1.0, 0.0, pfr.y));
  }
  pto = project(pto);
  if (inBounds(pto)) {
    c += mix(black, playback?(!load1?loading():texture2D(from, refx(pto))):(!load2?loading():texture2D(to, refx(pto))), reflection * mix(1.0, 0.0, pto.y));
  }
  return c;
}
 
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  progress = sin(iTime*.5)*.5+.5;
  vec2 p = fragCoord.xy / resolution.xy;
  progress=iTime/FadeSpeed;
  if(playback)progress*=-1.;
  if((!playback)&&(!playnext))progress=0.;
  progress=mod(progress,1.);

  vec2 pfr, pto = vec2(-1.);
 
  float size = mix(1.0, depth, progress);
  float persp = perspective * progress;
  pfr = (p + vec2(-0.0, -0.5)) * vec2(size/(1.0-perspective*progress), size/(1.0-size*persp*p.x)) + vec2(0., 0.5);
 
  size = mix(1.0, depth, 1.-progress);
  persp = perspective * (1.-progress);
  pto = (p + vec2(-1.0, -0.5)) * vec2(size/(1.0-perspective*(1.0-progress)), size/(1.0-size*persp*(0.5-p.x))) + vec2(1.0, 0.5);
 
  bool fromOver = progress < 0.5;
  if (fromOver) {
    if (inBounds(pfr)) {
      fragColor = (playback&&(abs(progress)>0.000001))?(!load0?loading():texture2D(back, refx(pfr))):(!load1?loading():texture2D(from, refx(pfr)));
    }
    else if (inBounds(pto)) {
      fragColor = playback?(!load1?loading():texture2D(from, refx(pto))):(!load2?loading():texture2D(to, refx(pto)));
    }
    else {
      fragColor = bgColor(p, pfr, pto);
    }
  }
  else {
    if (inBounds(pto)) {
      fragColor = playback?(!load1?loading():texture2D(from, refx(pto))):(!load2?loading():texture2D(to, refx(pto)));
    }
    else if (inBounds(pfr)) {
      fragColor = playback?(!load0?loading():texture2D(back, refx(pfr))):(!load1?loading():texture2D(from, refx(pfr)));
    }
    else {
      fragColor = bgColor(p, pfr, pto);
    }
  }
}


void main(void) {
    vec4 fragColor = vec4(0.);
    mainImage(fragColor,gl_FragCoord.xy);
    gl_FragColor = fragColor;
}
