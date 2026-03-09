(function() {
    "use strict";

    var exportModal;

    Studio.UI.Modals = {
        init: function() {
            var self = this;
            exportModal = document.getElementById('export-modal');

            Studio.Events.on('modal:export', function() { self.showExport(); });

            // Close on backdrop click
            if (exportModal) {
                exportModal.addEventListener('click', function(e) {
                    if (e.target === exportModal) self.closeAll();
                });
            }

            // Close on ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') self.closeAll();
            });
        },

        showExport: function() {
            if (!exportModal) return;
            this.closeAll();
            exportModal.classList.add('visible');
            this._initExportTabs();
        },

        closeAll: function() {
            if (exportModal) exportModal.classList.remove('visible');
        },

        _initExportTabs: function() {
            var self = this;
            var tabs = exportModal.querySelectorAll('.export-tab');
            var panels = exportModal.querySelectorAll('.export-panel');

            for (var i = 0; i < tabs.length; i++) {
                (function(tab, idx) {
                    tab.addEventListener('click', function() {
                        for (var j = 0; j < tabs.length; j++) {
                            tabs[j].classList.toggle('active', j === idx);
                            panels[j].classList.toggle('active', j === idx);
                        }
                    });
                })(tabs[i], i);
            }

            // PNG export
            var pngBtn = exportModal.querySelector('#btn-export-png');
            var pngRes = exportModal.querySelector('#png-resolution');
            if (pngBtn) {
                pngBtn.addEventListener('click', function() {
                    var res = pngRes ? parseInt(pngRes.value, 10) : 2;
                    var w, h;
                    switch (res) {
                        case 1: w = 1920; h = 1080; break;
                        case 2: w = 3840; h = 2160; break;
                        case 3: w = 7680; h = 4320; break;
                        default: w = 3840; h = 2160;
                    }
                    Studio.UI.Toasts.show('Exporting ' + w + 'x' + h + ' PNG...', 'info');
                    setTimeout(function() {
                        Studio.Systems.Export.exportPNG(w, h);
                    }, 100);
                    self.closeAll();
                });
            }

            // GIF export
            var gifBtn = exportModal.querySelector('#btn-export-gif');
            var gifDur = exportModal.querySelector('#gif-duration');
            var gifSize = exportModal.querySelector('#gif-size');
            // Sync GIF duration with timeline duration
            if (gifDur) {
                gifDur.value = Studio.Systems.State.timeline.duration;
            }
            if (gifBtn) {
                gifBtn.addEventListener('click', function() {
                    var dur = gifDur ? parseInt(gifDur.value, 10) : 3;
                    var size = gifSize ? parseInt(gifSize.value, 10) : 1280;
                    var h = Math.round(size * 9 / 16);
                    Studio.UI.Toasts.show('Encoding GIF (' + size + 'x' + h + ', ' + dur + 's)...', 'info');
                    Studio.Systems.Export.exportGIF(size, 24, dur);
                    self.closeAll();
                });
            }
            // Live GIF size estimate
            if (gifSize && gifDur) {
                var updateEstimate = function() {
                    var w = parseInt(gifSize.value, 10) || 1280;
                    var h = Math.round(w * 9 / 16);
                    var dur = parseFloat(gifDur.value) || 3;
                    var fps = 24;
                    var frames = Math.ceil(fps * dur);
                    var rawBytes = w * h * frames;
                    var estBytes = rawBytes * 0.5;
                    var label;
                    if (estBytes >= 1024 * 1024) {
                        label = '~' + (estBytes / (1024 * 1024)).toFixed(1) + ' MB';
                    } else {
                        label = '~' + Math.round(estBytes / 1024) + ' KB';
                    }
                    var el = exportModal.querySelector('#gif-size-estimate');
                    if (el) el.textContent = 'Estimated file size: ' + label + ' (' + w + 'x' + h + ', ' + frames + ' frames)';
                };
                gifSize.addEventListener('change', updateEstimate);
                gifDur.addEventListener('input', updateEstimate);
                updateEstimate();
            }

        }
    };
})();
