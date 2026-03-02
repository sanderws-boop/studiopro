(function() {
    "use strict";

    var overlay, input, list;
    var visible = false;
    var commands = [];
    var filtered = [];
    var selectedIndex = 0;

    Studio.UI.CommandPalette = {
        init: function() {
            var self = this;
            overlay = document.getElementById('command-palette');
            if (!overlay) return;
            input = overlay.querySelector('.cmd-input');
            list = overlay.querySelector('.cmd-list');

            this._buildCommands();

            Studio.Events.on('commandPalette:toggle', function() {
                self.toggle();
            });

            if (input) {
                input.addEventListener('input', function() {
                    self._filter(input.value);
                });
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
                        self._render();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        selectedIndex = Math.max(selectedIndex - 1, 0);
                        self._render();
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filtered[selectedIndex]) {
                            filtered[selectedIndex].action();
                            self.hide();
                        }
                    } else if (e.key === 'Escape') {
                        self.hide();
                    }
                });
            }

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) self.hide();
            });
        },

        _buildCommands: function() {
            var patterns = Studio.Core.GLEngine ? Studio.Core.GLEngine.getAllPatterns() : [];
            var palettes = Studio.Data.Palettes || [];
            var presets = Studio.Data.Presets || [];

            commands = [];

            // Pattern commands
            for (var i = 0; i < patterns.length; i++) {
                (function(idx, pat) {
                    commands.push({
                        label: 'Pattern: ' + pat.name,
                        category: 'patterns',
                        action: function() {
                            var li = Studio.Systems.State.selectedLayerIndex;
                            Studio.Systems.State.updateLayerPattern(li, idx);
                            Studio.Systems.History.push();
                        }
                    });
                })(i, patterns[i]);
            }

            // Palette commands
            for (var i = 0; i < palettes.length; i++) {
                (function(idx, pal) {
                    commands.push({
                        label: 'Palette: ' + pal.name,
                        category: 'palettes',
                        action: function() {
                            var li = Studio.Systems.State.selectedLayerIndex;
                            Studio.Systems.State.updateLayerPalette(li, idx);
                            Studio.Systems.History.push();
                        }
                    });
                })(i, palettes[i]);
            }

            // Preset commands
            for (var i = 0; i < presets.length; i++) {
                (function(idx, preset) {
                    commands.push({
                        label: 'Preset: ' + preset.name,
                        category: 'presets',
                        action: function() {
                            Studio.Systems.Project.loadPreset(preset);
                        }
                    });
                })(i, presets[i]);
            }

            // Action commands
            commands.push({ label: 'New Layer', category: 'actions', action: function() { Studio.Systems.State.addLayer(); } });
            commands.push({ label: 'Delete Layer', category: 'actions', action: function() {
                if (Studio.Systems.State.layers.length > 1) Studio.Systems.State.removeLayer(Studio.Systems.State.selectedLayerIndex);
            }});
            commands.push({ label: 'Duplicate Layer', category: 'actions', action: function() { Studio.Systems.State.duplicateLayer(Studio.Systems.State.selectedLayerIndex); } });
            commands.push({ label: 'Export PNG', category: 'actions', action: function() { Studio.Events.emit('modal:export'); } });
            commands.push({ label: 'Save Project', category: 'actions', action: function() { Studio.Systems.Project.save(); } });
            commands.push({ label: 'Load Project', category: 'actions', action: function() { Studio.Systems.Project.load(); } });
            commands.push({ label: 'Fullscreen', category: 'actions', action: function() { Studio.Events.emit('toolbar:fullscreen'); } });
            commands.push({ label: 'Undo', category: 'actions', action: function() { Studio.Systems.History.undo(); } });
            commands.push({ label: 'Redo', category: 'actions', action: function() { Studio.Systems.History.redo(); } });
            commands.push({ label: 'Randomize Seed', category: 'actions', action: function() {
                var li = Studio.Systems.State.selectedLayerIndex;
                Studio.Systems.State.updateLayerParam(li, 'seed', Math.random() * 1000);
                Studio.Systems.History.push();
            }});
            commands.push({ label: 'Toggle Audio Reactivity', category: 'actions', action: function() {
                Studio.Events.emit('modal:audio');
            }});
            commands.push({ label: 'Show Keyboard Shortcuts', category: 'actions', action: function() {
                Studio.UI.Shortcuts.toggleHelp();
            }});

            filtered = commands.slice();
        },

        _filter: function(query) {
            query = query.toLowerCase().trim();
            if (!query) {
                filtered = commands.slice();
            } else {
                filtered = commands.filter(function(cmd) {
                    return cmd.label.toLowerCase().indexOf(query) !== -1;
                });
            }
            selectedIndex = 0;
            this._render();
        },

        _render: function() {
            if (!list) return;
            var html = '';
            var max = Math.min(filtered.length, 12);
            for (var i = 0; i < max; i++) {
                var cmd = filtered[i];
                html += '<button class="cmd-item' + (i === selectedIndex ? ' selected' : '') + '" data-index="' + i + '">' +
                    '<span class="cmd-item-label">' + cmd.label + '</span>' +
                    '<span class="cmd-item-category">' + cmd.category + '</span>' +
                    '</button>';
            }
            if (filtered.length === 0) {
                html = '<div class="cmd-empty">No results found</div>';
            }
            list.innerHTML = html;

            // Bind clicks
            var items = list.querySelectorAll('.cmd-item');
            for (var j = 0; j < items.length; j++) {
                (function(item) {
                    item.addEventListener('click', function() {
                        var idx = parseInt(item.dataset.index, 10);
                        if (filtered[idx]) {
                            filtered[idx].action();
                            Studio.UI.CommandPalette.hide();
                        }
                    });
                })(items[j]);
            }
        },

        toggle: function() {
            if (visible) this.hide();
            else this.show();
        },

        show: function() {
            if (!overlay) return;
            this._buildCommands();
            filtered = commands.slice();
            selectedIndex = 0;
            overlay.classList.add('visible');
            visible = true;
            if (input) { input.value = ''; input.focus(); }
            this._render();
        },

        hide: function() {
            if (!overlay) return;
            overlay.classList.remove('visible');
            visible = false;
        }
    };
})();
