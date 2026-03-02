(function() {
    "use strict";

    var anim = { time: 0, playing: true, speed: 1, lastFrame: 0 };
    var running = false;

    Studio.Core.RenderPipeline = {
        anim: anim,
        exporting: false,

        init: function() {
            var state = Studio.Systems.State;
            anim.time = 0;
            anim.playing = state.playing;
            anim.speed = state.speed;
            anim.lastFrame = performance.now();

            // Listen for state changes
            Studio.Events.on('toolbar:togglePlay', function() {
                anim.playing = !anim.playing;
                state.playing = anim.playing;
                anim.lastFrame = performance.now();
            });
            Studio.Events.on('state:speedChanged', function(spd) {
                anim.speed = spd;
            });
        },

        renderPattern: function(patternIndex, params, colors, w, h, time) {
            var gl = Studio.gl;
            var eng = Studio.Core.GLEngine;
            var prog = eng.getPatternProgram(patternIndex);
            if (!prog) return;

            gl.useProgram(prog);
            gl.uniform2f(eng.getUniform(prog, 'u_resolution'), w, h);
            gl.uniform1f(eng.getUniform(prog, 'u_time'), time);
            gl.uniform1f(eng.getUniform(prog, 'u_seed'), params.seed);
            gl.uniform1f(eng.getUniform(prog, 'u_scale'), params.scale);
            gl.uniform1f(eng.getUniform(prog, 'u_warp'), params.warp);
            gl.uniform1f(eng.getUniform(prog, 'u_grain'), params.grain || 0);
            gl.uniform1f(eng.getUniform(prog, 'u_bloom'), 0);
            gl.uniform1f(eng.getUniform(prog, 'u_vignette'), 0);
            gl.uniform2f(eng.getUniform(prog, 'u_focal'), 0.382, 0.45);

            for (var i = 0; i < 5; i++) {
                var c = i < colors.length ? colors[i] : colors[colors.length - 1];
                gl.uniform3f(eng.getUniform(prog, 'u_colors[' + i + ']'), c[0], c[1], c[2]);
            }
            gl.uniform1i(eng.getUniform(prog, 'u_numColors'), colors.length);
            eng.drawQuad(prog);
        },

        resolveParams: function(layer, time) {
            var params = {
                seed: layer.params.seed,
                scale: layer.params.scale,
                warp: layer.params.warp,
                grain: layer.params.grain || 0
            };

            // Apply timeline keyframes
            var te = Studio.Systems.TimelineEngine;
            if (te) {
                var paramNames = ['seed', 'scale', 'warp', 'grain'];
                for (var i = 0; i < paramNames.length; i++) {
                    var val = te.evaluate(layer.id, paramNames[i], time);
                    if (val !== null) params[paramNames[i]] = val;
                }
            }

            // Apply audio reactivity
            var audio = Studio.Systems.Audio;
            if (audio) {
                var pn = ['seed', 'scale', 'warp', 'grain'];
                for (var j = 0; j < pn.length; j++) {
                    params[pn[j]] = audio.applyToParam(pn[j], params[pn[j]], layer.id);
                }
            }

            return params;
        },

        render: function(overrideTime) {
            var gl = Studio.gl;
            if (!gl) return;

            var eng = Studio.Core.GLEngine;
            var state = Studio.Systems.State;
            var layers = state.layers;
            if (!layers || layers.length === 0) return;
            var w = Studio.canvas.width;
            var h = Studio.canvas.height;
            if (w === 0 || h === 0) return;
            var time = overrideTime !== undefined ? overrideTime : anim.time;

            // Ensure FBOs
            Studio.Core.LayerCompositor.ensureFBOs(gl, layers.length, w, h);
            Studio.Core.PostProcessing.ensureFBOs(gl, w, h);

            // Render each layer to its FBO
            for (var i = 0; i < layers.length; i++) {
                if (!layers[i].visible) continue;
                var layer = layers[i];
                var params = this.resolveParams(layer, time);
                var colors = state.getColors(layer);
                var fbo = Studio.Core.LayerCompositor.getLayerFBO(i);
                if (!fbo) continue;

                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fb);
                gl.viewport(0, 0, w, h);
                this.renderPattern(layer.patternIndex, params, colors, w, h, time);
            }

            // Composite layers
            var compositedFBO = Studio.Core.LayerCompositor.composite(gl, layers);
            if (!compositedFBO) return;

            // Apply bloom
            var bloomResult = Studio.Core.PostProcessing.applyBloom(gl, compositedFBO, state.postFx.bloom);

            // Final composite to screen
            Studio.Core.PostProcessing.applyComposite(gl, bloomResult || compositedFBO, w, h, time);
        },

        _tick: function(now) {
            var self = Studio.Core.RenderPipeline;
            if (!self.exporting) {
                if (anim.playing) {
                    var dt = (now - anim.lastFrame) / 1000;
                    if (dt > 0.1) dt = 0.016;
                    anim.time += dt * anim.speed;
                    Studio.Systems.State.timeline.currentTime = anim.time;
                }
                anim.lastFrame = now;

                Studio.Events.emit('render:frame', anim.time);

                if (Studio.Systems.Audio) Studio.Systems.Audio.update();

                Studio.Core.GLEngine.resizeCanvas();
                self.render();
            }
        },

        loop: function(now) {
            var self = Studio.Core.RenderPipeline;
            try {
                self._tick(now);
            } catch(e) {
                console.error('[Studio Pro] Render error:', e);
            }
            requestAnimationFrame(self.loop);
        },

        seek: function(time) {
            anim.time = time;
            anim.lastFrame = performance.now();
            Studio.Systems.State.timeline.currentTime = time;
            this.render(time);
        },

        getCurrentTime: function() {
            return anim.time;
        },

        setTime: function(time) {
            this.seek(time);
        },

        start: function() {
            if (running) return;
            running = true;
            anim.lastFrame = performance.now();

            // Ensure canvas is properly sized before first render
            Studio.Core.GLEngine.resizeCanvas();

            requestAnimationFrame(this.loop);
        }
    };
})();
