(function() {
    "use strict";
    Studio.Shaders.PatternsExtended = [
        {
            name: "Voronoi Cells",
            category: "geometric",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.2, 0.3);\n  vec2 ps = p * u_scale * 3.0;\n  ps += vec2(snoise(vec3(ps*0.5, t)), snoise(vec3(ps*0.5+10.0, t))) * u_warp * 0.3;\n  vec2 ip = floor(ps);\n  vec2 fp = fract(ps);\n  float d1 = 8.0, d2 = 8.0;\n  for (int y = -1; y <= 1; y++) {\n    for (int x = -1; x <= 1; x++) {\n      vec2 neighbor = vec2(float(x), float(y));\n      vec2 point = hash22(ip + neighbor);\n      point = 0.5 + 0.5 * sin(t * 0.5 + 6.2831 * point);\n      vec2 diff = neighbor + point - fp;\n      float dist = dot(diff, diff);\n      if (dist < d1) { d2 = d1; d1 = dist; }\n      else if (dist < d2) { d2 = dist; }\n    }\n  }\n  float f = d2 - d1;\n  f = smoothstep(0.0, 0.15, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Flow Field",
            category: "organic",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.15, 0.3);\n  vec2 ps = p * u_scale;\n  float f = 0.0;\n  vec2 pos = ps;\n  for (int i = 0; i < 20; i++) {\n    vec2 curl = curlNoise(vec3(pos * 1.5, t));\n    pos += curl * 0.02 * u_warp;\n    float trail = snoise(vec3(pos * 3.0, t + float(i) * 0.1));\n    f += abs(trail) * 0.05;\n  }\n  f = smoothstep(0.1, 0.8, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Reaction-Diffusion",
            category: "scientific",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.08, 0.2);\n  vec2 ps = p * u_scale * 4.0;\n  float n1 = fbm(vec3(ps, t * 0.5));\n  float n2 = fbm(vec3(ps * 2.0 + 5.0, t * 0.3));\n  float n3 = snoise(vec3(ps * 0.5, t * 0.2));\n  float pattern = n1 * n2;\n  pattern = smoothstep(0.0, 0.15, abs(pattern - 0.25 + n3 * u_warp * 0.1));\n  float spots = smoothstep(0.6, 0.65, fbm(vec3(ps * 3.0 + t * 0.1, t * 0.15)));\n  float f = mix(pattern, 1.0 - spots, 0.5);\n  f = smoothstep(0.2, 0.8, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Julia Fractal",
            category: "mathematical",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = (uv - 0.5) * 2.0 * u_scale;\n  p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed * 0.01 + u_time * 0.1;\n  vec2 c = vec2(-0.7 + sin(t) * 0.2 * u_warp, 0.27 + cos(t * 0.7) * 0.15 * u_warp);\n  vec2 z = p;\n  float iter = 0.0;\n  for (int i = 0; i < 150; i++) {\n    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;\n    if (dot(z, z) > 4.0) break;\n    iter += 1.0;\n  }\n  float f = iter / 150.0;\n  f = sqrt(f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Truchet Tiles",
            category: "geometric",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.1, 0.2);\n  vec2 ps = p * u_scale * 6.0;\n  ps += vec2(snoise(vec3(p * 0.5, t)), snoise(vec3(p * 0.5 + 5.0, t))) * u_warp * 0.2;\n  vec2 ip = floor(ps);\n  vec2 fp = fract(ps);\n  float h = hash21(ip + vec2(floor(t * 0.2)));\n  if (h > 0.5) fp = 1.0 - fp;\n  float d1 = length(fp);\n  float d2 = length(fp - 1.0);\n  float line1 = abs(d1 - 0.5);\n  float line2 = abs(d2 - 0.5);\n  float f = min(line1, line2);\n  f = 1.0 - smoothstep(0.0, 0.08, f);\n  f += smoothstep(0.48, 0.5, d1) * 0.2;\n  f = clamp(f, 0.0, 1.0);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Kaleidoscope",
            category: "abstract",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv - 0.5;\n  p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.2, 0.3);\n  float a = atan(p.y, p.x);\n  float r = length(p) * u_scale;\n  float segments = 6.0;\n  a = mod(a, 6.2831 / segments);\n  a = abs(a - 3.14159 / segments);\n  vec2 mp = vec2(cos(a), sin(a)) * r;\n  mp += vec2(snoise(vec3(mp * 2.0, t)), snoise(vec3(mp * 2.0 + 5.0, t))) * u_warp * 0.1;\n  float n = fbm(vec3(mp * 3.0, t * 0.5));\n  float rings = sin(r * 8.0 - t) * 0.3;\n  float f = n * 0.5 + 0.5 + rings;\n  f = smoothstep(0.15, 0.85, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Topographic Lines",
            category: "organic",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.08, 0.2);\n  vec2 ps = p * u_scale * 2.0;\n  ps += vec2(snoise(vec3(ps * 0.3, t)), snoise(vec3(ps * 0.3 + 7.0, t))) * u_warp * 0.15;\n  float height = fbm(vec3(ps, t * 0.3));\n  float lines = abs(fract(height * 8.0) - 0.5) * 2.0;\n  lines = smoothstep(0.0, 0.15, lines);\n  float thick = abs(fract(height * 2.0) - 0.5) * 2.0;\n  thick = 1.0 - smoothstep(0.0, 0.05, thick) * 0.5;\n  float f = lines * 0.7 + (1.0 - thick) * 0.3 + height * 0.2;\n  f = smoothstep(0.1, 0.9, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Electric Arcs",
            category: "energy",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.4, 0.5);\n  float f = 0.0;\n  for (int i = 0; i < 5; i++) {\n    float fi = float(i);\n    float y = 0.2 + fi * 0.15;\n    float x = p.x * u_scale * 2.0;\n    float bolt = 0.0;\n    float amp = 0.08 * u_warp;\n    for (int j = 0; j < 6; j++) {\n      float fj = float(j);\n      bolt += amp * snoise(vec3(x * (2.0 + fj * 1.5), fi * 3.0, t * (2.0 + fj * 0.5)));\n      amp *= 0.6;\n    }\n    float dist = abs(p.y - y - bolt);\n    float glow = 0.003 / (dist * dist + 0.001);\n    f += glow * 0.02;\n  }\n  f = clamp(f, 0.0, 1.0);\n  f = pow(f, 0.7);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Smoke",
            category: "organic",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.1, 0.4);\n  vec2 ps = p * u_scale;\n  vec2 curl1 = curlNoise(vec3(ps * 0.8, t * 0.5));\n  vec2 curl2 = curlNoise(vec3(ps * 1.5 + curl1 * u_warp * 0.5, t * 0.3));\n  float n1 = fbm(vec3(ps + curl1 * u_warp * 0.3, t * 0.4)) * 0.5 + 0.5;\n  float n2 = fbm(vec3(ps * 2.0 + curl2 * u_warp * 0.2, t * 0.6)) * 0.5 + 0.5;\n  float n3 = snoise(vec3(ps * 0.5 + curl1 * 0.1, t * 0.2)) * 0.5 + 0.5;\n  float density = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;\n  float rise = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);\n  float f = density * rise;\n  f = smoothstep(0.15, 0.75, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Crystal Lattice",
            category: "geometric",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.15, 0.25);\n  vec2 ps = p * u_scale * 5.0;\n  ps += vec2(snoise(vec3(p, t * 0.3)), snoise(vec3(p + 5.0, t * 0.3))) * u_warp * 0.1;\n  vec2 ip = floor(ps);\n  vec2 fp = fract(ps) - 0.5;\n  float hex = max(abs(fp.x), abs(fp.x * 0.5 + fp.y * 0.866)) * 2.0;\n  float edge = smoothstep(0.9, 0.85, hex);\n  float inner = smoothstep(0.5, 0.45, hex);\n  float shimmer = snoise(vec3(ip, t)) * 0.5 + 0.5;\n  float refract = snoise(vec3(ps * 0.5 + vec2(t * 0.1), t * 0.2)) * 0.3;\n  float f = edge * 0.3 + inner * shimmer * 0.7 + refract;\n  f = smoothstep(0.05, 0.95, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "DNA Helix",
            category: "scientific",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.3, 0.2);\n  float y = p.y * u_scale * 8.0;\n  float x = p.x * u_resolution.x / u_resolution.y;\n  float cx = 0.5 * u_resolution.x / u_resolution.y;\n  float strand1 = sin(y - t * 2.0) * 0.1 * u_warp + cx;\n  float strand2 = sin(y - t * 2.0 + 3.14159) * 0.1 * u_warp + cx;\n  float d1 = abs(x - strand1);\n  float d2 = abs(x - strand2);\n  float helix = smoothstep(0.02, 0.0, d1) + smoothstep(0.02, 0.0, d2);\n  float rungs = 0.0;\n  float spacing = 0.8;\n  for (int i = -8; i <= 8; i++) {\n    float ry = float(i) * spacing;\n    float fy = fract(y / spacing + 0.5 + t * 0.3) - 0.5;\n    if (abs(fy) < 0.05) {\n      float rx1 = strand1 + (strand2 - strand1) * (fy + 0.5);\n      float rung = smoothstep(0.15, 0.0, abs(x - (strand1 + strand2) * 0.5)) * smoothstep(0.05, 0.0, abs(fy));\n      rungs += rung;\n    }\n  }\n  float glow = exp(-min(d1, d2) * 20.0) * 0.3;\n  float particles = smoothstep(0.97, 1.0, hash21(floor(vec2(x * 20.0, y)))) * 0.5;\n  float f = helix + rungs * 0.5 + glow + particles;\n  f = clamp(f, 0.0, 1.0);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Woven Fabric",
            category: "texture",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.05, 0.15);\n  vec2 ps = p * u_scale * 10.0;\n  ps += vec2(snoise(vec3(p * 0.5, t)), snoise(vec3(p * 0.5 + 3.0, t))) * u_warp * 0.05;\n  float warpX = sin(ps.y * 3.14159) * 0.5 + 0.5;\n  float weftY = sin(ps.x * 3.14159) * 0.5 + 0.5;\n  float overUnder = step(0.5, fract(ps.x * 0.5)) * step(0.5, fract(ps.y * 0.5));\n  overUnder += (1.0 - step(0.5, fract(ps.x * 0.5))) * (1.0 - step(0.5, fract(ps.y * 0.5)));\n  float threadX = smoothstep(0.1, 0.15, abs(fract(ps.y) - 0.5));\n  float threadY = smoothstep(0.1, 0.15, abs(fract(ps.x) - 0.5));\n  float f = mix(warpX * threadX, weftY * threadY, overUnder);\n  float shadow = 1.0 - overUnder * 0.15;\n  f *= shadow;\n  f = smoothstep(0.1, 0.9, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Interference Rings",
            category: "abstract",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.25, 0.3);\n  float f = 0.0;\n  for (int i = 0; i < 4; i++) {\n    float fi = float(i);\n    vec2 center = vec2(\n      0.5 * u_resolution.x / u_resolution.y + sin(t * (0.3 + fi * 0.15) + fi * 2.0) * 0.3,\n      0.5 + cos(t * (0.25 + fi * 0.1) + fi * 1.5) * 0.3\n    );\n    float dist = length(p - center);\n    float wave = sin(dist * u_scale * 20.0 - t * 2.0 + fi) * 0.5 + 0.5;\n    wave *= exp(-dist * 2.0);\n    f += wave;\n  }\n  f += snoise(vec3(p * 2.0, t * 0.3)) * u_warp * 0.1;\n  f = smoothstep(0.2, 1.5, f);\n  outputColorRaw(f, uv);\n}"
        },
        {
            name: "Terrain",
            category: "landscape",
            frag: "void main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 p = uv; p.x *= u_resolution.x / u_resolution.y;\n  float t = u_seed + organicTime(u_time, 0.05, 0.15);\n  vec2 ps = p * u_scale;\n  ps += vec2(snoise(vec3(ps * 0.2, t)), snoise(vec3(ps * 0.2 + 10.0, t))) * u_warp * 0.08;\n  float h = fbm(vec3(ps * 2.0, t * 0.2));\n  h += ridgedNoise(vec3(ps * 1.5 + 5.0, t * 0.15)) * 0.3;\n  float eps = 0.01;\n  float hx = fbm(vec3((ps + vec2(eps, 0.0)) * 2.0, t * 0.2));\n  float hy = fbm(vec3((ps + vec2(0.0, eps)) * 2.0, t * 0.2));\n  vec3 normal = normalize(vec3(h - hx, h - hy, eps * 3.0));\n  vec3 light = normalize(vec3(0.5, 0.8, 1.0));\n  float diffuse = max(dot(normal, light), 0.0);\n  float f = h * 0.4 + diffuse * 0.6;\n  f = smoothstep(0.1, 0.9, f);\n  outputColorRaw(f, uv);\n}"
        }
    ];
})();
