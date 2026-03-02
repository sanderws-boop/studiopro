(function() {
    "use strict";

    var idCounter = 0;
    function genId() { return 'layer_' + (++idCounter) + '_' + Date.now(); }

    function createLayer(patternIndex, paletteIndex) {
        var patterns = (Studio.Core.GLEngine && Studio.Core.GLEngine.getAllPatterns) ? Studio.Core.GLEngine.getAllPatterns() : [];
        var name = (patterns[patternIndex] || {}).name || ('Layer ' + (idCounter + 1));
        return {
            id: genId(),
            name: name,
            visible: true,
            locked: false,
            patternIndex: patternIndex || 0,
            paletteIndex: paletteIndex !== undefined ? paletteIndex : 1,
            opacity: 1.0,
            blendMode: 0,
            params: { seed: +(Math.random() * 100).toFixed(1), scale: 2.0, warp: 1.5, grain: 0.0 }
        };
    }

    Studio.Systems.State = {
        layers: [],
        selectedLayerIndex: 0,

        postFx: {
            bloom: 0.3,
            bloomRadius: 1.0,
            vignette: 0.4,
            filmGrain: 0.02,
            chromatic: 0.0,
            sharpen: 0.0,
            lensDistortion: 0.0,
            shadowTint: '#1a1a2e',
            highlightTint: '#fffff0',
            colorGrading: 0.0,
            colorGradeShadows: [0.97, 0.98, 1.04],
            colorGradeHighlights: [1.03, 1.01, 0.97]
        },

        timeline: {
            duration: 10,
            currentTime: 0,
            playing: false,
            speed: 1,
            looping: true,
            keyframes: {}
        },

        playing: true,
        speed: 1,

        audio: {
            enabled: false,
            sensitivity: 1.5,
            smoothing: 0.8,
            mapping: {
                bass: { param: 'scale', amount: 2 },
                mids: { param: 'warp', amount: 1 },
                highs: { param: 'grain', amount: 1.5 }
            },
            mappings: [
                { band: "bass", target: "scale", strength: 1.0 },
                { band: "mids", target: "warp", strength: 1.0 },
                { band: "highs", target: "grain", strength: 0.5 }
            ]
        },

        customColors: ["#050508","#1a2540","#2e6080","#60a0c0","#a0d0e0"],

        // Methods
        createLayer: createLayer,

        init: function() {
            this.layers = [createLayer(0, 1)];
            this.selectedLayerIndex = 0;
            Studio.Events.emit('state:init');
            Studio.Events.emit('state:layersChanged');
        },

        getSelectedLayer: function() {
            return this.layers[this.selectedLayerIndex] || null;
        },

        selectLayer: function(index) {
            this.selectedLayerIndex = Math.max(0, Math.min(index, this.layers.length - 1));
            Studio.Events.emit('state:layerSelected', this.selectedLayerIndex);
        },

        addLayer: function(patternIndex, paletteIndex) {
            if (this.layers.length >= 8) return;
            var layer = createLayer(patternIndex || 0, paletteIndex);
            this.layers.push(layer);
            this.selectedLayerIndex = this.layers.length - 1;
            Studio.Events.emit('state:layersChanged');
            Studio.Events.emit('state:layerSelected', this.selectedLayerIndex);
            return layer;
        },

        removeLayer: function(index) {
            if (this.layers.length <= 1) return;
            this.layers.splice(index, 1);
            if (this.selectedLayerIndex >= this.layers.length) {
                this.selectedLayerIndex = this.layers.length - 1;
            }
            Studio.Events.emit('state:layersChanged');
            Studio.Events.emit('state:layerSelected', this.selectedLayerIndex);
        },

        moveLayer: function(fromIndex, toIndex) {
            if (fromIndex === toIndex) return;
            var layer = this.layers.splice(fromIndex, 1)[0];
            this.layers.splice(toIndex, 0, layer);
            if (this.selectedLayerIndex === fromIndex) {
                this.selectedLayerIndex = toIndex;
            }
            Studio.Events.emit('state:layersChanged');
        },

        duplicateLayer: function(index) {
            if (this.layers.length >= 8) return;
            var src = this.layers[index];
            var dup = createLayer(src.patternIndex, src.paletteIndex);
            dup.name = src.name + ' Copy';
            dup.opacity = src.opacity;
            dup.blendMode = src.blendMode;
            dup.params = JSON.parse(JSON.stringify(src.params));
            this.layers.splice(index + 1, 0, dup);
            this.selectedLayerIndex = index + 1;
            Studio.Events.emit('state:layersChanged');
            Studio.Events.emit('state:layerSelected', this.selectedLayerIndex);
        },

        updateLayerPattern: function(layerIndex, patternIndex) {
            var layer = this.layers[layerIndex];
            if (!layer) return;
            layer.patternIndex = patternIndex;
            var patterns = Studio.Core.GLEngine.getAllPatterns();
            layer.name = (patterns[patternIndex] || {}).name || layer.name;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerPalette: function(layerIndex, paletteIndex) {
            var layer = this.layers[layerIndex];
            if (!layer) return;
            layer.paletteIndex = paletteIndex;
            delete layer.colors;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerColor: function(layerIndex, colorIndex, hexColor) {
            var layer = this.layers[layerIndex];
            if (!layer) return;
            if (!layer.colors) {
                var pal = Studio.Data.Palettes[layer.paletteIndex];
                layer.colors = pal ? pal.colors.slice() : ['#000000','#333333','#666666'];
            }
            layer.colors[colorIndex] = hexColor;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerParam: function(layerIndex, paramName, value) {
            var layer = this.layers[layerIndex];
            if (!layer) return;
            if (paramName === 'opacity' || paramName === 'blendMode' || paramName === 'visible' ||
                paramName === 'paletteIndex' || paramName === 'patternIndex' || paramName === 'name') {
                layer[paramName] = value;
            } else {
                layer.params[paramName] = value;
            }
            Studio.Events.emit('state:layerParamChanged', { index: layerIndex, param: paramName, value: value });
        },

        updatePostFx: function(paramName, value) {
            this.postFx[paramName] = value;
            Studio.Events.emit('state:postFxChanged', { param: paramName, value: value });
        },

        getColors: function(layer) {
            if (layer && layer.colors) {
                return layer.colors.map(hexToGL);
            }
            var paletteIndex = layer ? layer.paletteIndex : 1;
            if (paletteIndex === -1) {
                return this.customColors.map(hexToGL);
            }
            var pal = Studio.Data.Palettes[paletteIndex];
            return pal ? pal.colors.map(hexToGL) : [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        },

        toJSON: function() {
            return {
                version: Studio.VERSION,
                layers: JSON.parse(JSON.stringify(this.layers)),
                postFx: JSON.parse(JSON.stringify(this.postFx)),
                timeline: JSON.parse(JSON.stringify(this.timeline)),
                customColors: this.customColors.slice()
            };
        },

        fromJSON: function(data) {
            if (data.layers) this.layers = data.layers;
            if (data.postFx) this.postFx = Object.assign(this.postFx, data.postFx);
            if (data.timeline) this.timeline = Object.assign(this.timeline, data.timeline);
            if (data.customColors) this.customColors = data.customColors;
            this.selectedLayerIndex = 0;
            Studio.Events.emit('state:loaded');
            Studio.Events.emit('state:layersChanged');
            Studio.Events.emit('state:layerSelected', 0);
        }
    };

    function hexToGL(hex) {
        var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255] : [0,0,0];
    }
    Studio.Systems.State.hexToGL = hexToGL;
})();
