(function() {
    "use strict";

    var gridEl, searchEl, categoryEl;
    var currentCategory = 'all';
    var searchQuery = '';

    Studio.UI.PatternBrowser = {
        init: function() {
            var self = this;
            gridEl = document.getElementById('pattern-grid');
            searchEl = document.getElementById('pattern-search-input');
            categoryEl = document.getElementById('pattern-categories');

            if (searchEl) {
                searchEl.addEventListener('input', function() {
                    searchQuery = searchEl.value.toLowerCase().trim();
                    self.render();
                });
            }

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

            Studio.Events.on('state:layerSelected', function() { self._updateActive(); });
            Studio.Events.on('state:layersChanged', function() { self._updateActive(); });

            this._buildCategories();
            this.render();
        },

        _buildCategories: function() {
            if (!categoryEl) return;
            var patterns = Studio.Core.GLEngine ? Studio.Core.GLEngine.getAllPatterns() : [];
            var cats = {};
            for (var i = 0; i < patterns.length; i++) {
                var cat = patterns[i].category || 'other';
                cats[cat] = true;
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

            var patterns = Studio.Core.GLEngine ? Studio.Core.GLEngine.getAllPatterns() : [];
            var layer = Studio.Systems.State.getSelectedLayer();
            var activeIdx = layer ? layer.patternIndex : 0;

            var html = '';
            for (var i = 0; i < patterns.length; i++) {
                var p = patterns[i];
                var cat = p.category || 'other';

                // Filter by category
                if (currentCategory !== 'all' && cat !== currentCategory) continue;

                // Filter by search
                if (searchQuery && p.name.toLowerCase().indexOf(searchQuery) === -1) continue;

                html += '<div class="pat-card' + (i === activeIdx ? ' active' : '') + '" data-index="' + i + '">' +
                    '<canvas class="pat-preview" width="96" height="48" data-pattern="' + i + '"></canvas>' +
                    '<div class="pat-name">' + p.name + '</div></div>';
            }
            gridEl.innerHTML = html;

            // Bind clicks
            var cards = gridEl.querySelectorAll('.pat-card');
            for (var k = 0; k < cards.length; k++) {
                (function(card) {
                    card.addEventListener('click', function() {
                        var idx = parseInt(card.dataset.index, 10);
                        var li = Studio.Systems.State.selectedLayerIndex;
                        Studio.Systems.State.updateLayerPattern(li, idx);
                        Studio.Systems.History.push();
                    });
                })(cards[k]);
            }

            // Generate thumbnails
            this._generateThumbnails();
        },

        _generateThumbnails: function() {
            var canvases = gridEl.querySelectorAll('.pat-preview');
            for (var i = 0; i < canvases.length; i++) {
                this._drawThumbnail(canvases[i], parseInt(canvases[i].dataset.pattern, 10));
            }
        },

        _drawThumbnail: function(canvas, patternIndex) {
            // Simple gradient thumbnail based on pattern colors
            var ctx = canvas.getContext('2d');
            if (!ctx) return;
            var w = canvas.width;
            var h = canvas.height;

            // Use palette colors to create a gradient preview
            var layer = Studio.Systems.State.getSelectedLayer();
            var palIdx = layer ? layer.paletteIndex : 0;
            var palette = Studio.Data.Palettes[palIdx];
            if (!palette) return;

            var grad = ctx.createLinearGradient(0, 0, w, h);
            for (var i = 0; i < palette.colors.length; i++) {
                grad.addColorStop(i / (palette.colors.length - 1), palette.colors[i]);
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Add some visual variation based on pattern index
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#000';
            var seed = patternIndex * 137;
            for (var j = 0; j < 6; j++) {
                var x = ((seed + j * 41) % w);
                var y = ((seed + j * 67) % h);
                var r = 5 + (seed + j * 23) % 15;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        },

        _updateActive: function() {
            if (!gridEl) return;
            var layer = Studio.Systems.State.getSelectedLayer();
            var activeIdx = layer ? layer.patternIndex : -1;
            var cards = gridEl.querySelectorAll('.pat-card');
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.toggle('active', parseInt(cards[i].dataset.index, 10) === activeIdx);
            }
        }
    };
})();
