(function() {
    "use strict";
    window.Studio = {
        Core: {},
        Shaders: {},
        Data: {},
        UI: {},
        Systems: {},
        Events: null,
        gl: null,
        canvas: null,
        VERSION: "1.0.0",
        NAME: "Studio Pro"
    };

    // Central event bus
    var listeners = {};
    window.Studio.Events = {
        on: function(event, fn) {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(fn);
        },
        off: function(event, fn) {
            if (!listeners[event]) return;
            listeners[event] = listeners[event].filter(function(f) { return f !== fn; });
        },
        emit: function(event, data) {
            if (!listeners[event]) return;
            var fns = listeners[event].slice();
            for (var i = 0; i < fns.length; i++) {
                try { fns[i](data); } catch(e) { console.error('Event handler error:', event, e); }
            }
        }
    };
})();
