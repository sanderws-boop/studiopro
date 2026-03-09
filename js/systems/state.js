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
            patternIndex: patternIndex || 0,
            paletteIndex: paletteIndex !== undefined ? paletteIndex : 0,
            params: { seed: +(Math.random() * 100).toFixed(1), scale: 2.0, warp: 1.5, grain: 0.0 }
        };
    }

    Studio.Systems.State = {
        layers: [],
        selectedLayerIndex: 0,

        postFx: {
            filmGrain: 0.02,
            sharpen: 0.0,
            grainColor: '#ffffff'
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

        customColors: ["#050508","#1a2540","#2e6080","#60a0c0","#a0d0e0"],

        // Methods
        createLayer: createLayer,

        init: function() {
            this.layers = [createLayer(0, 0)];
            this.selectedLayerIndex = 0;
            Studio.Events.emit('state:init');
            Studio.Events.emit('state:layersChanged');
        },

        getSelectedLayer: function() {
            return this.layers[0] || null;
        },

        selectLayer: function(index) {
            this.selectedLayerIndex = 0;
            Studio.Events.emit('state:layerSelected', 0);
        },

        updateLayerPattern: function(layerIndex, patternIndex) {
            var layer = this.layers[0];
            if (!layer) return;
            layer.patternIndex = patternIndex;
            var patterns = Studio.Core.GLEngine.getAllPatterns();
            layer.name = (patterns[patternIndex] || {}).name || layer.name;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerPalette: function(layerIndex, paletteIndex) {
            var layer = this.layers[0];
            if (!layer) return;
            layer.paletteIndex = paletteIndex;
            delete layer.colors;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerColor: function(layerIndex, colorIndex, hexColor) {
            var layer = this.layers[0];
            if (!layer) return;
            if (!layer.colors) {
                var pal = Studio.Data.Palettes[layer.paletteIndex];
                layer.colors = pal ? pal.colors.slice() : ['#000000','#333333','#666666'];
            }
            layer.colors[colorIndex] = hexColor;
            Studio.Events.emit('state:layersChanged');
        },

        updateLayerParam: function(layerIndex, paramName, value) {
            var layer = this.layers[0];
            if (!layer) return;
            layer.params[paramName] = value;
            Studio.Events.emit('state:layerParamChanged', { index: 0, param: paramName, value: value });
        },

        updatePostFx: function(paramName, value) {
            this.postFx[paramName] = value;
            Studio.Events.emit('state:postFxChanged', { param: paramName, value: value });
        },

        getColors: function(layer) {
            if (layer && layer.colors) {
                return layer.colors.map(hexToGL);
            }
            var paletteIndex = layer ? layer.paletteIndex : 0;
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
