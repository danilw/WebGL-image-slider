# WebGL-image-slider

**what is it** very simple image-slider for WebGL, using GLSL. Not using any external JavaScript code/libs.
___

*Warning*

1. CORS WebGL2/WebGL does not allow to use cross-origin data [chromium blog link](https://blog.chromium.org/2011/07/using-cross-domain-images-in-webgl-and.html)
2. **Only** WebGL, no *compatibility mode* with anything else
___

**basic example**

1. using three images in loop without "anim" function [minimal](https://danilw.github.io/WebGL-image-slider/v1/minimal/simple_slider.html)
2. using "anim" function [minimal_more_images](https://danilw.github.io/WebGL-image-slider/v1/minimal_more_images/simple_slider.html)

**other examples**

1 [anim1](https://danilw.github.io/WebGL-image-slider/v1/anim1/simple_slider.html) 2 [anim2](https://danilw.github.io/WebGL-image-slider/v1/anim2/simple_slider.html) 3 [using playback/playnext](https://danilw.github.io/WebGL-image-slider/v1/fs3d/simple_slider.html) 

**How it work:**

WebGL viewport width and height from *canvas* attributes

basic GLSL shader for this JavaScript logic (include loading animation in GLSL) [master/v1/fs.glsl](https://github.com/danilw/WebGL-image-slider/blob/master/v1/fs.glsl)

*unifs.js* send to GLSL this **uniforms**:

*sampler2D* u_texture1-3 three textures

*bool* u_load0-2 texture loading state, using this state you can show "loading" animation in GLSL while texture is not load(I make it in all shaders)

*bool* u_playback/u_playnext state of animation trigger, if both of this false then shader will display u_texture2 without any animations

*float* u_FadeSpeed speed for full "one image" animation in sec

*unifs.js* only load and unload textures(images) in loop, with synchronization to shader animation

**How to use:**

include script
```
<script type="text/javascript" src="unifs.js"></script>
```
and create canvas element
```
<canvas id = "gl" width = "555" height = "200"></canvas>
```
you need *image* array with image list
```
var images = [{
                    "medium": "1.jpg",
                }, {
                    "medium": "2.jpg",
                }, {
                    "medium": "3.jpg",
                }];
```
then init
```
var canvas = document.getElementById('gl');
var glslider = new glslslider(canvas, 20, 2.5, images);
var a = glslider.loadtexture(images[0].medium);
var b = glslider.loadtexture(images[1].medium);
var c = glslider.loadtexture(images[2].medium);
glslider.animqreg(a, b, c);
glslider.flagxn=1;
```
this is [minimal](https://danilw.github.io/WebGL-image-slider/v1/minimal/simple_slider.html) example

using *anim* function to scroll all images in *image* array [minimal_more_images](https://danilw.github.io/WebGL-image-slider/v1/minimal_more_images/simple_slider.html) example
```
glslider.nextindex = 3;
var anim = glslider.animloopfw;
glslider.animationfn = anim;
```
