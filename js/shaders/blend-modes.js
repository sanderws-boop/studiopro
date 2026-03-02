(function() {
    "use strict";
    Studio.Shaders.BlendModes = {
        fragment: "#version 300 es\nprecision highp float;\nin vec2 v_uv;\nuniform sampler2D u_base;\nuniform sampler2D u_layer;\nuniform int u_blendMode;\nuniform float u_opacity;\nout vec4 fragColor;\n\nvec3 blendNormal(vec3 base, vec3 bl) { return bl; }\nvec3 blendMultiply(vec3 base, vec3 bl) { return base * bl; }\nvec3 blendScreen(vec3 base, vec3 bl) { return 1.0 - (1.0 - base) * (1.0 - bl); }\nvec3 blendOverlay(vec3 base, vec3 bl) {\n    return vec3(\n        base.r < 0.5 ? 2.0*base.r*bl.r : 1.0-2.0*(1.0-base.r)*(1.0-bl.r),\n        base.g < 0.5 ? 2.0*base.g*bl.g : 1.0-2.0*(1.0-base.g)*(1.0-bl.g),\n        base.b < 0.5 ? 2.0*base.b*bl.b : 1.0-2.0*(1.0-base.b)*(1.0-bl.b)\n    );\n}\nvec3 blendAdd(vec3 base, vec3 bl) { return min(base + bl, 1.0); }\nvec3 blendSoftLight(vec3 base, vec3 bl) {\n    return mix(\n        2.0*base*bl + base*base*(1.0-2.0*bl),\n        sqrt(base)*(2.0*bl-1.0) + 2.0*base*(1.0-bl),\n        step(0.5, bl)\n    );\n}\nvec3 blendDifference(vec3 base, vec3 bl) { return abs(base - bl); }\n\nvoid main() {\n    vec3 base = texture(u_base, v_uv).rgb;\n    vec3 layer = texture(u_layer, v_uv).rgb;\n    vec3 result;\n    if (u_blendMode == 0) result = blendNormal(base, layer);\n    else if (u_blendMode == 1) result = blendMultiply(base, layer);\n    else if (u_blendMode == 2) result = blendScreen(base, layer);\n    else if (u_blendMode == 3) result = blendOverlay(base, layer);\n    else if (u_blendMode == 4) result = blendAdd(base, layer);\n    else if (u_blendMode == 5) result = blendSoftLight(base, layer);\n    else if (u_blendMode == 6) result = blendDifference(base, layer);\n    else result = blendNormal(base, layer);\n    fragColor = vec4(mix(base, result, u_opacity), 1.0);\n}"
    };

    Studio.Shaders.BLEND_MODES = [
        { id: 0, name: "Normal" },
        { id: 1, name: "Multiply" },
        { id: 2, name: "Screen" },
        { id: 3, name: "Overlay" },
        { id: 4, name: "Add" },
        { id: 5, name: "Soft Light" },
        { id: 6, name: "Difference" }
    ];
})();
