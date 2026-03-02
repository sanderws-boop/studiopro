(function() {
    "use strict";

    var containerEl;

    // Parameter definitions
    var PARAMS = [
        { key: 'seed', label: 'Seed', min: 0, max: 1000, step: 0.1, default: 0 },
        { key: 'scale', label: 'Scale', min: 0.1, max: 20, step: 0.1, default: 1 },
        { key: 'warp', label: 'Warp', min: 0, max: 5, step: 0.01, default: 0 },
        { key: 'speed', label: 'Animation Speed', min: 0, max: 5, step: 0.1, default: 1 },
        { key: 'complexity', label: 'Complexity', min: 0.1, max: 10, step: 0.1, default: 1 },
        { key: 'brightness', label: 'Brightness', min: 0, max: 2, step: 0.01, default: 1 },
        { key: 'contrast', label: 'Contrast', min: 0, max: 2, step: 0.01, default: 1 }
    ];

    var POSTFX_PARAMS = [
        { key: 'bloom', label: 'Bloom', min: 0, max: 2, step: 0.01, default: 0 },
        { key: 'bloomRadius', label: 'Bloom Radius', min: 0.1, max: 4, step: 0.1, default: 1 },
        { key: 'chromatic', label: 'Chromatic Aberration', min: 0, max: 0.05, step: 0.001, default: 0 },
        { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01, default: 0.2 },
        { key: 'filmGrain', label: 'Film Grain', min: 0, max: 0.5, step: 0.01, default: 0.02 },
        { key: 'sharpen', label: 'Sharpen', min: 0, max: 2, step: 0.01, default: 0 },
        { key: 'lensDistortion', label: 'Lens Distortion', min: -0.5, max: 0.5, step: 0.01, default: 0 },
        { key: 'shadowTint', label: 'Shadow Tint', type: 'color', default: '#1a1a2e' },
        { key: 'highlightTint', label: 'Highlight Tint', type: 'color', default: '#fffff0' },
        { key: 'colorGrading', label: 'Color Grading', min: 0, max: 1, step: 0.01, default: 0 }
    ];

    Studio.UI.PropertiesPanel = {
        init: function() {
            var self = this;
            containerEl = document.getElementById('properties-content');

            Studio.Events.on('state:layerSelected', function() { self.render(); });
            Studio.Events.on('state:layersChanged', function() { self.render(); });
            Studio.Events.on('state:postFxChanged', function() { self._updatePostFxValues(); });

            this.render();
        },

        render: function() {
            if (!containerEl) {
                containerEl = document.getElementById('properties-content');
                if (!containerEl) return;
            }

            var layer = Studio.Systems.State.getSelectedLayer();
            var html = '';

            // Layer parameters
            html += '<div class="panel-section"><div class="section-title">Layer Parameters</div>';
            if (layer) {
                for (var i = 0; i < PARAMS.length; i++) {
                    var p = PARAMS[i];
                    var val = layer.params[p.key] !== undefined ? layer.params[p.key] : p.default;
                    html += this._buildSlider(p, val, 'layer');
                }
            } else {
                html += '<div style="color: var(--text-tertiary); font-size: 11px;">No layer selected</div>';
            }
            html += '</div>';

            // Post-processing
            html += '<div class="panel-section"><div class="section-title">Post-Processing</div>';
            var postFx = Studio.Systems.State.postFx;
            for (var j = 0; j < POSTFX_PARAMS.length; j++) {
                var pf = POSTFX_PARAMS[j];
                var pfVal = postFx[pf.key] !== undefined ? postFx[pf.key] : pf.default;
                if (pf.type === 'color') {
                    html += this._buildColorInput(pf, pfVal);
                } else {
                    html += this._buildSlider(pf, pfVal, 'postfx');
                }
            }
            html += '</div>';

            containerEl.innerHTML = html;
            this._bindSliders();
        },

        _buildSlider: function(param, value, group) {
            var pct = ((value - param.min) / (param.max - param.min)) * 100;
            return '<div class="param-row">' +
                '<label class="param-label">' + param.label + '</label>' +
                '<div class="param-controls">' +
                '<input type="range" class="slider" data-key="' + param.key + '" data-group="' + group + '" ' +
                'min="' + param.min + '" max="' + param.max + '" step="' + param.step + '" value="' + value + '" ' +
                'style="--pct: ' + pct + '%">' +
                '<input type="number" class="param-value" data-key="' + param.key + '" data-group="' + group + '" ' +
                'min="' + param.min + '" max="' + param.max + '" step="' + param.step + '" value="' + this._formatNum(value, param.step) + '">' +
                '</div></div>';
        },

        _buildColorInput: function(param, value) {
            return '<div class="param-row">' +
                '<label class="param-label">' + param.label + '</label>' +
                '<div class="param-controls">' +
                '<input type="color" class="param-color" data-key="' + param.key + '" data-group="postfx" value="' + value + '">' +
                '</div></div>';
        },

        _formatNum: function(val, step) {
            if (step >= 1) return Math.round(val);
            var decimals = (step.toString().split('.')[1] || '').length;
            return parseFloat(val).toFixed(decimals);
        },

        _bindSliders: function() {
            if (!containerEl) return;
            var self = this;

            // Range sliders
            var sliders = containerEl.querySelectorAll('input[type="range"]');
            for (var i = 0; i < sliders.length; i++) {
                (function(slider) {
                    slider.addEventListener('input', function() {
                        var key = slider.dataset.key;
                        var group = slider.dataset.group;
                        var val = parseFloat(slider.value);

                        // Update matching number input
                        var numInput = containerEl.querySelector('input[type="number"][data-key="' + key + '"][data-group="' + group + '"]');
                        if (numInput) {
                            var step = parseFloat(slider.step) || 0.01;
                            numInput.value = self._formatNum(val, step);
                        }

                        // Update track fill
                        var min = parseFloat(slider.min);
                        var max = parseFloat(slider.max);
                        slider.style.setProperty('--pct', ((val - min) / (max - min)) * 100 + '%');

                        self._applyValue(group, key, val);
                    });
                    slider.addEventListener('change', function() {
                        Studio.Systems.History.push();
                    });
                })(sliders[i]);
            }

            // Number inputs
            var numInputs = containerEl.querySelectorAll('input[type="number"]');
            for (var j = 0; j < numInputs.length; j++) {
                (function(numInput) {
                    numInput.addEventListener('input', function() {
                        var key = numInput.dataset.key;
                        var group = numInput.dataset.group;
                        var val = parseFloat(numInput.value);
                        if (isNaN(val)) return;

                        // Update matching slider
                        var slider = containerEl.querySelector('input[type="range"][data-key="' + key + '"][data-group="' + group + '"]');
                        if (slider) {
                            slider.value = val;
                            var min = parseFloat(slider.min);
                            var max = parseFloat(slider.max);
                            slider.style.setProperty('--pct', ((val - min) / (max - min)) * 100 + '%');
                        }

                        self._applyValue(group, key, val);
                    });
                    numInput.addEventListener('change', function() {
                        Studio.Systems.History.push();
                    });
                })(numInputs[j]);
            }

            // Color inputs
            var colorInputs = containerEl.querySelectorAll('input.param-color');
            for (var k = 0; k < colorInputs.length; k++) {
                (function(colorInput) {
                    colorInput.addEventListener('input', function() {
                        var key = colorInput.dataset.key;
                        Studio.Systems.State.updatePostFx(key, colorInput.value);
                    });
                    colorInput.addEventListener('change', function() {
                        Studio.Systems.History.push();
                    });
                })(colorInputs[k]);
            }
        },

        _applyValue: function(group, key, val) {
            if (group === 'layer') {
                var li = Studio.Systems.State.selectedLayerIndex;
                Studio.Systems.State.updateLayerParam(li, key, val);
            } else if (group === 'postfx') {
                Studio.Systems.State.updatePostFx(key, val);
            }
        },

        _updatePostFxValues: function() {
            if (!containerEl) return;
            var postFx = Studio.Systems.State.postFx;
            var sliders = containerEl.querySelectorAll('input[type="range"][data-group="postfx"]');
            for (var i = 0; i < sliders.length; i++) {
                var key = sliders[i].dataset.key;
                if (postFx[key] !== undefined) {
                    sliders[i].value = postFx[key];
                    var min = parseFloat(sliders[i].min);
                    var max = parseFloat(sliders[i].max);
                    sliders[i].style.setProperty('--pct', ((postFx[key] - min) / (max - min)) * 100 + '%');
                }
            }
        }
    };
})();
