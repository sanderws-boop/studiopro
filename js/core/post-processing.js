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
            gl.uniform1f(eng.getUniform(prog, 'u_sharpen'), postFx.sharpen || 0);
            eng.drawQuad(prog);
        }
    };
})();
