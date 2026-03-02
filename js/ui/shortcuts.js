(function() {
    "use strict";

    var shortcuts = [];
    var helpVisible = false;

    Studio.UI.Shortcuts = {
        init: function() {
            this._register();
            document.addEventListener('keydown', this._handle.bind(this));
        },

        _register: function() {
            var self = this;
            // Playback
            shortcuts.push({ key: ' ', desc: 'Play / Pause', action: function() {
                Studio.Events.emit('toolbar:togglePlay');
            }});
            shortcuts.push({ key: 'f', desc: 'Fullscreen', action: function() {
                Studio.Events.emit('toolbar:fullscreen');
            }});

            // Undo/Redo
            shortcuts.push({ key: 'z', ctrl: true, desc: 'Undo', action: function() {
                Studio.Systems.History.undo();
            }});
            shortcuts.push({ key: 'z', ctrl: true, shift: true, desc: 'Redo', action: function() {
                Studio.Systems.History.redo();
            }});
            shortcuts.push({ key: 'y', ctrl: true, desc: 'Redo', action: function() {
                Studio.Systems.History.redo();
            }});

            // Layers
            shortcuts.push({ key: 'n', ctrl: true, desc: 'New Layer', action: function() {
                Studio.Systems.State.addLayer();
            }});
            shortcuts.push({ key: 'Backspace', desc: 'Delete Layer', action: function() {
                var idx = Studio.Systems.State.selectedLayerIndex;
                if (Studio.Systems.State.layers.length > 1) {
                    Studio.Systems.State.removeLayer(idx);
                }
            }});
            shortcuts.push({ key: 'd', ctrl: true, desc: 'Duplicate Layer', action: function() {
                Studio.Systems.State.duplicateLayer(Studio.Systems.State.selectedLayerIndex);
            }});

            // Navigation
            shortcuts.push({ key: 'ArrowUp', desc: 'Previous Layer', action: function() {
                var idx = Studio.Systems.State.selectedLayerIndex;
                if (idx > 0) Studio.Systems.State.selectLayer(idx - 1);
            }});
            shortcuts.push({ key: 'ArrowDown', desc: 'Next Layer', action: function() {
                var idx = Studio.Systems.State.selectedLayerIndex;
                if (idx < Studio.Systems.State.layers.length - 1) Studio.Systems.State.selectLayer(idx + 1);
            }});

            // Tools
            shortcuts.push({ key: 'k', ctrl: true, desc: 'Command Palette', action: function() {
                Studio.Events.emit('commandPalette:toggle');
            }});
            shortcuts.push({ key: 'e', ctrl: true, desc: 'Export', action: function() {
                Studio.Events.emit('modal:export');
            }});
            shortcuts.push({ key: 's', ctrl: true, desc: 'Save Project', action: function() {
                Studio.Systems.Project.save();
            }});
            shortcuts.push({ key: 'o', ctrl: true, desc: 'Open Project', action: function() {
                Studio.Systems.Project.load();
            }});
            shortcuts.push({ key: 'r', desc: 'Randomize Seed', action: function() {
                var layer = Studio.Systems.State.getSelectedLayer();
                if (layer) {
                    Studio.Systems.State.updateLayerParam(
                        Studio.Systems.State.selectedLayerIndex,
                        'seed', Math.random() * 1000
                    );
                    Studio.Systems.History.push();
                }
            }});

            // Speed
            shortcuts.push({ key: '1', desc: 'Speed 0.5x', action: function() {
                Studio.Systems.State.speed = 0.5;
                Studio.Events.emit('state:speedChanged', 0.5);
            }});
            shortcuts.push({ key: '2', desc: 'Speed 1x', action: function() {
                Studio.Systems.State.speed = 1;
                Studio.Events.emit('state:speedChanged', 1);
            }});
            shortcuts.push({ key: '3', desc: 'Speed 2x', action: function() {
                Studio.Systems.State.speed = 2;
                Studio.Events.emit('state:speedChanged', 2);
            }});

            // Help
            shortcuts.push({ key: '?', shift: true, desc: 'Show Shortcuts', action: function() {
                self.toggleHelp();
            }});
        },

        _handle: function(e) {
            // Don't capture when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            if (e.target.isContentEditable) return;

            var ctrlOrMeta = e.ctrlKey || e.metaKey;

            for (var i = 0; i < shortcuts.length; i++) {
                var s = shortcuts[i];
                if (s.key === e.key || s.key === e.code) {
                    var ctrlMatch = s.ctrl ? ctrlOrMeta : !ctrlOrMeta;
                    var shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
                    if (ctrlMatch && shiftMatch) {
                        e.preventDefault();
                        s.action();
                        return;
                    }
                }
            }
        },

        toggleHelp: function() {
            var overlay = document.getElementById('shortcuts-overlay');
            if (!overlay) return;
            helpVisible = !helpVisible;
            overlay.classList.toggle('visible', helpVisible);
        },

        getAll: function() {
            return shortcuts;
        },

        buildHelpContent: function() {
            var html = '';
            for (var i = 0; i < shortcuts.length; i++) {
                var s = shortcuts[i];
                var keyStr = '';
                if (s.ctrl) keyStr += '<kbd>Ctrl</kbd> + ';
                if (s.shift) keyStr += '<kbd>Shift</kbd> + ';
                keyStr += '<kbd>' + (s.key === ' ' ? 'Space' : s.key) + '</kbd>';
                html += '<div class="shortcut-row"><span class="shortcut-keys">' + keyStr + '</span><span class="shortcut-desc">' + s.desc + '</span></div>';
            }
            return html;
        }
    };
})();
