(function() {
    "use strict";

    var SESSION_KEY = 'studio-pro-session';

    Studio.Systems.Project = {
        save: function() {
            var data = Studio.Systems.State.toJSON();
            data.savedAt = new Date().toISOString();
            var json = JSON.stringify(data, null, 2);
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.download = 'studio-project-' + Date.now() + '.studio';
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
            Studio.UI.Toasts.show('Project saved', 'success');
        },

        load: function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.studio,.json';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    try {
                        var data = JSON.parse(ev.target.result);
                        Studio.Systems.State.fromJSON(data);
                        Studio.Systems.History.push();
                        Studio.UI.Toasts.show('Project loaded: ' + file.name, 'success');
                    } catch (err) {
                        Studio.UI.Toasts.show('Invalid project file', 'error');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },

        loadPreset: function(preset) {
            var state = Studio.Systems.State;
            // Clear layers
            state.layers = [];
            for (var i = 0; i < preset.layers.length; i++) {
                var pl = preset.layers[i];
                var patterns = Studio.Core.GLEngine.getAllPatterns();
                var patIdx = 0;
                var palIdx = 1;
                // Find pattern by name
                for (var j = 0; j < patterns.length; j++) {
                    if (patterns[j].name === pl.pattern) { patIdx = j; break; }
                }
                // Find palette by name
                for (var j = 0; j < Studio.Data.Palettes.length; j++) {
                    if (Studio.Data.Palettes[j].name === pl.palette) { palIdx = j; break; }
                }
                var layer = state.createLayer(patIdx, palIdx);
                if (pl.params) layer.params = Object.assign(layer.params, pl.params);
                if (pl.opacity !== undefined) layer.opacity = pl.opacity;
                if (pl.blendMode !== undefined) {
                    var modes = Studio.Shaders.BLEND_MODES;
                    for (var j = 0; j < modes.length; j++) {
                        if (modes[j].name.toLowerCase() === pl.blendMode.toLowerCase()) {
                            layer.blendMode = modes[j].id;
                            break;
                        }
                    }
                }
                state.layers.push(layer);
            }
            if (preset.postFx) {
                Object.assign(state.postFx, preset.postFx);
            }
            state.selectedLayerIndex = 0;
            Studio.Systems.History.push();
            Studio.Events.emit('state:loaded');
            Studio.Events.emit('state:layersChanged');
            Studio.Events.emit('state:layerSelected', 0);
        },

        saveSession: function() {
            try {
                var data = Studio.Systems.State.toJSON();
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
            } catch (e) {}
        },

        restoreSession: function() {
            try {
                var raw = sessionStorage.getItem(SESSION_KEY);
                if (raw) {
                    Studio.Systems.State.fromJSON(JSON.parse(raw));
                    return true;
                }
            } catch (e) {}
            return false;
        }
    };
})();
