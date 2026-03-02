(function() {
    "use strict";
    Studio.Shaders.PostExtras = {
        copy: "#version 300 es\nprecision highp float;\nin vec2 v_uv;\nuniform sampler2D u_src;\nout vec4 fragColor;\nvoid main() {\n    fragColor = texture(u_src, v_uv);\n}"
    };
})();
