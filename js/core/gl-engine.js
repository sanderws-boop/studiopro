(function() {
    "use strict";
    var gl;

    Studio.Core.GLEngine = {
        init: function(canvas) {
            Studio.canvas = canvas;
            gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, alpha: false, antialias: false });
            if (!gl) {
                console.error('WebGL2 not available');
                return false;
            }
            Studio.gl = gl;
            gl.getExtension('EXT_color_buffer_float');

            // Create fullscreen quad
            this._quadBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

            // Compile all programs
            this._programs = {};
            this._buildAllPrograms();
            return true;
        },

        compileShader: function(src, type) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error('Shader error:', gl.getShaderInfoLog(s), '\n', src.split('\n').slice(0, 20).join('\n'));
                gl.deleteShader(s);
                return null;
            }
            return s;
        },

        buildProgram: function(vsSrc, fsSrc) {
            var vs = this.compileShader(vsSrc, gl.VERTEX_SHADER);
            var fs = this.compileShader(fsSrc, gl.FRAGMENT_SHADER);
            if (!vs || !fs) return null;
            var prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('Link error:', gl.getProgramInfoLog(prog));
                return null;
            }
            prog._uniforms = {};
            prog._attrs = {};
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return prog;
        },

        getUniform: function(prog, name) {
            if (!prog._uniforms[name]) {
                prog._uniforms[name] = gl.getUniformLocation(prog, name);
            }
            return prog._uniforms[name];
        },

        getAttrib: function(prog, name) {
            if (prog._attrs[name] === undefined) {
                prog._attrs[name] = gl.getAttribLocation(prog, name);
            }
            return prog._attrs[name];
        },

        createFBO: function(w, h, isFloat) {
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            var internalFormat = isFloat ? gl.RGBA16F : gl.RGBA8;
            var format = gl.RGBA;
            var type = isFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return { fb: fb, tex: tex, w: w, h: h };
        },

        resizeFBO: function(fbo, w, h, isFloat) {
            if (fbo && fbo.w === w && fbo.h === h) return fbo;
            if (fbo) { gl.deleteTexture(fbo.tex); gl.deleteFramebuffer(fbo.fb); }
            return this.createFBO(w, h, isFloat);
        },

        drawQuad: function(prog) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuf);
            var aPos = this.getAttrib(prog, 'position');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },

        bindTexture: function(unit, tex) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, tex);
        },

        _buildAllPrograms: function() {
            var self = this;
            var common = Studio.Shaders.Common;
            var vs = Studio.Shaders.Vertex;

            // Pattern programs
            var allPatterns = (Studio.Shaders.PatternsClassic || []).concat(Studio.Shaders.PatternsExtended || []);
            this._patternPrograms = [];
            for (var i = 0; i < allPatterns.length; i++) {
                var prog = this.buildProgram(vs, common + allPatterns[i].frag);
                this._patternPrograms.push(prog);
            }

            // Blend mode program
            this._blendProg = this.buildProgram(Studio.Shaders.Vertex, Studio.Shaders.BlendModes.fragment);

            // Bloom programs
            this._bloomDownProg = this.buildProgram(Studio.Shaders.Vertex, Studio.Shaders.PostBloom.downsample);
            this._bloomUpProg = this.buildProgram(Studio.Shaders.Vertex, Studio.Shaders.PostBloom.upsample);

            // Composite program
            this._compositeProg = this.buildProgram(Studio.Shaders.Vertex, Studio.Shaders.PostComposite.fragment);

            // Copy program
            this._copyProg = this.buildProgram(Studio.Shaders.Vertex, Studio.Shaders.PostExtras.copy);

            var compiled = this._patternPrograms.filter(function(p) { return p !== null; }).length;
            console.log('Studio Pro: compiled ' + compiled + '/' + allPatterns.length + ' patterns');
        },

        getPatternProgram: function(idx) {
            return this._patternPrograms[idx] || null;
        },

        getPatternCount: function() {
            return this._patternPrograms.length;
        },

        getAllPatterns: function() {
            return (Studio.Shaders.PatternsClassic || []).concat(Studio.Shaders.PatternsExtended || []);
        },

        resizeCanvas: function() {
            var dpr = window.devicePixelRatio || 1;
            var w = Studio.canvas.clientWidth;
            var h = Studio.canvas.clientHeight;
            var nw = Math.round(w * dpr);
            var nh = Math.round(h * dpr);
            if (Studio.canvas.width !== nw || Studio.canvas.height !== nh) {
                Studio.canvas.width = nw;
                Studio.canvas.height = nh;
                return true;
            }
            return false;
        },

        handleResize: function(w, h) {
            if (gl) gl.viewport(0, 0, w, h);
        },

        getGL: function() { return gl; }
    };
})();
