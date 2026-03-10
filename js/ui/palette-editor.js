(function() {
    "use strict";

    var gridEl, customEl, categoryEl, customBtn;
    var autoEl, autoBtn, autoColorInput, autoToggleEl, autoModeEl;

    // --- HSL helpers ---
    function hexToHSL(hex) {
        var r = parseInt(hex.slice(1,3),16)/255;
        var g = parseInt(hex.slice(3,5),16)/255;
        var b = parseInt(hex.slice(5,7),16)/255;
        var max = Math.max(r,g,b), min = Math.min(r,g,b);
        var h=0, s=0, l=(max+min)/2;
        if (max !== min) {
            var d = max - min;
            s = l > 0.5 ? d/(2-max-min) : d/(max+min);
            if (max === r) h = ((g-b)/d + (g<b?6:0))/6;
            else if (max === g) h = ((b-r)/d + 2)/6;
            else h = ((r-g)/d + 4)/6;
        }
        return [h*360, s*100, l*100];
    }
    function hslToHex(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        var r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q-p)*6*t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q-p)*(2/3-t)*6;
                return p;
            }
            var q = l < 0.5 ? l*(1+s) : l+s-l*s;
            var p = 2*l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        function toHex(c) { var v = Math.round(c*255).toString(16); return v.length===1 ? '0'+v : v; }
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    function generateAutoPalette(hex, isDark, mode) {
        var hsl = hexToHSL(hex);
        var h = hsl[0], s = hsl[1];
        mode = mode || 'balanced';
        if (mode === 'vivid') {
            // Rich tonal extremes — push saturation, dramatic range within same hue
            var sv = Math.min(s * 1.2, 100);
            if (isDark) {
                return [
                    hslToHex(h, s*0.1, 3),
                    hslToHex(h, sv, 18),
                    hex,
                    hslToHex(h, sv, 65),
                    hslToHex(h, s*0.2, 95)
                ];
            } else {
                return [
                    hslToHex(h, s*0.08, 98),
                    hslToHex(h, sv, 80),
                    hex,
                    hslToHex(h, sv, 20),
                    hslToHex(h, s*0.15, 5)
                ];
            }
        } else if (mode === 'tonal') {
            // Harmonious hue shifts — refined contrast through neighboring colors
            var hw = (h + 20 + 360) % 360;
            var hc = (h - 25 + 360) % 360;
            if (isDark) {
                return [
                    hslToHex(hw, s*0.35, 8),
                    hslToHex(hc, s*0.6, 22),
                    hex,
                    hslToHex(hw, s*0.55, 62),
                    hslToHex(hc, s*0.3, 82)
                ];
            } else {
                return [
                    hslToHex(hc, s*0.2, 95),
                    hslToHex(hw, s*0.45, 78),
                    hex,
                    hslToHex(hc, s*0.55, 38),
                    hslToHex(hw, s*0.4, 18)
                ];
            }
        } else {
            // Balanced (default) — safe, professional
            if (isDark) {
                return [
                    hslToHex(h, s*0.3, 6),
                    hslToHex(h, s*0.6, 22),
                    hex,
                    hslToHex(h, s*0.5, 72),
                    hslToHex(h, s*0.25, 90)
                ];
            } else {
                return [
                    hslToHex(h, s*0.15, 96),
                    hslToHex(h, s*0.4, 82),
                    hex,
                    hslToHex(h, s*0.65, 35),
                    hslToHex(h, s*0.55, 20)
                ];
            }
        }
    }

    Studio.UI.PaletteEditor = {
        init: function() {
            var self = this;
            gridEl = document.getElementById('palette-grid');
            customEl = document.getElementById('custom-colors');
            categoryEl = document.getElementById('palette-categories');
            customBtn = document.getElementById('btn-custom-palette');
            autoEl = document.getElementById('auto-colors');
            autoBtn = document.getElementById('btn-auto-palette');
            autoColorInput = document.getElementById('auto-main-color');
            autoToggleEl = document.getElementById('auto-theme-toggle');
            autoModeEl = document.getElementById('auto-mode-toggle');

            this.render();

            Studio.Events.on('state:layerSelected', function() { self.render(); });
            Studio.Events.on('state:layersChanged', function() { self.render(); });

            // Custom palette button
            if (customBtn) {
                customBtn.addEventListener('click', function() {
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer) return;
                    delete layer.autoColor;
                    if (!layer.colors) {
                        var pal = Studio.Data.Palettes[layer.paletteIndex];
                        layer.colors = pal ? pal.colors.slice() : ['#000000','#333333','#666666','#999999','#cccccc'];
                    }
                    Studio.Events.emit('state:layersChanged');
                });
            }

            // Auto palette button
            if (autoBtn) {
                autoBtn.addEventListener('click', function() {
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer) return;
                    if (!layer.autoColor) {
                        layer.autoColor = autoColorInput ? autoColorInput.value : '#6366f1';
                        layer.autoTheme = 'dark';
                    }
                    layer.colors = generateAutoPalette(layer.autoColor, layer.autoTheme === 'dark', layer.autoMode);
                    Studio.Events.emit('state:layersChanged');
                });
            }

            // Auto color input
            if (autoColorInput) {
                autoColorInput.addEventListener('input', function() {
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer || !layer.autoColor) return;
                    layer.autoColor = autoColorInput.value;
                    layer.colors = generateAutoPalette(layer.autoColor, layer.autoTheme === 'dark', layer.autoMode);
                    Studio.Events.emit('state:layersChanged');
                });
                autoColorInput.addEventListener('change', function() {
                    Studio.Systems.History.push();
                });
            }

            // Theme toggle (universal — works for all palette modes)
            if (autoToggleEl) {
                autoToggleEl.addEventListener('click', function(e) {
                    var btn = e.target.closest('.auto-theme-btn');
                    if (!btn) return;
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer) return;
                    layer.autoTheme = btn.dataset.theme;
                    if (layer.autoColor) {
                        layer.colors = generateAutoPalette(layer.autoColor, layer.autoTheme === 'dark', layer.autoMode);
                    }
                    Studio.Events.emit('state:layersChanged');
                    Studio.Systems.History.push();
                });
            }

            // Auto mode toggle (Balanced / Vivid / Tonal)
            if (autoModeEl) {
                autoModeEl.addEventListener('click', function(e) {
                    var btn = e.target.closest('.auto-theme-btn');
                    if (!btn || !btn.dataset.mode) return;
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer || !layer.autoColor) return;
                    layer.autoMode = btn.dataset.mode;
                    layer.colors = generateAutoPalette(layer.autoColor, layer.autoTheme === 'dark', layer.autoMode);
                    Studio.Events.emit('state:layersChanged');
                    Studio.Systems.History.push();
                });
            }

            // Custom color inputs
            if (customEl) {
                var inputs = customEl.querySelectorAll('input[type="color"]');
                for (var i = 0; i < inputs.length; i++) {
                    (function(inp, colorIdx) {
                        inp.addEventListener('input', function() {
                            var li = Studio.Systems.State.selectedLayerIndex;
                            Studio.Systems.State.updateLayerColor(li, colorIdx, inp.value);
                        });
                        inp.addEventListener('change', function() {
                            Studio.Systems.History.push();
                        });
                    })(inputs[i], i);
                }
            }

            // Category pills
            if (categoryEl) {
                categoryEl.addEventListener('click', function(e) {
                    var pill = e.target.closest('.category-pill');
                    if (!pill) return;
                    var pills = categoryEl.querySelectorAll('.category-pill');
                    for (var i = 0; i < pills.length; i++) pills[i].classList.remove('active');
                    pill.classList.add('active');
                    self._filterByCategory(pill.dataset.category);
                });
            }

            this._buildCategories();
        },

        _buildCategories: function() {
            if (!categoryEl) return;
            var cats = Studio.Data.PaletteCategories || [];
            var html = '<button class="category-pill active" data-category="all">All</button>';
            for (var i = 0; i < cats.length; i++) {
                var cat = cats[i];
                var id = typeof cat === 'string' ? cat : (cat.id || cat.name || '');
                var name = typeof cat === 'string' ? (cat.charAt(0).toUpperCase() + cat.slice(1)) : (cat.name || id);
                if (id === 'all') continue;
                html += '<button class="category-pill" data-category="' + id + '">' + name + '</button>';
            }
            categoryEl.innerHTML = html;
        },

        _filterByCategory: function(cat) {
            if (!gridEl) return;
            var swatches = gridEl.querySelectorAll('.palette-swatch');
            var palettes = Studio.Data.Palettes;
            for (var i = 0; i < swatches.length; i++) {
                if (cat === 'all') {
                    swatches[i].style.display = '';
                } else {
                    swatches[i].style.display = (palettes[i] && palettes[i].category === cat) ? '' : 'none';
                }
            }
        },

        render: function() {
            if (!gridEl) return;

            var palettes = Studio.Data.Palettes;
            var layer = Studio.Systems.State.getSelectedLayer();
            var activePalette = layer ? layer.paletteIndex : 0;
            var isCustom = layer && layer.colors;

            var html = '';
            for (var i = 0; i < palettes.length; i++) {
                var p = palettes[i];
                var gradient = 'linear-gradient(90deg';
                for (var j = 0; j < p.colors.length; j++) {
                    gradient += ', ' + p.colors[j];
                }
                gradient += ')';

                html += '<div class="palette-swatch' + (!isCustom && i === activePalette ? ' active' : '') + '" data-index="' + i + '" style="background: ' + gradient + '">' +
                    '<span class="palette-name">' + p.name + '</span></div>';
            }
            gridEl.innerHTML = html;

            var isAuto = layer && !!layer.autoColor;
            var isManualCustom = isCustom && !isAuto;

            // Update Custom button state and gradient
            if (customBtn) {
                customBtn.classList.toggle('active', isManualCustom);
                if (isCustom) {
                    var cGrad = 'linear-gradient(90deg';
                    for (var ci = 0; ci < layer.colors.length; ci++) cGrad += ', ' + layer.colors[ci];
                    cGrad += ')';
                    customBtn.style.background = cGrad;
                } else {
                    var pal = Studio.Data.Palettes[activePalette];
                    if (pal) {
                        var pGrad = 'linear-gradient(90deg';
                        for (var pi = 0; pi < pal.colors.length; pi++) pGrad += ', ' + pal.colors[pi];
                        pGrad += ')';
                        customBtn.style.background = pGrad;
                    }
                }
            }

            // Update Auto button state and gradient
            if (autoBtn) {
                autoBtn.classList.toggle('active', isAuto);
                if (isAuto && layer.colors) {
                    var aGrad = 'linear-gradient(90deg';
                    for (var ai = 0; ai < layer.colors.length; ai++) aGrad += ', ' + layer.colors[ai];
                    aGrad += ')';
                    autoBtn.style.background = aGrad;
                }
            }
            // Sync auto color input
            if (autoColorInput && layer) {
                autoColorInput.value = layer.autoColor || '#6366f1';
            }
            // Sync auto theme toggle
            if (autoToggleEl && layer) {
                var theme = layer.autoTheme || 'dark';
                var btns = autoToggleEl.querySelectorAll('.auto-theme-btn');
                for (var ti = 0; ti < btns.length; ti++) {
                    btns[ti].classList.toggle('active', btns[ti].dataset.theme === theme);
                }
            }
            // Sync auto mode toggle
            if (autoModeEl && layer) {
                var mode = layer.autoMode || 'balanced';
                var mBtns = autoModeEl.querySelectorAll('.auto-theme-btn');
                for (var mi = 0; mi < mBtns.length; mi++) {
                    mBtns[mi].classList.toggle('active', mBtns[mi].dataset.mode === mode);
                }
            }

            // Bind clicks
            var swatches = gridEl.querySelectorAll('.palette-swatch');
            for (var k = 0; k < swatches.length; k++) {
                (function(sw) {
                    sw.addEventListener('click', function() {
                        var idx = parseInt(sw.dataset.index, 10);
                        var li = Studio.Systems.State.selectedLayerIndex;
                        Studio.Systems.State.updateLayerPalette(li, idx);
                        Studio.Systems.History.push();
                    });
                })(swatches[k]);
            }

            // Update custom color inputs
            this._updateCustomColors();
        },

        _updateCustomColors: function() {
            if (!customEl) return;
            var layer = Studio.Systems.State.getSelectedLayer();
            if (!layer) return;
            var colors = layer.colors || (Studio.Data.Palettes[layer.paletteIndex] || {}).colors || [];
            var inputs = customEl.querySelectorAll('input[type="color"]');
            for (var i = 0; i < inputs.length; i++) {
                if (colors[i]) inputs[i].value = colors[i];
            }
        }
    };
})();
