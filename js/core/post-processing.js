(function() {
    "use strict";

    var layerFBO = null;
    var blurFBO_A = null;
    var blurFBO_B = null;

    Studio.Core.PostProcessing = {
        init: function() {},

        ensureFBOs: function(gl, w, h) {
            layerFBO = Studio.Core.GLEngine.resizeFBO(layerFBO, w, h, true);
        },

        ensureBlurFBOs: function(gl, w, h) {
            blurFBO_A = Studio.Core.GLEngine.resizeFBO(blurFBO_A, w, h, true);
            blurFBO_B = Studio.Core.GLEngine.resizeFBO(blurFBO_B, w, h, true);
        },

        getLayerFBO: function() {
            return layerFBO;
        },

        applyBlur: function(gl, srcFBO, w, h, passes) {
            if (!passes || passes < 1) return srcFBO;
            var eng = Studio.Core.GLEngine;
            var prog = eng._blurProg;
            if (!prog) return srcFBO;

            this.ensureBlurFBOs(gl, w, h);

            var texelX = 1.0 / w;
            var texelY = 1.0 / h;
            var pingPong = [blurFBO_A, blurFBO_B];
            var readTex = srcFBO.tex;
            var writeIdx = 0;

            gl.useProgram(prog);
            gl.uniform1i(eng.getUniform(prog, 'u_src'), 0);

            for (var i = 0; i < passes; i++) {
                var step = Math.pow(2, i);

                // Horizontal pass
                gl.bindFramebuffer(gl.FRAMEBUFFER, pingPong[writeIdx].fb);
                gl.viewport(0, 0, w, h);
                eng.bindTexture(0, readTex);
                gl.uniform2f(eng.getUniform(prog, 'u_direction'), texelX, 0.0);
                gl.uniform1f(eng.getUniform(prog, 'u_step'), step);
                eng.drawQuad(prog);
                readTex = pingPong[writeIdx].tex;
                writeIdx = 1 - writeIdx;

                // Vertical pass
                gl.bindFramebuffer(gl.FRAMEBUFFER, pingPong[writeIdx].fb);
                gl.viewport(0, 0, w, h);
                eng.bindTexture(0, readTex);
                gl.uniform2f(eng.getUniform(prog, 'u_direction'), 0.0, texelY);
                gl.uniform1f(eng.getUniform(prog, 'u_step'), step);
                eng.drawQuad(prog);
                readTex = pingPong[writeIdx].tex;
                writeIdx = 1 - writeIdx;
            }

            // Return the FBO that was last written to
            return pingPong[1 - writeIdx];
        },

        applyComposite: function(gl, srcFBO, w, h, time) {
            var eng = Studio.Core.GLEngine;
            var prog = eng._compositeProg;
            if (!prog) return;

            var postFx = Studio.Systems.State.postFx;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, w, h);
            gl.useProgram(prog);
            eng.bindTexture(0, srcFBO.tex);
            gl.uniform1i(eng.getUniform(prog, 'u_src'), 0);
            gl.uniform2f(eng.getUniform(prog, 'u_resolution'), w, h);
            gl.uniform1f(eng.getUniform(prog, 'u_time'), time);
            gl.uniform1f(eng.getUniform(prog, 'u_grain'), postFx.filmGrain || 0);
            var gc = Studio.Systems.State.hexToGL(postFx.grainColor || '#ffffff');
            gl.uniform3f(eng.getUniform(prog, 'u_grainColor'), gc[0], gc[1], gc[2]);
            gl.uniform1f(eng.getUniform(prog, 'u_sharpen'), 0);
            gl.uniform1f(eng.getUniform(prog, 'u_loopDuration'), Studio.Core.RenderPipeline._loopDuration || 0);

            // Split layout uniforms
            var layer = Studio.Systems.State.getSelectedLayer();
            var splitSide = (layer && layer.params.splitSide) ? Math.round(layer.params.splitSide) : 0;
            var splitRatio = (layer && layer.params.splitRatio) || 0.5;
            gl.uniform1i(eng.getUniform(prog, 'u_splitSide'), splitSide);
            gl.uniform1f(eng.getUniform(prog, 'u_splitRatio'), splitRatio);

            // Auto-detect solid color: white for light themes, black for dark
            var sc = [0, 0, 0];
            if (layer) {
                if (layer.autoTheme === 'light') {
                    sc = [1, 1, 1];
                } else {
                    var colors = Studio.Systems.State.getColors(layer);
                    if (colors.length > 0) {
                        var c0 = colors[0];
                        var lum = c0[0] * 0.299 + c0[1] * 0.587 + c0[2] * 0.114;
                        if (lum > 0.5) sc = [1, 1, 1];
                    }
                }
            }
            gl.uniform3f(eng.getUniform(prog, 'u_splitColor'), sc[0], sc[1], sc[2]);

            eng.drawQuad(prog);
        }
    };
})();
