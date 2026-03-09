(function() {
    "use strict";

    var panelEl, tracksEl, playheadEl, rulerEl, timelineBar;
    var pixelsPerSecond = 60;
    var scrollOffset = 0;
    var isDraggingPlayhead = false;

    function calcPixelsPerSecond() {
        var body = document.querySelector('.timeline-body');
        if (!body) return 60;
        var w = body.clientWidth - 80; // subtract track label width
        var dur = Studio.Systems.State.timeline.duration || 4;
        return Math.max(40, w / dur);
    }

    Studio.UI.TimelineUI = {
        init: function() {
            var self = this;
            panelEl = document.querySelector('.timeline-panel');
            tracksEl = document.getElementById('timeline-tracks');
            playheadEl = document.getElementById('timeline-playhead');
            rulerEl = document.getElementById('timeline-ruler');
            timelineBar = document.getElementById('timeline-bar');

            // Toggle collapse
            var collapseBtn = document.getElementById('btn-timeline-toggle');
            if (collapseBtn) {
                collapseBtn.addEventListener('click', function() {
                    document.querySelector('.app-layout').classList.toggle('timeline-collapsed');
                    setTimeout(function() { Studio.Events.emit('gl:resize'); }, 300);
                });
            }

            // Duration control
            var durInput = document.getElementById('timeline-duration');
            if (durInput) {
                durInput.value = Studio.Systems.State.timeline.duration;
                durInput.addEventListener('change', function() {
                    var val = parseFloat(durInput.value);
                    if (val >= 1 && val <= 10) {
                        Studio.Systems.State.timeline.duration = val;
                        Studio.Events.emit('state:timelineChanged');
                        self.render();
                    }
                });
            }

            // Playhead drag
            if (timelineBar) {
                timelineBar.addEventListener('mousedown', function(e) {
                    if (e.target.closest('.keyframe-diamond')) return;
                    isDraggingPlayhead = true;
                    self._seekToMouse(e);
                });
                document.addEventListener('mousemove', function(e) {
                    if (isDraggingPlayhead) self._seekToMouse(e);
                });
                document.addEventListener('mouseup', function() {
                    isDraggingPlayhead = false;
                });
            }

            // Add keyframe button
            var addKfBtn = document.getElementById('btn-add-keyframe');
            if (addKfBtn) {
                addKfBtn.addEventListener('click', function() {
                    self._addKeyframeAtPlayhead();
                });
            }

            // Update on events
            Studio.Events.on('state:layersChanged', function() { self.render(); });
            Studio.Events.on('state:layerSelected', function() { self.render(); });
            Studio.Events.on('state:timelineChanged', function() { self.render(); });
            Studio.Events.on('render:frame', function(time) { self._updatePlayhead(time); });
            window.addEventListener('resize', function() { self.render(); });

            this.render();
        },

        render: function() {
            pixelsPerSecond = calcPixelsPerSecond();
            this._drawRuler();
            this._drawTracks();
        },

        _drawRuler: function() {
            if (!rulerEl) return;
            var duration = Studio.Systems.State.timeline.duration;
            var totalWidth = duration * pixelsPerSecond;

            var html = '';
            for (var t = 0; t <= duration; t++) {
                var x = t * pixelsPerSecond;
                html += '<div class="ruler-mark" style="left: ' + x + 'px">';
                html += '<span class="ruler-label">' + t + 's</span>';
                html += '</div>';

                // Half-second marks
                if (t < duration) {
                    html += '<div class="ruler-mark minor" style="left: ' + (x + pixelsPerSecond / 2) + 'px"></div>';
                }
            }
            rulerEl.innerHTML = html;
            rulerEl.style.width = totalWidth + 'px';
        },

        _drawTracks: function() {
            if (!tracksEl) return;
            var state = Studio.Systems.State;
            var layers = state.layers;
            var timeline = Studio.Systems.TimelineEngine;
            var duration = state.timeline.duration;
            var totalWidth = duration * pixelsPerSecond;
            var patterns = Studio.Core.GLEngine ? Studio.Core.GLEngine.getAllPatterns() : [];

            var html = '';
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var patName = (patterns[layer.patternIndex] || {}).name || 'Layer ' + (i + 1);
                var isSelected = i === state.selectedLayerIndex;

                html += '<div class="timeline-track' + (isSelected ? ' selected' : '') + '" data-layer="' + i + '" style="width: ' + totalWidth + 'px">';
                html += '<div class="track-label">' + patName + '</div>';
                html += '<div class="track-bar">';

                // Draw keyframes
                var layerKfs = timeline ? timeline.getLayerKeyframes(layer.id) : {};
                for (var param in layerKfs) {
                    var kfs = layerKfs[param];
                    for (var k = 0; k < kfs.length; k++) {
                        var kf = kfs[k];
                        var x = kf.time * pixelsPerSecond;
                        html += '<div class="keyframe-diamond" data-layer-id="' + layer.id + '" data-param="' + param + '" data-time="' + kf.time + '" style="left: ' + x + 'px" title="' + param + ': ' + kf.value.toFixed(2) + ' @ ' + kf.time.toFixed(1) + 's"></div>';
                    }
                }

                html += '</div></div>';
            }
            tracksEl.innerHTML = html;
            if (timelineBar) timelineBar.style.width = totalWidth + 'px';

            // Bind track selection
            var tracks = tracksEl.querySelectorAll('.timeline-track');
            for (var j = 0; j < tracks.length; j++) {
                (function(track) {
                    track.addEventListener('click', function(e) {
                        if (e.target.closest('.keyframe-diamond')) return;
                        var idx = parseInt(track.dataset.layer, 10);
                        Studio.Systems.State.selectLayer(idx);
                    });
                })(tracks[j]);
            }

            // Bind keyframe clicks (delete on double-click)
            var diamonds = tracksEl.querySelectorAll('.keyframe-diamond');
            for (var d = 0; d < diamonds.length; d++) {
                (function(diamond) {
                    diamond.addEventListener('dblclick', function(e) {
                        e.stopPropagation();
                        var layerId = diamond.dataset.layerId;
                        var param = diamond.dataset.param;
                        var time = parseFloat(diamond.dataset.time);
                        if (timeline) {
                            timeline.removeKeyframe(layerId, param, time);
                            Studio.Events.emit('state:timelineChanged');
                        }
                    });
                })(diamonds[d]);
            }
        },

        _updatePlayhead: function(time) {
            if (!playheadEl || isDraggingPlayhead) return;
            var x = time * pixelsPerSecond;
            playheadEl.style.left = x + 'px';
        },

        _seekToMouse: function(e) {
            if (!timelineBar) return;
            var rect = timelineBar.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var duration = Studio.Systems.State.timeline.duration;
            var time = Math.max(0, Math.min(duration, x / pixelsPerSecond));

            if (playheadEl) playheadEl.style.left = (time * pixelsPerSecond) + 'px';

            // Seek render pipeline
            if (Studio.Core.RenderPipeline) {
                Studio.Core.RenderPipeline.seek(time);
            }
        },

        _addKeyframeAtPlayhead: function() {
            var state = Studio.Systems.State;
            var layer = state.getSelectedLayer();
            if (!layer) return;

            var timeline = Studio.Systems.TimelineEngine;
            if (!timeline) return;

            var currentTime = 0;
            if (Studio.Core.RenderPipeline && Studio.Core.RenderPipeline.getCurrentTime) {
                currentTime = Studio.Core.RenderPipeline.getCurrentTime();
            }

            // Add keyframes for main params
            var params = ['seed', 'scale', 'warp', 'angle'];
            for (var i = 0; i < params.length; i++) {
                var val = layer.params[params[i]];
                if (val !== undefined) {
                    timeline.addKeyframe(layer.id, params[i], currentTime, val, 'easeInOut');
                }
            }

            Studio.Events.emit('state:timelineChanged');
            Studio.UI.Toasts.show('Keyframe added at ' + currentTime.toFixed(1) + 's', 'success');
        }
    };
})();
