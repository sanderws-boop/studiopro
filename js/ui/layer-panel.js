(function() {
    "use strict";

    var listEl, addBtn;

    Studio.UI.LayerPanel = {
        init: function() {
            var self = this;
            listEl = document.getElementById('layer-list');
            addBtn = document.getElementById('btn-add-layer');

            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    Studio.Systems.State.addLayer();
                });
            }

            Studio.Events.on('state:layersChanged', function() { self.render(); });
            Studio.Events.on('state:layerSelected', function() { self._updateSelection(); });

            this.render();

            // Setup drag-drop
            if (listEl) {
                Studio.UI.DragDrop.makeDraggable(listEl, '.layer-item', function(fromIdx, toIdx) {
                    Studio.Systems.State.moveLayer(fromIdx, toIdx);
                    Studio.Systems.History.push();
                });
            }
        },

        render: function() {
            if (!listEl) {
                listEl = document.getElementById('layer-list');
                if (!listEl) return;
            }

            var state = Studio.Systems.State;
            var layers = state.layers;
            var patterns = Studio.Core.GLEngine ? Studio.Core.GLEngine.getAllPatterns() : [];
            var blendModes = Studio.Shaders.BLEND_MODES || [];

            var html = '';
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var patName = (patterns[layer.patternIndex] || {}).name || 'Unknown';
                var isSelected = i === state.selectedLayerIndex;

                html += '<div class="layer-item' + (isSelected ? ' selected' : '') + (layer.visible ? '' : ' hidden-layer') + '" data-index="' + i + '">';
                html += '<div class="layer-drag-handle"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg></div>';
                html += '<canvas class="layer-thumb" width="32" height="32" data-layer="' + i + '"></canvas>';
                html += '<div class="layer-info">';
                html += '<span class="layer-name">' + patName + '</span>';

                // Blend mode select
                html += '<select class="layer-blend-select" data-index="' + i + '">';
                for (var b = 0; b < blendModes.length; b++) {
                    html += '<option value="' + blendModes[b].id + '"' + (layer.blendMode === blendModes[b].id ? ' selected' : '') + '>' + blendModes[b].name + '</option>';
                }
                html += '</select>';
                html += '</div>';

                // Opacity slider
                html += '<input type="range" class="layer-opacity" data-index="' + i + '" min="0" max="1" step="0.01" value="' + layer.opacity + '" title="Opacity: ' + Math.round(layer.opacity * 100) + '%">';

                // Visibility toggle
                html += '<button class="layer-btn layer-visibility" data-index="' + i + '" title="' + (layer.visible ? 'Hide' : 'Show') + '">';
                html += layer.visible ?
                    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' :
                    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
                html += '</button>';

                // Delete button
                html += '<button class="layer-btn layer-delete" data-index="' + i + '" title="Delete"' + (layers.length <= 1 ? ' disabled' : '') + '>';
                html += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
                html += '</button>';

                html += '</div>';
            }

            listEl.innerHTML = html;
            this._bindEvents();
            this._drawThumbnails();
        },

        _bindEvents: function() {
            if (!listEl) return;

            // Layer selection
            var items = listEl.querySelectorAll('.layer-item');
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    item.addEventListener('click', function(e) {
                        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('input') || e.target.closest('.layer-drag-handle')) return;
                        var idx = parseInt(item.dataset.index, 10);
                        Studio.Systems.State.selectLayer(idx);
                    });
                })(items[i]);
            }

            // Visibility toggle
            var visBtns = listEl.querySelectorAll('.layer-visibility');
            for (var v = 0; v < visBtns.length; v++) {
                (function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(btn.dataset.index, 10);
                        var layer = Studio.Systems.State.layers[idx];
                        if (layer) {
                            layer.visible = !layer.visible;
                            Studio.Events.emit('state:layersChanged');
                            Studio.Systems.History.push();
                        }
                    });
                })(visBtns[v]);
            }

            // Delete
            var delBtns = listEl.querySelectorAll('.layer-delete');
            for (var d = 0; d < delBtns.length; d++) {
                (function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(btn.dataset.index, 10);
                        Studio.Systems.State.removeLayer(idx);
                    });
                })(delBtns[d]);
            }

            // Blend mode
            var blendSelects = listEl.querySelectorAll('.layer-blend-select');
            for (var b = 0; b < blendSelects.length; b++) {
                (function(sel) {
                    sel.addEventListener('change', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(sel.dataset.index, 10);
                        var layer = Studio.Systems.State.layers[idx];
                        if (layer) {
                            layer.blendMode = parseInt(sel.value, 10);
                            Studio.Events.emit('state:layersChanged');
                            Studio.Systems.History.push();
                        }
                    });
                })(blendSelects[b]);
            }

            // Opacity
            var opSliders = listEl.querySelectorAll('.layer-opacity');
            for (var o = 0; o < opSliders.length; o++) {
                (function(slider) {
                    slider.addEventListener('input', function(e) {
                        e.stopPropagation();
                        var idx = parseInt(slider.dataset.index, 10);
                        var layer = Studio.Systems.State.layers[idx];
                        if (layer) {
                            layer.opacity = parseFloat(slider.value);
                            slider.title = 'Opacity: ' + Math.round(layer.opacity * 100) + '%';
                            Studio.Events.emit('state:layersChanged');
                        }
                    });
                    slider.addEventListener('change', function() {
                        Studio.Systems.History.push();
                    });
                })(opSliders[o]);
            }
        },

        _updateSelection: function() {
            if (!listEl) return;
            var idx = Studio.Systems.State.selectedLayerIndex;
            var items = listEl.querySelectorAll('.layer-item');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.toggle('selected', parseInt(items[i].dataset.index, 10) === idx);
            }
        },

        _drawThumbnails: function() {
            var canvases = listEl.querySelectorAll('.layer-thumb');
            for (var i = 0; i < canvases.length; i++) {
                var layerIdx = parseInt(canvases[i].dataset.layer, 10);
                var layer = Studio.Systems.State.layers[layerIdx];
                if (!layer) continue;

                var ctx = canvases[i].getContext('2d');
                var palette = Studio.Data.Palettes[layer.paletteIndex];
                if (!palette || !ctx) continue;

                var grad = ctx.createLinearGradient(0, 0, 32, 32);
                for (var j = 0; j < palette.colors.length; j++) {
                    grad.addColorStop(j / (palette.colors.length - 1), palette.colors[j]);
                }
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 32, 32);
            }
        }
    };
})();
