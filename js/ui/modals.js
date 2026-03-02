(function() {
    "use strict";

    var exportModal, audioModal;

    Studio.UI.Modals = {
        init: function() {
            var self = this;
            exportModal = document.getElementById('export-modal');
            audioModal = document.getElementById('audio-modal');

            Studio.Events.on('modal:export', function() { self.showExport(); });
            Studio.Events.on('modal:audio', function() { self.showAudio(); });

            // Close on backdrop click
            [exportModal, audioModal].forEach(function(modal) {
                if (!modal) return;
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) self.closeAll();
                });
            });

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

        showAudio: function() {
            if (!audioModal) return;
            this.closeAll();
            audioModal.classList.add('visible');
            this._initAudioUI();
        },

        closeAll: function() {
            if (exportModal) exportModal.classList.remove('visible');
            if (audioModal) audioModal.classList.remove('visible');
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

            // WebM export
            var webmBtn = exportModal.querySelector('#btn-export-webm');
            var webmDur = exportModal.querySelector('#webm-duration');
            var webmFps = exportModal.querySelector('#webm-fps');
            if (webmBtn) {
                webmBtn.addEventListener('click', function() {
                    var dur = webmDur ? parseInt(webmDur.value, 10) : 5;
                    var fps = webmFps ? parseInt(webmFps.value, 10) : 30;
                    Studio.UI.Toasts.show('Recording ' + dur + 's WebM at ' + fps + 'fps...', 'info');
                    Studio.Systems.Export.exportWebM(dur, fps);
                    self.closeAll();
                });
            }

            // GIF export
            var gifBtn = exportModal.querySelector('#btn-export-gif');
            var gifDur = exportModal.querySelector('#gif-duration');
            var gifSize = exportModal.querySelector('#gif-size');
            if (gifBtn) {
                gifBtn.addEventListener('click', function() {
                    var dur = gifDur ? parseInt(gifDur.value, 10) : 3;
                    var size = gifSize ? parseInt(gifSize.value, 10) : 1280;
                    var h = Math.round(size * 9 / 16);
                    Studio.UI.Toasts.show('Encoding GIF (' + size + 'x' + h + ', ' + dur + 's)...', 'info');
                    Studio.Systems.Export.exportGIF(size, 15, dur);
                    self.closeAll();
                });
            }
            // Live GIF size estimate
            if (gifSize && gifDur) {
                var updateEstimate = function() {
                    var w = parseInt(gifSize.value, 10) || 1280;
                    var h = Math.round(w * 9 / 16);
                    var dur = parseFloat(gifDur.value) || 3;
                    var fps = 15;
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

            // CSS export
            var cssBtn = exportModal.querySelector('#btn-export-css');
            if (cssBtn) {
                cssBtn.addEventListener('click', function() {
                    Studio.Systems.Export.exportCSS();
                    self.closeAll();
                });
            }
        },

        _initAudioUI: function() {
            var self = this;
            var state = Studio.Systems.State;
            var audio = Studio.Systems.Audio;

            var toggleBtn = audioModal.querySelector('#btn-audio-toggle');
            var sensSlider = audioModal.querySelector('#audio-sensitivity');
            var smoothSlider = audioModal.querySelector('#audio-smoothing');

            if (toggleBtn) {
                toggleBtn.textContent = state.audio.enabled ? 'Disable Audio' : 'Enable Microphone';
                toggleBtn.className = 'btn btn-primary' + (state.audio.enabled ? ' active' : '');
                toggleBtn.addEventListener('click', function() {
                    if (state.audio.enabled) {
                        audio.stop();
                        state.audio.enabled = false;
                        toggleBtn.textContent = 'Enable Microphone';
                        toggleBtn.classList.remove('active');
                    } else {
                        audio.start().then(function() {
                            state.audio.enabled = true;
                            toggleBtn.textContent = 'Disable Audio';
                            toggleBtn.classList.add('active');
                            Studio.UI.Toasts.show('Audio input enabled', 'success');
                        }).catch(function() {
                            Studio.UI.Toasts.show('Microphone access denied', 'error');
                        });
                    }
                });
            }

            if (sensSlider) {
                sensSlider.value = state.audio.sensitivity;
                sensSlider.addEventListener('input', function() {
                    state.audio.sensitivity = parseFloat(sensSlider.value);
                });
            }

            if (smoothSlider) {
                smoothSlider.value = state.audio.smoothing;
                smoothSlider.addEventListener('input', function() {
                    state.audio.smoothing = parseFloat(smoothSlider.value);
                    if (audio.analyser) audio.analyser.smoothingTimeConstant = state.audio.smoothing;
                });
            }

            // Mapping rows
            var mappings = audioModal.querySelectorAll('.audio-mapping-row');
            for (var i = 0; i < mappings.length; i++) {
                (function(row) {
                    var band = row.dataset.band;
                    var paramSelect = row.querySelector('.mapping-param');
                    var amountSlider = row.querySelector('.mapping-amount');

                    if (paramSelect && state.audio.mapping[band]) {
                        paramSelect.value = state.audio.mapping[band].param || 'none';
                        paramSelect.addEventListener('change', function() {
                            state.audio.mapping[band].param = paramSelect.value;
                        });
                    }
                    if (amountSlider && state.audio.mapping[band]) {
                        amountSlider.value = state.audio.mapping[band].amount || 1;
                        amountSlider.addEventListener('input', function() {
                            state.audio.mapping[band].amount = parseFloat(amountSlider.value);
                        });
                    }
                })(mappings[i]);
            }
        }
    };
})();
