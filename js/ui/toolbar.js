(function() {
    "use strict";

    Studio.UI.Toolbar = {
        init: function() {
            var self = this;
            this.playBtn = document.getElementById('btn-play');
            this.undoBtn = document.getElementById('btn-undo');
            this.redoBtn = document.getElementById('btn-redo');
            this.fullscreenBtn = document.getElementById('btn-fullscreen');
            this.timeDisplay = document.getElementById('time-display');
            this.speedBtns = document.querySelectorAll('.speed-btn');
            this.exportBtn = document.getElementById('btn-export');

            // Play/Pause
            if (this.playBtn) {
                this.playBtn.addEventListener('click', function() {
                    Studio.Events.emit('toolbar:togglePlay');
                });
            }

            // Render pipeline handles the actual toggle; we just update UI
            Studio.Events.on('toolbar:togglePlay', function() {
                // Defer to let render pipeline update state first
                setTimeout(function() { self._updatePlayBtn(); }, 0);
            });

            // Undo/Redo
            if (this.undoBtn) this.undoBtn.addEventListener('click', function() { Studio.Systems.History.undo(); });
            if (this.redoBtn) this.redoBtn.addEventListener('click', function() { Studio.Systems.History.redo(); });

            Studio.Events.on('state:historyChanged', function() {
                self._updateUndoRedo();
            });

            // Speed buttons
            for (var i = 0; i < this.speedBtns.length; i++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var spd = parseFloat(btn.dataset.speed);
                        Studio.Systems.State.speed = spd;
                        Studio.Events.emit('state:speedChanged', spd);
                    });
                })(this.speedBtns[i]);
            }

            Studio.Events.on('state:speedChanged', function(spd) {
                self._updateSpeedBtns(spd);
            });

            // Fullscreen
            if (this.fullscreenBtn) {
                this.fullscreenBtn.addEventListener('click', function() {
                    Studio.Events.emit('toolbar:fullscreen');
                });
            }

            Studio.Events.on('toolbar:fullscreen', function() {
                document.querySelector('.app-layout').classList.toggle('fullscreen');
                // Resize GL
                setTimeout(function() {
                    Studio.Events.emit('gl:resize');
                }, 100);
            });

            // Export
            if (this.exportBtn) {
                this.exportBtn.addEventListener('click', function() {
                    Studio.Events.emit('modal:export');
                });
            }

            // Time display update
            Studio.Events.on('render:frame', function(time) {
                if (self.timeDisplay) {
                    var t = time % 3600;
                    var m = Math.floor(t / 60);
                    var s = Math.floor(t % 60);
                    var ms = Math.floor((t % 1) * 10);
                    self.timeDisplay.textContent = self._pad(m) + ':' + self._pad(s) + '.' + ms;
                }
            });

            // ESC to exit fullscreen
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.querySelector('.app-layout.fullscreen')) {
                    document.querySelector('.app-layout').classList.remove('fullscreen');
                    setTimeout(function() { Studio.Events.emit('gl:resize'); }, 100);
                }
            });

            this._updatePlayBtn();
            this._updateSpeedBtns(Studio.Systems.State.speed);
            this._updateUndoRedo();
        },

        _pad: function(n) {
            return n < 10 ? '0' + n : '' + n;
        },

        _updatePlayBtn: function() {
            if (!this.playBtn) return;
            var playing = Studio.Systems.State.playing;
            this.playBtn.innerHTML = playing ?
                '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="white"/><rect x="14" y="4" width="4" height="16" fill="white"/></svg>' :
                '<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="white"/></svg>';
            this.playBtn.classList.toggle('playing', playing);
        },

        _updateSpeedBtns: function(spd) {
            for (var i = 0; i < this.speedBtns.length; i++) {
                var btn = this.speedBtns[i];
                btn.classList.toggle('active', parseFloat(btn.dataset.speed) === spd);
            }
        },

        _updateUndoRedo: function() {
            if (this.undoBtn) this.undoBtn.disabled = !Studio.Systems.History.canUndo();
            if (this.redoBtn) this.redoBtn.disabled = !Studio.Systems.History.canRedo();
        }
    };
})();
