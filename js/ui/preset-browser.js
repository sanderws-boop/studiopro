(function() {
    "use strict";

    var gridEl, categoryEl;
    var currentCategory = 'all';

    Studio.UI.PresetBrowser = {
        init: function() {
            var self = this;
            gridEl = document.getElementById('preset-grid');
            categoryEl = document.getElementById('preset-categories');

            if (categoryEl) {
                categoryEl.addEventListener('click', function(e) {
                    var pill = e.target.closest('.category-pill');
                    if (!pill) return;
                    var pills = categoryEl.querySelectorAll('.category-pill');
                    for (var i = 0; i < pills.length; i++) pills[i].classList.remove('active');
                    pill.classList.add('active');
                    currentCategory = pill.dataset.category;
                    self.render();
                });
            }

            this._buildCategories();
            this.render();
        },

        _buildCategories: function() {
            if (!categoryEl) return;
            var presets = Studio.Data.Presets || [];
            var cats = {};
            for (var i = 0; i < presets.length; i++) {
                cats[presets[i].category || 'other'] = true;
            }
            var html = '<button class="category-pill active" data-category="all">All</button>';
            var catNames = Object.keys(cats).sort();
            for (var j = 0; j < catNames.length; j++) {
                html += '<button class="category-pill" data-category="' + catNames[j] + '">' +
                    catNames[j].charAt(0).toUpperCase() + catNames[j].slice(1) + '</button>';
            }
            categoryEl.innerHTML = html;
        },

        render: function() {
            if (!gridEl) return;
            var presets = Studio.Data.Presets || [];

            var html = '';
            for (var i = 0; i < presets.length; i++) {
                var p = presets[i];
                if (currentCategory !== 'all' && p.category !== currentCategory) continue;

                // Build gradient from first layer palette
                var gradient = 'linear-gradient(135deg, #333, #555)';
                if (p.layers && p.layers.length > 0) {
                    var palName = p.layers[0].palette;
                    var palette = this._findPalette(palName);
                    if (palette) {
                        gradient = 'linear-gradient(135deg';
                        for (var c = 0; c < palette.colors.length; c++) {
                            gradient += ', ' + palette.colors[c];
                        }
                        gradient += ')';
                    }
                }

                html += '<div class="preset-card" data-index="' + i + '">' +
                    '<div class="preset-preview" style="background: ' + gradient + '"></div>' +
                    '<div class="preset-info">' +
                    '<span class="preset-name">' + p.name + '</span>' +
                    '<span class="preset-meta">' + (p.layers ? p.layers.length : 0) + ' layers</span>' +
                    '</div></div>';
            }
            gridEl.innerHTML = html;

            // Bind clicks
            var cards = gridEl.querySelectorAll('.preset-card');
            for (var k = 0; k < cards.length; k++) {
                (function(card) {
                    card.addEventListener('click', function() {
                        var idx = parseInt(card.dataset.index, 10);
                        var preset = presets[idx];
                        if (preset) {
                            Studio.Systems.Project.loadPreset(preset);
                            Studio.UI.Toasts.show('Loaded preset: ' + preset.name, 'success');
                        }
                    });
                })(cards[k]);
            }
        },

        _findPalette: function(name) {
            var palettes = Studio.Data.Palettes || [];
            for (var i = 0; i < palettes.length; i++) {
                if (palettes[i].name === name) return palettes[i];
            }
            return null;
        }
    };
})();
