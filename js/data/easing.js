(function() {
    "use strict";
    Studio.Data.Easing = {
        functions: {
            linear: function(t) { return t; },
            easeIn: function(t) { return t * t * t; },
            easeOut: function(t) { return 1 - Math.pow(1 - t, 3); },
            easeInOut: function(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; },
            bounce: function(t) {
                var n1 = 7.5625, d1 = 2.75;
                if (t < 1/d1) return n1*t*t;
                if (t < 2/d1) return n1*(t-=1.5/d1)*t+0.75;
                if (t < 2.5/d1) return n1*(t-=2.25/d1)*t+0.9375;
                return n1*(t-=2.625/d1)*t+0.984375;
            },
            elastic: function(t) {
                if (t === 0 || t === 1) return t;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
            }
        },
        names: ["linear", "easeIn", "easeOut", "easeInOut", "bounce", "elastic"],
        apply: function(name, t) {
            var fn = this.functions[name] || this.functions.linear;
            return fn(Math.max(0, Math.min(1, t)));
        }
    };
})();
