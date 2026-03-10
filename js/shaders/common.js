(function() {
    "use strict";

    Studio.Shaders.Common = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_scale;
uniform float u_warp;
uniform float u_grain;
uniform float u_bloom;
uniform float u_vignette;
uniform vec3 u_colors[5];
uniform int u_numColors;
uniform vec2 u_focal;
uniform float u_angle;
uniform float u_loopDuration;

float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}
vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
}

vec3 srgbToLinear(vec3 c) {
    c = max(c, vec3(0.0));
    vec3 lo = c / 12.92;
    vec3 hi = pow((c + 0.055) / 1.055, vec3(2.4));
    return mix(lo, hi, step(vec3(0.04045), c));
}
vec3 linearToSrgb(vec3 c) {
    c = max(c, vec3(0.0));
    vec3 lo = c * 12.92;
    vec3 hi = 1.055 * pow(c, vec3(1.0/2.4)) - 0.055;
    return mix(lo, hi, step(vec3(0.0031308), c));
}
vec3 linearToOklab(vec3 c) {
    float l = 0.4122214708*c.r + 0.5363325363*c.g + 0.0514459929*c.b;
    float m = 0.2119034982*c.r + 0.6806995451*c.g + 0.1073969566*c.b;
    float s = 0.0883024619*c.r + 0.2817188376*c.g + 0.6299787005*c.b;
    float l_ = pow(max(l,0.0), 1.0/3.0);
    float m_ = pow(max(m,0.0), 1.0/3.0);
    float s_ = pow(max(s,0.0), 1.0/3.0);
    return vec3(
        0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
        1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
        0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
    );
}
vec3 oklabToLinear(vec3 c) {
    float l_ = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
    float m_ = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
    float s_ = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
    float l = l_*l_*l_;
    float m = m_*m_*m_;
    float s = s_*s_*s_;
    return vec3(
        +4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
        -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
        -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    );
}

vec3 getColor(int i) {
    if (i == 0) return u_colors[0];
    if (i == 1) return u_colors[1];
    if (i == 2) return u_colors[2];
    if (i == 3) return u_colors[3];
    return u_colors[4];
}
vec3 paletteColor(float t) {
    t = clamp(t, 0.0, 1.0);
    if (u_numColors <= 1) return oklabToLinear(linearToOklab(srgbToLinear(getColor(0))));
    float seg = float(u_numColors - 1);
    float ft = t * seg;
    int i0 = int(floor(ft));
    float frac = ft - float(i0);
    if (i0 >= u_numColors - 1) { i0 = u_numColors - 2; frac = 1.0; }
    int i1 = i0 + 1;
    vec3 c0 = srgbToLinear(getColor(i0));
    vec3 c1 = srgbToLinear(getColor(i1));
    vec3 ok0 = linearToOklab(c0);
    vec3 ok1 = linearToOklab(c1);
    return oklabToLinear(mix(ok0, ok1, frac));
}

vec3 mod289_3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289_4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289_4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g,l.zxy);
    vec3 i2=max(g,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289_3(i);
    vec4 p=permute(permute(permute(
        i.z+vec4(0.,i1.z,i2.z,1.))+
        i.y+vec4(0.,i1.y,i2.y,1.))+
        i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 x){
    float v=0.,a=.5;vec3 shift=vec3(100.);
    for(int i=0;i<5;++i){v+=a*snoise(x);x=x*2.+shift;a*=.5;}
    return v;
}

float ridgedNoise(vec3 p){
    float v=0.,a=.5,prev=1.;
    for(int i=0;i<5;++i){
        float n=1.-abs(snoise(p));n=n*n;
        v+=n*a*prev;prev=n;p*=2.1;a*=.5;
    }
    return v;
}

vec2 curlNoise(vec3 p) {
    float eps = 0.001;
    float n1 = snoise(vec3(p.x, p.y + eps, p.z));
    float n2 = snoise(vec3(p.x, p.y - eps, p.z));
    float a = (n1 - n2) / (2.0 * eps);
    n1 = snoise(vec3(p.x + eps, p.y, p.z));
    n2 = snoise(vec3(p.x - eps, p.y, p.z));
    float b = (n1 - n2) / (2.0 * eps);
    return vec2(a, -b);
}
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h*h*h*k*(1.0/6.0);
}

float compositionWeight(vec2 uv, vec2 focal) {
    vec2 d = uv - focal;
    return exp(-dot(d, d) * 2.5);
}
float organicTime(float t, float rate, float breathe) {
    if (u_loopDuration > 0.0) {
        float p = t * 6.28318 / u_loopDuration;
        return cos(p) * rate * 0.3 + cos(p * 2.0) * rate * 0.15
             + cos(p * 3.0) * breathe * 0.3 + cos(p * 5.0) * breathe * 0.15;
    }
    return t * rate + sin(t * rate * 0.3) * breathe + sin(t * rate * 0.7) * breathe * 0.5;
}
vec2 rotateP(vec2 p, float asp) {
    vec2 c = vec2(asp * 0.5, 0.5);
    p -= c;
    float ca = cos(u_angle), sa = sin(u_angle);
    p = vec2(ca*p.x - sa*p.y, sa*p.x + ca*p.y);
    p += c;
    if (u_loopDuration > 0.0) {
        float lp = u_time * 6.28318 / u_loopDuration;
        p += vec2(cos(lp), sin(lp)) * 0.12;
    }
    return p;
}

vec3 acesTonemap(vec3 x) {
    float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

out vec4 fragColor;

void outputColor(float f, vec2 uv) {
    float cw = compositionWeight(uv, u_focal);
    f *= 0.3 + 0.7 * cw;
    vec3 col = paletteColor(f);
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col += max(lum - 0.4, 0.0) * u_bloom * 2.0 * col;
    col = acesTonemap(col * 1.1);
    vec2 vigUV = uv - 0.5;
    col *= 1.0 - dot(vigUV, vigUV) * u_vignette * 1.5;
    float lum2 = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(col * vec3(0.97, 0.98, 1.04), col * vec3(1.03, 1.01, 0.97), smoothstep(0.0, 1.0, lum2));
    col = linearToSrgb(col);
    col += (hash21(gl_FragCoord.xy + 0.5) - 0.5) / 128.0;
    float gs = hash21(gl_FragCoord.xy + vec2(sin(u_time*137.0)*100.0, cos(u_time*241.0)*100.0));
    col += (gs - 0.5) * u_grain * 2.0;
    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}

// Raw output for layer FBO (no tonemapping/vignette/grain - those go in post-processing)
void outputColorRaw(float f, vec2 uv) {
    float cw = compositionWeight(uv, u_focal);
    f *= 0.3 + 0.7 * cw;
    vec3 col = paletteColor(f);
    fragColor = vec4(col, 1.0);
}

// Direct RGB output for layer FBO — bypasses palette mapping, expects linear RGB input
void outputColorDirect(vec3 col, vec2 uv) {
    float cw = compositionWeight(uv, u_focal);
    col *= (0.3 + 0.7 * cw);
    fragColor = vec4(col, 1.0);
}
`;

})();
