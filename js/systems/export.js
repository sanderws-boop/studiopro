(function() {
    "use strict";

    Studio.Systems.Export = {
        exportPNG: function(width, height) {
            var gl = Studio.gl;
            var canvas = Studio.canvas;
            var origW = canvas.width, origH = canvas.height;
            canvas.width = width;
            canvas.height = height;
            Studio.Core.RenderPipeline.render();
            gl.finish();

            return new Promise(function(resolve) {
                canvas.toBlob(function(blob) {
                    var patterns = Studio.Core.GLEngine.getAllPatterns();
                    var layer = Studio.Systems.State.getSelectedLayer();
                    var name = layer ? (patterns[layer.patternIndex] || {}).name || 'studio' : 'studio';
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.download = 'studio-' + name.toLowerCase().replace(/\s+/g, '-') + '-' + width + 'x' + height + '-' + Date.now() + '.png';
                    a.href = url;
                    a.click();
                    URL.revokeObjectURL(url);
                    canvas.width = origW;
                    canvas.height = origH;
                    Studio.Core.RenderPipeline.render();
                    resolve();
                }, 'image/png');
            });
        },

        exportWebM: function(duration, fps) {
            var gl = Studio.gl;
            var canvas = Studio.canvas;
            var pipeline = Studio.Core.RenderPipeline;
            pipeline.exporting = true;

            var stream = canvas.captureStream(0);
            var track = stream.getVideoTracks()[0];
            var recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 });
            var chunks = [];

            recorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };

            return new Promise(function(resolve) {
                recorder.onstop = function() {
                    var blob = new Blob(chunks, { type: 'video/webm' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.download = 'studio-' + Date.now() + '.webm';
                    a.href = url;
                    a.click();
                    URL.revokeObjectURL(url);
                    pipeline.exporting = false;
                    resolve();
                };

                recorder.start();
                var startTime = pipeline.anim.time;
                var frameCount = Math.round(fps * duration);
                var frameIndex = 0;

                function renderFrame() {
                    if (frameIndex >= frameCount) {
                        recorder.stop();
                        return;
                    }
                    var t = startTime + (frameIndex / fps);
                    pipeline.render(t);
                    gl.finish();
                    if (track.requestFrame) track.requestFrame();
                    frameIndex++;
                    Studio.Events.emit('export:progress', { current: frameIndex, total: frameCount });
                    requestAnimationFrame(renderFrame);
                }
                renderFrame();
            });
        },

        exportGIF: function(width, fps, duration) {
            var gl = Studio.gl;
            var canvas = Studio.canvas;
            var pipeline = Studio.Core.RenderPipeline;
            var encoder = Studio.Systems.GIFEncoder;
            pipeline.exporting = true;

            var gifH = Math.round(width * 9 / 16);
            var frameCount = Math.round(fps * duration);
            var delay = Math.round(100 / fps);
            var origW = canvas.width, origH = canvas.height;

            canvas.width = width;
            canvas.height = gifH;

            var pixels = new Uint8Array(width * gifH * 4);
            var rawFrames = [];
            var startTime = pipeline.anim.time;

            return new Promise(function(resolve) {
                var i = 0;
                function captureFrame() {
                    if (i >= frameCount) { processFrames(); return; }
                    var t = startTime + (i / fps);
                    pipeline.render(t);
                    gl.finish();
                    gl.readPixels(0, 0, width, gifH, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    var flipped = new Uint8Array(width * gifH * 4);
                    for (var row = 0; row < gifH; row++) {
                        var srcOff = row * width * 4;
                        var dstOff = (gifH - 1 - row) * width * 4;
                        flipped.set(pixels.subarray(srcOff, srcOff + width * 4), dstOff);
                    }
                    rawFrames.push(flipped);
                    i++;
                    Studio.Events.emit('export:progress', { current: i, total: frameCount * 2 });
                    setTimeout(captureFrame, 0);
                }

                function processFrames() {
                    var palette = encoder.medianCutQuantize(rawFrames[0], 256);
                    while (palette.length < 256) palette.push([0,0,0]);
                    var indexedFrames = [];
                    for (var fi = 0; fi < rawFrames.length; fi++) {
                        var px = rawFrames[fi];
                        var indexed = new Uint8Array(width * gifH);
                        for (var j = 0; j < width * gifH; j++) {
                            var off = j * 4;
                            indexed[j] = encoder.nearestPaletteIndex(palette, px[off], px[off+1], px[off+2]);
                        }
                        indexedFrames.push(indexed);
                        Studio.Events.emit('export:progress', { current: frameCount + fi, total: frameCount * 2 });
                    }
                    var gifData = encoder.buildGIF(indexedFrames, palette, width, gifH, delay);
                    var blob = new Blob([gifData], { type: 'image/gif' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.download = 'studio-' + Date.now() + '.gif';
                    a.href = url;
                    a.click();
                    URL.revokeObjectURL(url);
                    canvas.width = origW;
                    canvas.height = origH;
                    pipeline.render();
                    pipeline.exporting = false;
                    resolve();
                }

                captureFrame();
            });
        },

        exportCSS: function() {
            var layer = Studio.Systems.State.getSelectedLayer();
            if (!layer) { Studio.UI.Toasts.show('No layer selected', 'error'); return ''; }
            var pal = Studio.Data.Palettes[layer.paletteIndex];
            if (!pal) { Studio.UI.Toasts.show('No palette', 'error'); return ''; }
            var stops = pal.colors.map(function(c, i) {
                return c + ' ' + Math.round(i / (pal.colors.length - 1) * 100) + '%';
            }).join(', ');
            var css = 'background: linear-gradient(135deg, ' + stops + ');';
            if (navigator.clipboard) {
                navigator.clipboard.writeText(css).then(function() {
                    Studio.UI.Toasts.show('CSS copied to clipboard', 'success');
                });
            } else {
                // Fallback
                var ta = document.createElement('textarea');
                ta.value = css;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                Studio.UI.Toasts.show('CSS copied to clipboard', 'success');
            }
            return css;
        }
    };
})();
