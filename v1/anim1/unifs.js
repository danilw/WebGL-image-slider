"use strict";

var Texture = function (fn, gl, id, w, h) {
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    var that = this;
    var root = this;
    this.filename = fn;
    this.isload = false;
    this.isused = false;
    this.width = 0;
    this.idx = id;
    this.height = 0;
    this.image = null;
    this.texture = null;
    if (fn === "dummy")
        return;
    this.load = function (filename) {
        that.image = new Image();
        that.image.onload = function (event) {
            var file = fn.split("/");
            that.texture = gl.createTexture();
            /*if (w*2 > this.width)
                this.width = w*2;
            if (h*2 > this.height)
                this.height = h*2;*/
            that.width = this.width;
            that.height = this.height;

            gl.bindTexture(gl.TEXTURE_2D, that.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, that.image);
            if (isPowerOf2(that.image.width) && isPowerOf2(that.image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
            console.log("Loaded texture (" + that.width + "x" + that.height + ") filename = " + file[file.length - 1]);
            that.isload = true;
        };
        //that.image.crossOrigin = 'anonymous';
        that.image.src = filename;
        return that;
    };

    if (fn !== undefined && fn !== "" && fn !== null)
        this.load(fn);
    else
        console.log("Unable to load texture. Filename '" +
                fn + "' is undefined or null.");
};
var glslslider = function (canvas, maxtextures, fadesx, imagesx) {
    var that = this;
    this.width = 0;
    this.height = 0;
    this.gl = null;
    this.webglversion = 0;
    this.imagesgx = imagesx;
    this.Shader = null;
    this.animationfn = null;
    this.shadersloaded = false;
    this.maxtexturesx = maxtextures; //max saved textures
    this.texturexx = [];
    this.texturesfsize = 2;
    this.FadeSpeed = fadesx;
    this.lastsave = -1;
    this.usedtexturelast = 0;
    this.usedtexturethis = 0;
    this.usedtexturethisn = 0;
    this.usedtexturenext = -1;
    this.nextindex = 0;
    this.flagxn = 0; //-1 last, 0 this, 1 thisn
    this.flagx = 0;
    function LoadShader(filenameVertexShader, filenameFragmentShader, index)
    {
        var filename_vs = filenameVertexShader;
        var filename_fs = filenameFragmentShader;
        var v = "";
        var f = "";
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    v = xmlhttp.responseText;
                    var xmlhttp2 = new XMLHttpRequest();
                    xmlhttp2.onreadystatechange = function () {
                        if (xmlhttp2.readyState === XMLHttpRequest.DONE)
                            if (xmlhttp2.status === 200) {
                                f = xmlhttp2.responseText;
                                that.Shader = InitializeShader(v, f, filenameVertexShader, filenameFragmentShader);
                                that.shadersloaded = true;
                            }
                    };
                    xmlhttp2.open("GET", filename_fs, true);
                    xmlhttp2.send();
                }
            }
        };
        xmlhttp.open("GET", filename_vs, true);
        xmlhttp.send();
    };
    function InitializeShader(source_vs, source_frag, fv, ff)
    {
        var ErrorMessage = "Initializing Shader Program: <" + fv + ">, <" + ff + ">";
        var shader_vs = that.gl.createShader(that.gl.VERTEX_SHADER);
        var shader_frag = that.gl.createShader(that.gl.FRAGMENT_SHADER);
        that.gl.shaderSource(shader_vs, source_vs);
        that.gl.shaderSource(shader_frag, source_frag);
        that.gl.compileShader(shader_vs);
        that.gl.compileShader(shader_frag);
        var error = false;
        if (!that.gl.getShaderParameter(shader_vs, that.gl.COMPILE_STATUS)) {
            ErrorMessage += that.gl.getShaderInfoLog(shader_vs);
            error = true;
        }
        if (!that.gl.getShaderParameter(shader_frag, that.gl.COMPILE_STATUS)) {
            ErrorMessage += that.gl.getShaderInfoLog(shader_frag);
            error = true;
        }
        var program = that.gl.createProgram();
        var ret = that.gl.getProgramInfoLog(program);
        if (ret !== "")
            ErrorMessage += ret;
        that.gl.attachShader(program, shader_vs);
        that.gl.attachShader(program, shader_frag);
        if (that.gl.linkProgram(program) === 0) {
            ErrorMessage += "\r\ngl.linkProgram(program) failed with error code 0.";
            error = true;
        }
        if (error) {
            console.log(ErrorMessage + ' ...failed to initialize shader.');
            return false;
        } else {
            console.log(ErrorMessage + ' ...shader successfully created.');
            return program;
        }
    };
    var atmpt = 50;
    var catmpt = 0;
    function waiting() {
        catmpt++;
        console.log('waiting for shaders loading');
        setTimeout(function () {
            if (catmpt < atmpt) {
                if (!that.shadersloaded)
                    waiting();
                else
                {
                    catmpt = 0;
                    launchwebgl();
                }
            } else
                console.log('failed loading shaders');
        }, 100);
    };
    function initdtextr() {
        for (var i = 0; i < that.maxtexturesx; i++) {
            that.texturexx[i] = new Texture("dummy", that.gl, -2, that.width, that.height);
        }
    };
    function animreqnextt(fx, flag) {
        that.flagx = flag;
        that.usedtexturenext = fx; //id
    };
    function animgotofw(idx) {
        animreqnextt(idx, 1);
    };
    function animgotobk(idx) {
        animreqnextt(idx, -1);
    };
    this.animqreg = function (a, b, c) {
        that.usedtexturelast = a;
        that.usedtexturethis = b;
        that.usedtexturethisn = c;
    };

    this.loadtexture = function (fn) {
        if (that.lastsave + 1 === that.maxtexturesx)
            that.lastsave = 0;
        else
            that.lastsave++;

        var isrec = false;
        for (var i = 0; i < that.maxtexturesx; i++) {
            if ((that.texturexx[i].filename === fn)) {
                return i;
            }
        }
        for (var i = that.lastsave; i < that.maxtexturesx; i++) {
            if ((that.texturexx[i].idx === that.usedtexturenext) || (that.texturexx[i].idx === that.usedtexturelast)
                    || (that.texturexx[i].idx === that.usedtexturethisn) || (that.texturexx[i].idx === that.usedtexturethis)) {
                continue;
            } else {
                that.lastsave = i;
                if (that.texturexx[i].isload) {
                    console.log("Unload old texture, id: " + i);
                    that.gl.deleteTexture(that.texturexx[i].texture);
                }
                that.texturexx[i] = new Texture(fn, that.gl, i, that.width, that.height);
                return i;
            }
        }
        that.lastsave = 0;
        for (var i = that.lastsave; i < that.maxtexturesx; i++) {
            if ((that.texturexx[i].idx === that.usedtexturenext) || (that.texturexx[i].idx === that.usedtexturelast)
                    || (that.texturexx[i].idx === that.usedtexturethisn) || (that.texturexx[i].idx === that.usedtexturethis)) {
                continue;
            } else {
                that.lastsave = i;
                if (that.texturexx[i].isload)
                    that.gl.deleteTexture(that.texturexx[i].texture);
                that.texturexx[i] = new Texture(fn, that.gl, i, that.width, that.height);
                return i;
            }
        }
    };
    var ltime = 0;
    function animloopx(gtime) {

        var vtx = gtime % that.FadeSpeed;
        if (vtx > ltime) {
            ltime = vtx;
        } else {
            ltime = vtx;
            if (that.usedtexturenext === -1) {
                if ((that.flagxn === 1)) {
                    var gt = that.usedtexturelast;
                    that.usedtexturelast = that.usedtexturethis;
                    that.usedtexturethis = that.usedtexturethisn;
                    that.usedtexturethisn = gt;
                }
                if ((that.flagxn === -1)) {
                    var gt = that.usedtexturethis;
                    that.usedtexturethis = that.usedtexturelast;
                    that.usedtexturelast = that.usedtexturethisn;
                    that.usedtexturethisn = gt;
                }
            } else {
                that.flagxn = that.flagx;
                if ((that.flagxn === 1)) {
                    that.usedtexturelast = that.usedtexturethis;
                    that.usedtexturethis = that.usedtexturethisn;
                    that.usedtexturethisn = that.usedtexturenext;
                }
                if ((that.flagxn === -1)) {
                    that.usedtexturethisn = that.usedtexturethis;
                    that.usedtexturethis = that.usedtexturelast;
                    that.usedtexturelast = that.usedtexturenext;

                }
                that.usedtexturenext = -1;
            }
        }
    };
    this.animloopfw = function () {
        that.flagxn = 1;
        if (that.usedtexturenext === -1) {
            if (that.nextindex === that.imagesgx.length)
                that.nextindex = 0;
            animgotofw(that.loadtexture(that.imagesgx[that.nextindex].medium));
            that.nextindex++;
        }
    };
    this.animloopbk = function () {
        that.flagxn = -1;
        if (that.usedtexturenext === -1) {
            if (that.nextindex === -1)
                that.nextindex = that.imagesgx.length - 1;
            animgotobk(that.loadtexture(that.imagesgx[that.nextindex].medium));
            that.nextindex--;
        }
    };
    var start = null;
    function step(T) {
        if (!start)
            start = T;
        if (!that.gl) {
            console.log("ERROR: webgl lost");
            return;
        }
        var timex = (T - start) / 1000;
        if (timex > 6000)
            start = T;
        if (that.animationfn) {
            that.animationfn();
        }
        animloopx(timex);
        that.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        that.gl.clear(that.gl.COLOR_BUFFER_BIT);
        that.gl.useProgram(that.Shader);
        that.gl.uniform1f(that.gl.getUniformLocation(that.Shader, "u_time"), timex);
        that.gl.uniform1f(that.gl.getUniformLocation(that.Shader, "u_FadeSpeed"), that.FadeSpeed);
        that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, "u_load0"), that.texturexx[that.usedtexturelast].isload);
        that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, "u_load1"), that.texturexx[that.usedtexturethis].isload);
        that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, "u_load2"), that.texturexx[that.usedtexturethisn].isload);
        that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, "u_playback"), that.flagxn === -1);
        that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, "u_playnext"), that.flagxn === 1);
        that.gl.uniform2f(that.gl.getUniformLocation(that.Shader, "u_resolution"), that.width, that.height);
        //to keep console without webgl errors
        if (that.texturexx[that.usedtexturelast].isload) {
            that.gl.activeTexture(that.gl.TEXTURE0);
            that.gl.bindTexture(that.gl.TEXTURE_2D, that.texturexx[that.usedtexturelast].texture);
            that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, 'u_texture1'), 0);
        }
        if (that.texturexx[that.usedtexturethis].isload) {
            that.gl.activeTexture(that.gl.TEXTURE1);
            that.gl.bindTexture(that.gl.TEXTURE_2D, that.texturexx[that.usedtexturethis].texture);
            that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, 'u_texture2'), 1);
        }
        if (that.texturexx[that.usedtexturethisn].isload) {
            that.gl.activeTexture(that.gl.TEXTURE2);
            that.gl.bindTexture(that.gl.TEXTURE_2D, that.texturexx[that.usedtexturethisn].texture);
            that.gl.uniform1i(that.gl.getUniformLocation(that.Shader, 'u_texture3'), 2);
        }
        that.gl.drawElements(that.gl.TRIANGLES, 6, that.gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(step);
    };
    function launchwebgl() {
        var vertices = new Float32Array([
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0
        ]);
        var indices = [0, 1, 2, 2, 3, 0];
        var vertexbuffer = that.gl.createBuffer();
        var indexbuffer = that.gl.createBuffer();
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, vertexbuffer);
        that.gl.bufferData(that.gl.ARRAY_BUFFER, new Float32Array(vertices), that.gl.STATIC_DRAW);
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, null);
        that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, indexbuffer);
        that.gl.bufferData(that.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), that.gl.STATIC_DRAW);
        that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, null);
        that.gl.bindBuffer(that.gl.ARRAY_BUFFER, vertexbuffer);
        that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, indexbuffer);
        that.gl.viewport(0, 0, that.width, that.height);
        var coords = that.gl.getAttribLocation(that.Shader, "a_Position");
        that.gl.vertexAttribPointer(coords, 3, that.gl.FLOAT, false, 0, 0);
        that.gl.enableVertexAttribArray(coords);
        window.requestAnimationFrame(step);
    };
    that.gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log('webgl2 not supported, trying webgl');
        that.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") || canvas.getContext("moz-webgl") || canvas.getContext("webkit-3d");
        if (!that.gl) {
            console.log('webgl not suported');
            return;
        } else {
            that.webglversion = 1;
            console.log('continue using webgl');
        }
    } else {
        that.webglversion = 2;
        console.log('continue with webgl2');
    }
    that.width = Number(canvas.attributes['width'].value);
    that.height = Number(canvas.attributes['height'].value);
    LoadShader("vs.glsl", "fs.glsl");
    if (that.lastsave === -1) {
        initdtextr();
    }
    waiting();
};