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

        _thumbFBO: null,

        _generateThumbnails: function() {
            var canvases = gridEl.querySelectorAll('.pat-preview');
            if (!canvases.length) return;

            var gl = Studio.gl;
            var eng = Studio.Core.GLEngine;
            var pipeline = Studio.Core.RenderPipeline;
            if (!gl || !eng) return;

            var tw = 192, th = 96;
            if (!this._thumbFBO || this._thumbFBO.w !== tw || this._thumbFBO.h !== th) {
                this._thumbFBO = eng.createFBO(tw, th, false);
            }

            var layer = Studio.Systems.State.getSelectedLayer();
            var colors = Studio.Systems.State.getColors(layer);
            var pixels = new Uint8Array(tw * th * 4);
            var defaultParams = { seed: 42, scale: 2.0, warp: 1.5, grain: 0, angle: 0 };
            var savedLoop = pipeline._loopDuration;
            pipeline._loopDuration = 0;

            for (var i = 0; i < canvases.length; i++) {
                var canvas = canvases[i];
                var idx = parseInt(canvas.dataset.pattern, 10);
                var prog = eng.getPatternProgram(idx);
                if (!prog) continue;

                gl.bindFramebuffer(gl.FRAMEBUFFER, this._thumbFBO.fb);
                gl.viewport(0, 0, tw, th);
                pipeline.renderPattern(idx, defaultParams, colors, tw, th, 0.5);
                gl.readPixels(0, 0, tw, th, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                var ctx = canvas.getContext('2d');
                if (!ctx) continue;
                canvas.width = tw;
                canvas.height = th;
                var imgData = ctx.createImageData(tw, th);
                // Flip vertically (GL reads bottom-up)
                for (var row = 0; row < th; row++) {
                    var srcOff = row * tw * 4;
                    var dstOff = (th - 1 - row) * tw * 4;
                    imgData.data.set(pixels.subarray(srcOff, srcOff + tw * 4), dstOff);
                }
                ctx.putImageData(imgData, 0, 0);
            }

            pipeline._loopDuration = savedLoop;
            // Restore main viewport
            var mainW = Studio.canvas.width, mainH = Studio.canvas.height;
            gl.viewport(0, 0, mainW, mainH);
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
