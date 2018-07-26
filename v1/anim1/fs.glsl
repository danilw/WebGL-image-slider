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

vec4 loader( vec2 U )
{
    U*=iResolution.xy;
        vec2 R =  iResolution.xy, uv = (2.*U -R)/R.y;
    vec4 O=vec4(1.);
    float t = iTime,
          a = atan(uv.x,uv.y)  - t *1.8,
          l = length(uv),
          d = smoothstep(1.,.8,    l)
              - smoothstep(1.,.8, 2.*l);  
          d *= smoothstep(0.,1., fract(a/6.28));
    O =  vec4(0.58+0.531*uv.x*sin(t),0.738-0.31*uv.y*cos(t),.5,1)  + 1.2*d * vec4(.478537, .73621, .478537, 0);
    //O =  vec4(0.,-0.1,.15,1)  + 1.2*d * vec4(.478537, .73621, .478537, 0);
    O *= 1. - l*l*.155;
    return O;
}


vec2 plane(vec3 p, vec3 d, vec3 normal)
{
    vec3 up = vec3(0,1,0);
    vec3 right = cross(up, normal);
    
    float dn = dot(d, normal);
    float pn = dot(p, normal);
    
    vec3 hit = p - d / dn * pn;
    
    vec2 uv;
    uv.x = dot(hit, right);
    uv.y = dot(hit, up);
    
    return uv;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    if((!playback)&&(!playnext)){fragColor = !load1 ? loader( fragCoord/iResolution.xy) :texture2D(iChannel1,  vec2(fragCoord.x/iResolution.x,1.-fragCoord.y/iResolution.y));return;}
    vec2 xy = fragCoord - iResolution.xy / 2.0;
    float grid_width = iResolution.y/8.;
    xy /= grid_width;
    xy.x-=0.5;
    vec2 grid = floor(xy);
    xy = mod(xy, 1.0) - 0.5;
    
    float alpha = 0.0;
    float time = iTime- (grid.y - grid.x)*0.1-1.;
    time*=6./(FadeSpeed*2.);
    time = mod(time, 6.);
    alpha += smoothstep(0.0, 1.0, time);
    alpha += 1. - smoothstep(3.0, 4.0, time);
    alpha = abs(mod(alpha, 2.0)-1.0);
    
    float side = step(0.5, alpha);
    
    alpha = radians(alpha*180.0);
    vec4 n = vec4(cos(alpha),0,sin(alpha),-sin(alpha));
    vec3 d = vec3(1.0,xy.y,xy.x);
    vec3 p = vec3(-1.0+n.w/4.0,0,0);
    vec2 uv = plane(p, d, n.xyz);
    
    uv += 0.5;
    if (uv.x<0.0||uv.y<0.0||uv.x>1.0||uv.y>1.0)
    {
        fragColor *= 0.0;
        return;
    }
    
    vec2 guv = grid*grid_width/iResolution.xy+0.5;
    vec2 scale = vec2(grid_width)/iResolution.xy;
    vec2 oguv=guv;
    guv.y=0.875-guv.y;
    guv.x+=0.035;
    if(playnext){
    vec4 c1 = mod(iTime,FadeSpeed*2.)>mod(iTime,FadeSpeed)?
        (!load2 ? loader(oguv + vec2(1.0-uv.x,uv.y)*scale) :texture2D(iChannel2, guv + vec2(1.0-uv.x,1.-uv.y)*scale)):(!load1 ? loader(oguv + vec2(1.0-uv.x,uv.y)*scale) :texture2D(iChannel1, guv + vec2(1.0-uv.x,1.-uv.y)*scale));
    vec4 c2 = mod(iTime,FadeSpeed*2.)>mod(iTime,FadeSpeed)?
        (!load1 ? loader(oguv + vec2(uv.x,uv.y)*scale) :texture2D(iChannel1, guv + vec2(uv.x,1.-uv.y)*scale)):(!load2 ? loader(oguv + vec2(uv.x,uv.y)*scale) :texture2D(iChannel2, guv + vec2(uv.x,1.-uv.y)*scale));
            fragColor = mix(c1, c2, side);}else{
        vec4 c1 = mod(iTime,FadeSpeed*2.)>mod(iTime,FadeSpeed)?
        (!load0? loader(oguv + vec2(1.0-uv.x,uv.y)*scale) :texture2D(iChannel0, guv + vec2(1.0-uv.x,1.-uv.y)*scale)):(!load1 ? loader(oguv + vec2(1.0-uv.x,uv.y)*scale) :texture2D(iChannel1, guv + vec2(1.0-uv.x,1.-uv.y)*scale));
    vec4 c2 = mod(iTime,FadeSpeed*2.)>mod(iTime,FadeSpeed)?
        (!load1 ? loader(oguv + vec2(uv.x,uv.y)*scale) :texture2D(iChannel1, guv + vec2(uv.x,1.-uv.y)*scale)):(!load0 ? loader(oguv + vec2(uv.x,uv.y)*scale) :texture2D(iChannel0, guv + vec2(uv.x,1.-uv.y)*scale));
            fragColor = mix(c1, c2, side);
    }
}


void main(void) {
    vec4 fragColor = vec4(0.);
    mainImage(fragColor,gl_FragCoord.xy);
    gl_FragColor = fragColor;
}
