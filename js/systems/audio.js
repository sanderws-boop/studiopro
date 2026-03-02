(function() {
    "use strict";
    var audioCtx = null, analyser = null, frequencyData = null, micStream = null;
    var beatCooldown = 0, lastEnergy = 0;

    Studio.Systems.Audio = {
        enabled: false,
        bands: { bass: 0, mids: 0, highs: 0, overall: 0 },
        beatDetected: false,

        start: function() {
            var self = this;
            if (audioCtx) return Promise.resolve();
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);

            return navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
                micStream = stream;
                audioCtx.createMediaStreamSource(stream).connect(analyser);
                self.enabled = true;
                Studio.Systems.State.audio.enabled = true;
                Studio.Events.emit('audio:started');
            }).catch(function(err) {
                console.error('Mic error:', err);
                Studio.UI.Toasts.show('Microphone access denied', 'error');
            });
        },

        stop: function() {
            if (micStream) { micStream.getTracks().forEach(function(t) { t.stop(); }); micStream = null; }
            if (audioCtx) { audioCtx.close(); audioCtx = null; analyser = null; }
            this.enabled = false;
            Studio.Systems.State.audio.enabled = false;
            this.bands = { bass: 0, mids: 0, highs: 0, overall: 0 };
            Studio.Events.emit('audio:stopped');
        },

        update: function() {
            if (!this.enabled || !analyser) return;
            analyser.getByteFrequencyData(frequencyData);
            var bins = frequencyData.length;
            var bassEnd = Math.floor(bins * 0.15);
            var midsEnd = Math.floor(bins * 0.5);
            var sensitivity = Studio.Systems.State.audio.sensitivity;
            var bass = 0, mids = 0, highs = 0;
            for (var i = 0; i < bassEnd; i++) bass += frequencyData[i];
            for (var i = bassEnd; i < midsEnd; i++) mids += frequencyData[i];
            for (var i = midsEnd; i < bins; i++) highs += frequencyData[i];
            bass = (bass / bassEnd / 255) * sensitivity;
            mids = (mids / (midsEnd - bassEnd) / 255) * sensitivity;
            highs = (highs / (bins - midsEnd) / 255) * sensitivity;
            this.bands.bass = bass;
            this.bands.mids = mids;
            this.bands.highs = highs;
            this.bands.overall = (bass + mids + highs) / 3;

            this.beatDetected = false;
            if (beatCooldown <= 0 && bass > lastEnergy * 1.3 && bass > 0.3) {
                this.beatDetected = true;
                beatCooldown = 8;
                Studio.Events.emit('audio:beat');
            }
            if (beatCooldown > 0) beatCooldown--;
            lastEnergy = bass * 0.8 + lastEnergy * 0.2;
        },

        applyToParam: function(paramName, baseValue, layerId) {
            if (!this.enabled) return baseValue;
            var mappings = Studio.Systems.State.audio.mappings;
            var result = baseValue;
            for (var i = 0; i < mappings.length; i++) {
                var m = mappings[i];
                if (m.target !== paramName) continue;
                result += this.bands[m.band] * m.strength * baseValue * 0.5;
            }
            return result;
        },

        getAnalyser: function() { return analyser; },
        getFrequencyData: function() { return frequencyData; }
    };
})();
