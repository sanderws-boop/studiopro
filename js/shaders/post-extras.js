(function() {
    "use strict";
    Studio.Shaders.PostExtras = {
        copy: "#version 300 es\nprecision highp float;\nin vec2 v_uv;\nuniform sampler2D u_src;\nout vec4 fragColor;\nvoid main() {\n    fragColor = texture(u_src, v_uv);\n}",

        blur: "#version 300 es\nprecision highp float;\nin vec2 v_uv;\nuniform sampler2D u_src;\nuniform vec2 u_direction;\nuniform float u_step;\nout vec4 fragColor;\nvoid main() {\n    vec2 s = u_direction * u_step;\n    vec4 sum = texture(u_src, v_uv) * 0.11122;\n    sum += (texture(u_src, v_uv + s) + texture(u_src, v_uv - s)) * 0.10780;\n    sum += (texture(u_src, v_uv + s*2.0) + texture(u_src, v_uv - s*2.0)) * 0.09815;\n    sum += (texture(u_src, v_uv + s*3.0) + texture(u_src, v_uv - s*3.0)) * 0.08394;\n    sum += (texture(u_src, v_uv + s*4.0) + texture(u_src, v_uv - s*4.0)) * 0.06746;\n    sum += (texture(u_src, v_uv + s*5.0) + texture(u_src, v_uv - s*5.0)) * 0.05092;\n    sum += (texture(u_src, v_uv + s*6.0) + texture(u_src, v_uv - s*6.0)) * 0.03612;\n    fragColor = sum;\n}"
    };
})();
