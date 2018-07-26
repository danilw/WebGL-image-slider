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

/*
#define PI 3.14159

#define THICCNESS 0.03
#define RADIUS 0.2
#define SPEED 3.0

#define aa 2.0 / min(iResolution.x,iResolution.y)

vec2 remap(vec2 coord) {
    return coord / min(iResolution.x, iResolution.y);
}

float circle(vec2 uv, vec2 pos, float rad) {
    return 1.0 - smoothstep(rad, rad + aa, length(uv - pos));
}

float ring(vec2 uv, vec2 pos, float innerRad, float outerRad) {
    return (1.0 - smoothstep(outerRad, outerRad + aa, length(uv - pos))) * smoothstep(innerRad - aa, innerRad, length(uv - pos));
}

vec4 loader2(vec2 fragCoord) {
    vec2 uv = remap(fragCoord.xy);
    uv -= vec2(0.5 / iResolution.y * iResolution.x, 0.5);

    float geo = 0.0;

    geo += ring(uv, vec2(0.0), RADIUS - THICCNESS, RADIUS);

    float rot = -iTime * SPEED;

    uv *= mat2(cos(rot), sin(rot), -sin(rot), cos(rot));

    float a = atan(uv.x, uv.y) * PI * 0.05 + 0.5;

    a = max(a, circle(uv, vec2(0.0, -RADIUS + THICCNESS / 2.0), THICCNESS / 2.0));

    return vec4(a * geo)+vec4(0.3);
}
*/

vec4 loader( vec2 U )
{
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


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
            vec2 uv = fragCoord/iResolution.xy;
            uv.y=1.-uv.y;
            if((!playback)&&(!playnext)){fragColor = !load1 ? loader(fragCoord) :texture2D(iChannel1, uv );return;}
            float perWidth = 0.1;
            float rspeed = (1./perWidth*3.14159)/FadeSpeed;
            float index = floor( uv.x / perWidth );
            float centerX = perWidth * ( index + 0.5 );
            float left = perWidth * index;
            float right = left + perWidth;

            float perRotateTime = 3.14159 / rspeed;
            float uot=iTime;
            float iTime=mod(iTime,perRotateTime*(1./perWidth));
            float startRotateTime = perRotateTime * 0.5 * index;
            float endRotateTime = startRotateTime + perRotateTime;
            float angle = (iTime - startRotateTime) * rspeed;
            vec2 cod = vec2(( uv.x - centerX) / cos( angle ) + centerX, uv.y );

            if( iTime <= startRotateTime ) {
                fragColor = !load1 ? loader(fragCoord) :texture2D(iChannel1, uv );
            }
            else if( iTime > endRotateTime ) {
                fragColor = playback?(!load0 ? loader(fragCoord) :texture2D(iChannel0, uv )):(!load2 ? loader(fragCoord) :texture2D(iChannel2, uv ));
            }
            else if( cod.x <= right && cod.x >= left ) {
                if( angle <= 1.5707 ) {
                        fragColor = (!load1 ? loader(vec2(cod.x,1.-cod.y)*iResolution.xy) :texture2D(iChannel1, cod ));
                } else if( angle <= 3.14159 ) {
                        fragColor = playback?(!load0 ? loader(vec2(right - cod.x + left, 1.-cod.y )*iResolution.xy) :texture2D(iChannel0, vec2( right - cod.x + left, cod.y ) )):(!load2 ? loader(vec2(right - cod.x + left, 1.-cod.y )*iResolution.xy) :texture2D(iChannel2, vec2( right - cod.x + left, cod.y )) ) ;
                }
            } else {
                fragColor = vec4( vec3( 0.0 ), 1.0 );   
            }
            
}


void main(void) {
    vec4 fragColor = vec4(0.);
    mainImage(fragColor,gl_FragCoord.xy);
    gl_FragColor = fragColor;
}
