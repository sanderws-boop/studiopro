(function() {
    "use strict";

    var layerFBOs = [];
    var compositeA = null, compositeB = null;

    Studio.Core.LayerCompositor = {
        init: function() {},

        ensureFBOs: function(gl, count, w, h) {
            while (layerFBOs.length < count) {
                layerFBOs.push(Studio.Core.GLEngine.createFBO(w, h, true));
            }
            for (var i = 0; i < layerFBOs.length; i++) {
                layerFBOs[i] = Studio.Core.GLEngine.resizeFBO(layerFBOs[i], w, h, true);
            }
            compositeA = Studio.Core.GLEngine.resizeFBO(compositeA, w, h, true);
            compositeB = Studio.Core.GLEngine.resizeFBO(compositeB, w, h, true);
        },

        getLayerFBO: function(index) {
            return layerFBOs[index];
        },

        composite: function(gl, layers) {
            var eng = Studio.Core.GLEngine;
            var blendProg = eng._blendProg;
            if (!blendProg) return compositeA;

            // Find first visible layer
            var firstVisible = -1;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].visible) { firstVisible = i; break; }
            }
            if (firstVisible < 0) return compositeA;

            // Copy first visible layer to compositeA
            this._copyFBO(gl, layerFBOs[firstVisible], compositeA);

            // Blend subsequent visible layers
            var current = compositeA;
            var target = compositeB;

            for (var i = firstVisible + 1; i < layers.length; i++) {
                if (!layers[i].visible) continue;

                gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
                gl.viewport(0, 0, target.w, target.h);

                gl.useProgram(blendProg);
                eng.bindTexture(0, current.tex);
                gl.uniform1i(eng.getUniform(blendProg, 'u_base'), 0);
                eng.bindTexture(1, layerFBOs[i].tex);
                gl.uniform1i(eng.getUniform(blendProg, 'u_layer'), 1);
                gl.uniform1i(eng.getUniform(blendProg, 'u_blendMode'), layers[i].blendMode);
                gl.uniform1f(eng.getUniform(blendProg, 'u_opacity'), layers[i].opacity);
                eng.drawQuad(blendProg);

                // Swap
                var tmp = current;
                current = target;
                target = tmp;
            }

            return current;
        },

        _copyFBO: function(gl, src, dst) {
            var eng = Studio.Core.GLEngine;
            var copyProg = eng._copyProg;
            if (!copyProg) return;
            gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
            gl.viewport(0, 0, dst.w, dst.h);
            gl.useProgram(copyProg);
            eng.bindTexture(0, src.tex);
            gl.uniform1i(eng.getUniform(copyProg, 'u_src'), 0);
            eng.drawQuad(copyProg);
        }
    };
})();
