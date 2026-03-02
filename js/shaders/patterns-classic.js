(function() {
    "use strict";
    Studio.Shaders.PatternsClassic = [
        {
            name: "Aurora",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  float t=u_seed+organicTime(u_time,0.2,0.3);\n  float wave=0.;\n  for(int i=0;i<5;i++){\n    float fi=float(i);\n    float freq=1.5+fi*1.2;\n    float amp=1./(1.+fi*.8);\n    float offset=snoise(vec3(p.x*.4+fi*2.,fi,t))*u_warp;\n    wave+=amp*sin(p.y*freq*u_scale+offset+t*(.3+fi*.08));\n  }\n  float vfade=smoothstep(0.,.25,p.y)*smoothstep(1.,.55,p.y);\n  float f=smoothstep(-1.2,1.2,wave)*vfade;\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Plasma",
            category: "abstract",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv*u_scale*3.;\n  p.x*=u_resolution.x/u_resolution.y;\n  float t=u_seed+organicTime(u_time,0.5,0.3);\n  float v=sin(p.x*2.+t);\n  v+=sin((p.y*2.+t)*.7);\n  v+=sin((p.x*2.+p.y*2.+t)*.5);\n  float cx=p.x+.5*sin(t*.3)*u_warp;\n  float cy=p.y+.5*cos(t*.2)*u_warp;\n  v+=sin(sqrt(cx*cx+cy*cy+1.)*3.);\n  v+=snoise(vec3(p*.5,t*.3))*u_warp*.5;\n  float f=v*.25+.5;\n  f=smoothstep(.1,.9,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Nebula",
            category: "cosmic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  vec2 ps=p*u_scale;\n  float t=u_seed+organicTime(u_time,0.15,0.3);\n  float d1=fbm(vec3(ps,t));\n  float d2=fbm(vec3(ps*2.+5.2,t*1.3));\n  float depth=fbm(vec3(ps*.5,t*.5+100.));\n  float density=smoothstep(-.3,.8,d1+d2*.5);\n  density*=smoothstep(-.5,.5,depth);\n  density+=smoothstep(.1,0.,length(fract(ps*u_warp*8.)-.5))*step(.97,hash21(floor(ps*u_warp*8.)))*.5;\n  float f=clamp(density,0.,1.);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Soft Orbs",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;\n  float t=u_seed*.1+organicTime(u_time,0.35,0.3);\n  vec2 wv=vec2(snoise(vec3(p,t)),snoise(vec3(p+10.,t)))*u_warp*.08;\n  vec2 pw=p+wv;\n  float rad=.8/u_scale;\n  float f=0.;\n  for(int i=0;i<5;i++){\n    float fi=float(i);\n    vec2 pos=vec2(.5*asp+sin(t*(1.+fi*.3)+fi*1.5)*.35,\n                  .5+cos(t*(.7+fi*.2)+fi*2.)*.3);\n    float sz=rad*(1.-.1*fi);\n    f+=smoothstep(sz,0.,length(pw-pos));\n  }\n  f=clamp(f,0.,1.);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Silk Waves",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  vec2 ps=p*u_scale;\n  float t=u_seed+organicTime(u_time,0.25,0.3);\n  ps.x+=ps.y*1.5;\n  ps.x+=snoise(vec3(ps*.5,t))*u_warp;\n  ps.x+=snoise(vec3(ps*.25,t*.7))*u_warp*.5;\n  float f=sin(ps.x*2.-t)*.5+.5;\n  f*=.85+.15*sin(ps.x*4.+t*1.3);\n  f=smoothstep(.15,.85,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Volumetric Mist",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  float t=u_seed+organicTime(u_time,0.12,0.4);\n  float density=0.,transmit=1.;\n  for(int i=0;i<10;i++){\n    float fi=float(i),z=fi*0.1;\n    vec3 sp=vec3(p*u_scale*(1.+z*0.5),t+z*2.);\n    sp.xy+=vec2(snoise(vec3(p*0.3,t+z)),snoise(vec3(p*0.3+10.,t+z)))*u_warp*0.3;\n    float d=fbm(sp)*0.5+0.5;\n    d=smoothstep(0.3,0.7,d);\n    density+=d*transmit*exp(-fi*0.3)*0.15;\n    transmit*=1.-d*0.1;\n  }\n  float f=clamp(density,0.,1.);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Liquid Metal",
            category: "abstract",
            frag: "float metalScene(vec2 p,float t){\n  float d=100.;\n  float asp=u_resolution.x/u_resolution.y;\n  for(int i=0;i<6;i++){\n    float fi=float(i);\n    vec2 c=vec2(0.5*asp+sin(t*(0.3+fi*0.15)+fi*1.2)*0.3,\n                 0.5+cos(t*(0.25+fi*0.1)+fi*2.5)*0.25);\n    float r=0.12+0.04*sin(t*0.5+fi);\n    d=smin(d,length(p-c)-r,0.15);\n  }\n  return d;\n}\nvoid main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  float t=u_seed+organicTime(u_time,0.25,0.4);\n  p+=vec2(snoise(vec3(p*2.,t)),snoise(vec3(p*2.+10.,t)))*u_warp*0.03;\n  float d=metalScene(p,t);\n  float eps=0.003;\n  float dx=metalScene(p+vec2(eps,0),t)-metalScene(p-vec2(eps,0),t);\n  float dy=metalScene(p+vec2(0,eps),t)-metalScene(p-vec2(0,eps),t);\n  vec3 normal=normalize(vec3(-dx,-dy,eps*2.));\n  vec3 lightDir=normalize(vec3(sin(t*0.3)*0.5,cos(t*0.2)*0.5,1.));\n  float diffuse=max(dot(normal,lightDir),0.);\n  vec3 halfDir=normalize(lightDir+vec3(0,0,1));\n  float spec=pow(max(dot(normal,halfDir),0.),64.);\n  float body=smoothstep(0.01,-0.01,d);\n  float f=body*(diffuse*0.6+0.3)+spec*0.5;\n  f=clamp(f,0.,1.);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Spectral Haze",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;\n  float t=u_seed+organicTime(u_time,0.15,0.4);\n  vec2 ps=p*u_scale*0.8;\n  float n1=snoise(vec3(ps*0.7,t*0.4))*0.5+0.5;\n  float n2=snoise(vec3(ps*0.5+3.7,t*0.3+10.0))*0.5+0.5;\n  float n3=snoise(vec3(ps*0.3+7.1,t*0.2+20.0))*0.5+0.5;\n  float blend=n1*0.4+n2*0.35+n3*0.25;\n  blend+=sin(p.x*3.14159*u_warp+t*0.2)*0.08;\n  blend+=sin(p.y*2.5*u_warp+t*0.15)*0.06;\n  float f=smoothstep(0.15,0.85,blend);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Petal Drift",
            category: "organic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;\n  float t=u_seed+organicTime(u_time,0.18,0.35);\n  vec2 center=vec2(asp*0.5,0.5);\n  vec2 warp=vec2(snoise(vec3(p*0.6,t*0.3)),snoise(vec3(p*0.6+5.0,t*0.25)))*u_warp*0.15;\n  vec2 q=p+warp-center;\n  float r=length(q)*u_scale;\n  float a=atan(q.y,q.x);\n  float petal=0.0;\n  for(int i=0;i<3;i++){\n    float fi=float(i);\n    float petals=3.0+fi*2.0;\n    float phase=t*(0.1+fi*0.05)+fi*1.5;\n    petal+=smoothstep(0.8,0.0,r-0.4-0.2*sin(a*petals+phase))*(1.0-fi*0.25);\n  }\n  float cloud=snoise(vec3(p*u_scale*0.5,t*0.2))*0.3+0.5;\n  float f=mix(cloud,petal*0.5+0.3,smoothstep(1.5,0.0,r));\n  f=smoothstep(0.1,0.9,clamp(f,0.0,1.0));\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Crescent",
            category: "cosmic",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;\n  float t=u_seed+organicTime(u_time,0.1,0.3);\n  vec2 moonCenter=vec2(asp*0.5,0.28);\n  float moonR=0.25*u_scale;\n  float moonDist=length(p-moonCenter);\n  float moon=smoothstep(moonR,moonR-0.008,moonDist);\n  vec2 shadowOff=vec2(0.08*u_warp*sin(t*0.2),0.04*cos(t*0.15));\n  float shadowDist=length(p-moonCenter-shadowOff);\n  float shadow=smoothstep(moonR*0.95,moonR*0.95-0.008,shadowDist);\n  float crescent=max(moon-shadow,0.0);\n  float glow=exp(-moonDist*3.0/moonR)*0.4;\n  float atmoNoise=snoise(vec3(p*3.0,t*0.2))*0.05;\n  float horizon=smoothstep(0.6,0.15,uv.y);\n  float rim=exp(-abs(moonDist-moonR)*40.0)*0.3;\n  rim+=snoise(vec3(p*5.0,t*0.3))*0.02;\n  float f=crescent*0.9+glow*horizon+rim*horizon+atmoNoise*horizon;\n  f=clamp(f,0.0,1.0);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Glass Blocks",
            category: "geometric",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;\n  float t=u_seed+organicTime(u_time,0.12,0.25);\n  vec2 drift=vec2(snoise(vec3(p*0.3,t*0.2)),snoise(vec3(p*0.3+8.0,t*0.15)))*u_warp*0.03;\n  p+=drift;\n  float f=0.0;\n  for(int i=0;i<7;i++){\n    float fi=float(i);\n    vec2 seed=vec2(fi*1.73+u_seed*0.1,fi*2.51+u_seed*0.07);\n    vec2 center=hash22(seed)*vec2(asp,1.0);\n    vec2 size=vec2(0.15+hash21(seed+0.5)*0.2,0.1+hash21(seed+1.5)*0.15)/u_scale;\n    float angle=hash21(seed+2.5)*0.3-0.15;\n    vec2 d=p-center;\n    d=vec2(d.x*cos(angle)-d.y*sin(angle),d.x*sin(angle)+d.y*cos(angle));\n    vec2 q=abs(d)-size;\n    float box=max(q.x,q.y);\n    float block=smoothstep(0.08,-0.04,box);\n    float depth=0.3+hash21(seed+3.5)*0.4;\n    f+=block*depth;\n  }\n  f=1.0-clamp(f,0.0,1.0);\n  f=smoothstep(0.0,1.0,f);\n  outputColorRaw(f,uv);\n}"
        },
        {
            name: "Prism Swirl",
            category: "abstract",
            frag: "void main(){\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 p=uv;\n  float asp=u_resolution.x/u_resolution.y;\n  p.x*=asp;\n  float t=u_seed+organicTime(u_time,0.3,0.3);\n  vec2 center=vec2(asp*0.5,0.5);\n  vec2 warp=vec2(snoise(vec3(p*1.5,t*0.4)),snoise(vec3(p*1.5+5.0,t*0.35)))*u_warp*0.1;\n  vec2 q=p+warp-center;\n  float r=length(q)*u_scale;\n  float a=atan(q.y,q.x);\n  float spiral=a+r*3.0-t*0.8;\n  float swirl=sin(spiral*2.0)*0.3+0.5;\n  float rings=sin(r*8.0-t*1.2)*0.25+0.5;\n  float ridge=ridgedNoise(vec3(p*u_scale*1.5,t*0.25));\n  float f=swirl*0.4+rings*0.25+ridge*0.35;\n  f=smoothstep(0.1,0.9,f);\n  outputColorRaw(f,uv);\n}"
        }
    ];
})();
