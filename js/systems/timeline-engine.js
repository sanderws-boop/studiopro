(function() {
    "use strict";

    Studio.Systems.TimelineEngine = {
        evaluate: function(layerId, paramName, time) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId] || !keyframes[layerId][paramName]) return null;
            var kfs = keyframes[layerId][paramName];
            if (kfs.length === 0) return null;
            if (kfs.length === 1) return kfs[0].value;

            var duration = Studio.Systems.State.timeline.duration;
            var t = Studio.Systems.State.timeline.looping ? (time % duration) : Math.min(time, duration);

            var before = kfs[0], after = kfs[kfs.length - 1];
            if (t <= before.time) return before.value;
            if (t >= after.time) return after.value;

            for (var i = 0; i < kfs.length - 1; i++) {
                if (t >= kfs[i].time && t <= kfs[i + 1].time) {
                    before = kfs[i];
                    after = kfs[i + 1];
                    break;
                }
            }

            var progress = (t - before.time) / (after.time - before.time);
            progress = Studio.Data.Easing.apply(after.easing || 'linear', progress);
            return before.value + (after.value - before.value) * progress;
        },

        addKeyframe: function(layerId, paramName, time, value, easing) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId]) keyframes[layerId] = {};
            if (!keyframes[layerId][paramName]) keyframes[layerId][paramName] = [];

            var kfs = keyframes[layerId][paramName];
            // Remove existing at same time
            for (var i = kfs.length - 1; i >= 0; i--) {
                if (Math.abs(kfs[i].time - time) < 0.01) kfs.splice(i, 1);
            }
            kfs.push({ time: time, value: value, easing: easing || 'linear' });
            kfs.sort(function(a, b) { return a.time - b.time; });
            Studio.Events.emit('state:timelineChanged');
        },

        removeKeyframe: function(layerId, paramName, time) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId] || !keyframes[layerId][paramName]) return;
            var kfs = keyframes[layerId][paramName];
            for (var i = kfs.length - 1; i >= 0; i--) {
                if (Math.abs(kfs[i].time - time) < 0.05) {
                    kfs.splice(i, 1);
                    break;
                }
            }
            Studio.Events.emit('state:timelineChanged');
        },

        getLayerKeyframes: function(layerId) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId]) return {};
            return keyframes[layerId];
        },

        getKeyframes: function(layerId, paramName) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId] || !keyframes[layerId][paramName]) return [];
            return keyframes[layerId][paramName];
        },

        getAllParamsForLayer: function(layerId) {
            var keyframes = Studio.Systems.State.timeline.keyframes;
            if (!keyframes[layerId]) return [];
            return Object.keys(keyframes[layerId]);
        }
    };
})();
