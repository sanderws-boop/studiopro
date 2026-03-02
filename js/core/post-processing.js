(function() {
    "use strict";

    var bloomFBOs = [];
    var BLOOM_PASSES = 4;

    // Convert hex tint color to shader multiplier (centered around 1.0)
    function tintToMultiplier(hex) {
        if (!hex || typeof hex !== 'string') return [1, 1, 1];
        var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!r) return [1, 1, 1];
        // Normalize to 0-1, then remap so midgray(0.5) = 1.0 multiplier
        var rgb = [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255];
        return [0.9 + rgb[0] * 0.2, 0.9 + rgb[1] * 0.2, 0.9 + rgb[2] * 0.2];
    }

    function getColorGrade(postFx, which) {
        var arr = which === 'shadows' ? postFx.colorGradeShadows : postFx.colorGradeHighlights;
        var hex = which === 'shadows' ? postFx.shadowTint : postFx.highlightTint;
        if (hex && typeof hex === 'string') return tintToMultiplier(hex);
        if (arr && arr.length === 3) return arr;
        return [1, 1, 1];
    }

    Studio.Core.PostProcessing = {
        init: function() {},

        ensureFBOs: function(gl, w, h) {
            var bw = Math.floor(w / 2), bh = Math.floor(h / 2);
            while (bloomFBOs.length < BLOOM_PASSES * 2) {
                bloomFBOs.push(null);
            }
            for (var i = 0; i < BLOOM_PASSES; i++) {
                bloomFBOs[i] = Studio.Core.GLEngine.resizeFBO(bloomFBOs[i], bw, bh, true);
                bloomFBOs[i + BLOOM_PASSES] = Studio.Core.GLEngine.resizeFBO(bloomFBOs[i + BLOOM_PASSES], bw, bh, true);
                bw = Math.max(1, Math.floor(bw / 2));
                bh = Math.max(1, Math.floor(bh / 2));
            }
        },

        applyBloom: function(gl, srcFBO, intensity) {
            if (intensity < 0.01) return srcFBO;
            var eng = Studio.Core.GLEngine;
            var downProg = eng._bloomDownProg;
            var upProg = eng._bloomUpProg;
            if (!downProg || !upProg) return srcFBO;

            // Downsample chain
            var currentTex = srcFBO.tex;
            var currentW = srcFBO.w, currentH = srcFBO.h;

            for (var i = 0; i < BLOOM_PASSES; i++) {
                var fbo = bloomFBOs[i];
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fb);
                gl.viewport(0, 0, fbo.w, fbo.h);
                gl.useProgram(downProg);
                eng.bindTexture(0, currentTex);
                gl.uniform1i(eng.getUniform(downProg, 'u_src'), 0);
                gl.uniform2f(eng.getUniform(downProg, 'u_texelSize'), 1.0/currentW, 1.0/currentH);
                eng.drawQuad(downProg);
                currentTex = fbo.tex;
                currentW = fbo.w;
                currentH = fbo.h;
            }

            // Upsample chain - blend back into source
            for (var i = BLOOM_PASSES - 1; i >= 0; i--) {
                var targetFBO = i > 0 ? bloomFBOs[i - 1 + BLOOM_PASSES] : bloomFBOs[BLOOM_PASSES];
                var srcBloomFBO = bloomFBOs[i];
                var baseTex = i > 0 ? bloomFBOs[i - 1].tex : srcFBO.tex;

                // For the final pass, write back to a bloom output FBO
                if (i === 0) targetFBO = bloomFBOs[BLOOM_PASSES];

                gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fb);
                gl.viewport(0, 0, targetFBO.w, targetFBO.h);
                gl.useProgram(upProg);
                eng.bindTexture(0, baseTex);
                gl.uniform1i(eng.getUniform(upProg, 'u_src'), 0);
                eng.bindTexture(1, srcBloomFBO.tex);
                gl.uniform1i(eng.getUniform(upProg, 'u_bloom'), 1);
                gl.uniform2f(eng.getUniform(upProg, 'u_texelSize'), 1.0/srcBloomFBO.w, 1.0/srcBloomFBO.h);
                gl.uniform1f(eng.getUniform(upProg, 'u_intensity'), intensity);
                eng.drawQuad(upProg);
            }

            return bloomFBOs[BLOOM_PASSES]; // Return bloom result
        },

        applyComposite: function(gl, srcFBO, w, h, time) {
            var eng = Studio.Core.GLEngine;
            var prog = eng._compositeProg;
            if (!prog) return;

            var postFx = Studio.Systems.State.postFx;

            // Render to screen
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, w, h);
            gl.useProgram(prog);
            eng.bindTexture(0, srcFBO.tex);
            gl.uniform1i(eng.getUniform(prog, 'u_src'), 0);
            gl.uniform2f(eng.getUniform(prog, 'u_resolution'), w, h);
            gl.uniform1f(eng.getUniform(prog, 'u_time'), time);
            gl.uniform1f(eng.getUniform(prog, 'u_vignette'), postFx.vignette);
            gl.uniform1f(eng.getUniform(prog, 'u_grain'), postFx.filmGrain || 0);
            gl.uniform1f(eng.getUniform(prog, 'u_chromatic'), postFx.chromatic);
            gl.uniform1f(eng.getUniform(prog, 'u_sharpen'), postFx.sharpen);
            gl.uniform1f(eng.getUniform(prog, 'u_lensDistortion'), postFx.lensDistortion);
            var shadows = getColorGrade(postFx, 'shadows');
            var highlights = getColorGrade(postFx, 'highlights');
            gl.uniform3f(eng.getUniform(prog, 'u_colorGradeShadows'), shadows[0], shadows[1], shadows[2]);
            gl.uniform3f(eng.getUniform(prog, 'u_colorGradeHighlights'), highlights[0], highlights[1], highlights[2]);
            eng.drawQuad(prog);
        },

        // Composite to FBO instead of screen (for export)
        applyCompositeToFBO: function(gl, srcFBO, targetFBO, w, h, time) {
            var eng = Studio.Core.GLEngine;
            var prog = eng._compositeProg;
            if (!prog) return;
            var postFx = Studio.Systems.State.postFx;
            gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fb);
            gl.viewport(0, 0, w, h);
            gl.useProgram(prog);
            eng.bindTexture(0, srcFBO.tex);
            gl.uniform1i(eng.getUniform(prog, 'u_src'), 0);
            gl.uniform2f(eng.getUniform(prog, 'u_resolution'), w, h);
            gl.uniform1f(eng.getUniform(prog, 'u_time'), time);
            gl.uniform1f(eng.getUniform(prog, 'u_vignette'), postFx.vignette);
            gl.uniform1f(eng.getUniform(prog, 'u_grain'), postFx.filmGrain || 0);
            gl.uniform1f(eng.getUniform(prog, 'u_chromatic'), postFx.chromatic);
            gl.uniform1f(eng.getUniform(prog, 'u_sharpen'), postFx.sharpen);
            gl.uniform1f(eng.getUniform(prog, 'u_lensDistortion'), postFx.lensDistortion);
            var shadows2 = getColorGrade(postFx, 'shadows');
            var highlights2 = getColorGrade(postFx, 'highlights');
            gl.uniform3f(eng.getUniform(prog, 'u_colorGradeShadows'), shadows2[0], shadows2[1], shadows2[2]);
            gl.uniform3f(eng.getUniform(prog, 'u_colorGradeHighlights'), highlights2[0], highlights2[1], highlights2[2]);
            eng.drawQuad(prog);
        }
    };
})();
