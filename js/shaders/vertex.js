(function() {
    "use strict";
    Studio.Shaders.Vertex = "#version 300 es\nin vec2 position;\nout vec2 v_uv;\nvoid main() {\n    v_uv = position * 0.5 + 0.5;\n    gl_Position = vec4(position, 0.0, 1.0);\n}";

    Studio.Shaders.VertexSimple = "#version 300 es\nin vec2 position;\nvoid main() {\n    gl_Position = vec4(position, 0.0, 1.0);\n}";
})();
