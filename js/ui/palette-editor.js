(function() {
    "use strict";

    var gridEl, customEl, categoryEl, customBtn;

    Studio.UI.PaletteEditor = {
        init: function() {
            var self = this;
            gridEl = document.getElementById('palette-grid');
            customEl = document.getElementById('custom-colors');
            categoryEl = document.getElementById('palette-categories');
            customBtn = document.getElementById('btn-custom-palette');

            this.render();

            Studio.Events.on('state:layerSelected', function() { self.render(); });
            Studio.Events.on('state:layersChanged', function() { self.render(); });

            // Custom palette button
            if (customBtn) {
                customBtn.addEventListener('click', function() {
                    var layer = Studio.Systems.State.getSelectedLayer();
                    if (!layer) return;
                    // If not already custom, copy current palette colors to layer.colors
                    if (!layer.colors) {
                        var pal = Studio.Data.Palettes[layer.paletteIndex];
                        layer.colors = pal ? pal.colors.slice() : ['#000000','#333333','#666666','#999999','#cccccc'];
                    }
                    Studio.Events.emit('state:layersChanged');
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

            // Update Custom button state and gradient
            if (customBtn) {
                customBtn.classList.toggle('active', !!isCustom);
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
