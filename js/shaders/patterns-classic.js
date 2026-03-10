(function() {
    "use strict";
    Studio.Shaders.PatternsClassic = [
        {
            name: "Aurora",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed+organicTime(u_time,0.2,0.3);\n  float wave=0.;\n  for(int i=0;i<5;i++){\n    float fi=float(i);\n    float freq=1.5+fi*1.2;\n    float amp=1./(1.+fi*.8);\n    float offset=snoise(vec3(p.x*.4+fi*2.,fi,t))*u_warp;\n    wave+=amp*sin(p.y*freq*u_scale+offset+t*(.3+fi*.08));\n  }\n  float vfade=smoothstep(0.,.25,p.y)*smoothstep(1.,.55,p.y);\n  float f=smoothstep(-1.2,1.2,wave)*vfade;\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Plasma",
            category: "abstract",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  float asp=u_resolution.x/u_resolution.y;\n  vec2 p=uv*u_scale*3.;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed+organicTime(u_time,0.5,0.3);\n  float v=sin(p.x*2.+t);\n  v+=sin((p.y*2.+t)*.7);\n  v+=sin((p.x*2.+p.y*2.+t)*.5);\n  float cx=p.x+.5*sin(t*.3)*u_warp;\n  float cy=p.y+.5*cos(t*.2)*u_warp;\n  v+=sin(sqrt(cx*cx+cy*cy+1.)*3.);\n  v+=snoise(vec3(p*.5,t*.3))*u_warp*.5;\n  float f=v*.25+.5;\n  f=smoothstep(.1,.9,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Soft Orbs",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed*.1+organicTime(u_time,0.35,0.3);\n  vec2 wv=vec2(snoise(vec3(p,t)),snoise(vec3(p+10.,t)))*u_warp*.08;\n  vec2 pw=p+wv;\n  float rad=.8/u_scale;\n  float f=0.;\n  for(int i=0;i<5;i++){\n    float fi=float(i);\n    vec2 pos=vec2(.5*asp+sin(t*(1.+fi*.3)+fi*1.5)*.35,\n                  .5+cos(t*(.7+fi*.2)+fi*2.)*.3);\n    float sz=rad*(1.-.1*fi);\n    f+=smoothstep(sz,0.,length(pw-pos));\n  }\n  f=clamp(f,0.,1.);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Silk Waves",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  vec2 ps=p*u_scale;\n  float t=u_seed+organicTime(u_time,0.25,0.3);\n  ps.x+=ps.y*1.5;\n  ps.x+=snoise(vec3(ps*.5,t))*u_warp;\n  ps.x+=snoise(vec3(ps*.25,t*.7))*u_warp*.5;\n  float f=sin(ps.x*2.-t)*.5+.5;\n  f*=.85+.15*sin(ps.x*4.+t*1.3);\n  f=smoothstep(.15,.85,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Spectral Haze",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed+organicTime(u_time,0.15,0.4);\n  vec2 ps=p*u_scale*0.8;\n  float n1=snoise(vec3(ps*0.7,t*0.4))*0.5+0.5;\n  float n2=snoise(vec3(ps*0.5+3.7,t*0.3+10.0))*0.5+0.5;\n  float n3=snoise(vec3(ps*0.3+7.1,t*0.2+20.0))*0.5+0.5;\n  float blend=n1*0.4+n2*0.35+n3*0.25;\n  blend+=sin(p.x*3.14159*u_warp+t*0.2)*0.08;\n  blend+=sin(p.y*2.5*u_warp+t*0.15)*0.06;\n  float f=smoothstep(0.15,0.85,blend);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Gradient Mesh",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed+organicTime(u_time,0.08,0.3);\n  vec2 q=p*u_scale*0.4;\n  vec2 w1=vec2(snoise(vec3(q*0.5,t*0.2)),snoise(vec3(q*0.5+3.0,t*0.15)))*u_warp*0.5;\n  vec2 w2=vec2(snoise(vec3(q*0.3+7.0,t*0.12)),snoise(vec3(q*0.3+11.0,t*0.1)))*u_warp*0.4;\n  float n1=snoise(vec3(q*0.35+w1,t*0.12))*0.5+0.5;\n  float n2=snoise(vec3(q*0.25+w2+5.0,t*0.08))*0.5+0.5;\n  float n3=snoise(vec3(q*0.15+w1*0.5+w2*0.3+10.0,t*0.06))*0.5+0.5;\n  float f=n1*0.4+n2*0.35+n3*0.25;\n  f=smoothstep(0.12,0.88,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Color Mesh",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;p=rotateP(p,asp);\n  float t=u_seed+organicTime(u_time,0.08,0.25);\n  vec2 q=p*u_scale*0.4;\n  vec2 w1=vec2(snoise(vec3(q*0.5,t*0.15)),snoise(vec3(q*0.5+3.0,t*0.12)))*u_warp*0.5;\n  vec2 w2=vec2(snoise(vec3((q+w1)*0.3+7.0,t*0.1)),snoise(vec3((q+w1)*0.3+11.0,t*0.08)))*u_warp*0.3;\n  vec2 pw=p+w1+w2;\n  float power=2.5;\n  vec3 blended=vec3(0.0);\n  float totalW=0.0;\n  for(int i=0;i<5;i++){\n    if(i>=u_numColors) break;\n    float fi=float(i);\n    float theta=fi*6.2831853/1.6180339887;\n    float radius=0.28+fi*0.04;\n    vec2 anchor=vec2(0.5*asp+cos(theta)*radius*asp*0.5,0.5+sin(theta)*radius*0.5);\n    anchor.x+=sin(t*(0.11+fi*0.03)+fi*2.7)*0.15*asp;\n    anchor.y+=cos(t*(0.09+fi*0.02)+fi*1.9)*0.12;\n    float d=max(distance(pw,anchor),0.001);\n    float w=1.0/pow(d,power);\n    blended+=srgbToLinear(getColor(i))*w;\n    totalW+=w;\n  }\n  blended/=totalW;\n  outputColorDirect(blended,uv);\n}"
        },
    ];
})();
