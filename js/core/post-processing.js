(function() {
    "use strict";

    var layerFBO = null;

    Studio.Core.PostProcessing = {
        init: function() {},

        ensureFBOs: function(gl, w, h) {
            layerFBO = Studio.Core.GLEngine.resizeFBO(layerFBO, w, h, true);
        },

        getLayerFBO: function() {
            return layerFBO;
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
