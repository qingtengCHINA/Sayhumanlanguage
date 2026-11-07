"use client";

import { useEffect, useRef, useState } from "react";
import RewriteLoader, { useElapsed } from "@/components/RewriteLoader";

/*
  DITHER MIND — WebGL2 ordered (4×4 Bayer) dithering of morphing SDF shapes,
  adapted from shridharathi/visual-agent-chat (public/index.html, MIT-style repo),
  whose dithering core is ported from Paper Shaders
  (https://shaders.paper.design/dithering, Apache-2.0, Copyright 2026 Paper).

  讲人话版叙事：打开的书（读原文）→ 拼图块（拆解套话）→ 灯泡（人话成形），
  加载中循环变形。出现时散点汇聚（conjure），像素由粗到细，Bayer 矩阵每 1/17 级
  一步微闪。一个 fragment = 一个抖动格子，canvas 按 2csspx/格低分辨率渲染后
  pixelated 放大。无 WebGL2 时回退到 RewriteLoader。
*/

const CELL = 2; // css px per dither cell

const VERT = `#version 300 es
in vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform int uA; uniform int uB; uniform float uT;
uniform float uEnergy; uniform float uForm; uniform float uPix; uniform float uShimmer;
uniform vec3 uFront;
out vec4 outColor;
float dot2(vec2 v){return dot(v,v);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdCircle(vec2 p,float r){return length(p)-r;}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float sdRBox(vec2 p,vec2 b,float r){return sdBox(p,b-r)-r;}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float cut(float d,float g,float w){return max(d,w-g);}
float lines(float v,float st){return abs(fract(v/st+.5)-.5)*st;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
mat3 R;
float shape(int id,vec2 p){
  float d=1.,g=1.;
  if(id==0){ // 打开的书：读原文
    d=min(sdRBox(p-vec2(-.31,0),vec2(.29,.42),.03),sdRBox(p-vec2(.31,0),vec2(.29,.42),.03));
    g=min(abs(p.x),max(lines(p.y,.12),sdBox(vec2(abs(p.x)-.31,p.y),vec2(.19,.3))));d=cut(d,g,.014);}
  else if(id==1){ // 拼图块：拆解痕迹（呼吸+微倾）
    p=rot(.14*sin(uTime*1.8))*p;float k=.13+.018*sin(uTime*3.2);
    d=sdRBox(p,vec2(.36),.02);
    d=min(d,sdCircle(p-vec2(0,.47),k));
    d=min(d,sdCircle(p-vec2(.47,0),k));
    d=max(d,-sdCircle(p-vec2(-.36,0),k));
    d=max(d,-sdCircle(p-vec2(0,-.36),k));}
  else { // 灯泡：人话成形
    d=min(sdCircle(p-vec2(0,.16),.38),sdRBox(p-vec2(0,-.36),vec2(.16,.15),.03));
    d=cut(d,max(lines(p.y,.08),sdBox(p-vec2(0,-.36),vec2(.2,.12))),.012);
    d=cut(d,sdSeg(p,vec2(-.1,.05),vec2(.1,.05)),.018);}
  return d;
}
// Extrude the 2D silhouette into a rounded solid slab.
float slab(int id,vec3 p){
  vec2 q=vec2(shape(id,p.xy)+.04,abs(p.z)-.16);
  return min(max(q.x,q.y),0.)+length(max(q,0.))-.04;
}
float map(vec3 w){
  vec3 p=R*w;float d;
  if(uT<=.001) d=slab(uA,p); else if(uT>=.999) d=slab(uB,p); else d=mix(slab(uA,p),slab(uB,p),uT);
  return d;
}
vec3 calcN(vec3 p){
  const vec2 k=vec2(1,-1);float e=.004;
  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));
}
void main(){
  // Pixelation: while a shape resolves, every uPix x uPix block samples its centre, so it sharpens from coarse to fine.
  vec2 fc=(floor(gl_FragCoord.xy/uPix)+.5)*uPix;
  vec2 uv=(fc-.5*uRes)/(uRes.y*.5);
  // Conjure: every cell first samples the shape from a random, swirled, enlarged position; as uForm -> 1 the dots pull together.
  float kf=1.-uForm; kf=kf*kf;
  vec2 cellc=floor(fc);
  // Soft, wobbling round edge for the loose dots so the cloud never shows the tile's square.
  vec2 suv=uv; float sang=atan(suv.y,suv.x);
  float sedge=.8+.1*sin(sang*3.+uTime*.6)+.07*sin(sang*5.-uTime*.9);
  float fall=1.-smoothstep(sedge-.6,sedge+.12,length(suv));
  vec2 jit=vec2(hash(cellc),hash(cellc+17.3))-.5;
  jit+=.18*vec2(sin(uTime*1.7+hash(cellc+3.1)*6.283),cos(uTime*1.4+hash(cellc+9.7)*6.283)); // scattered dots drift
  uv=rot(kf*(2.6+uTime*.35))*uv*(1.+kf*1.4)+jit*kf*2.6;
  float yaw=(.55+.32*sin(uTime*.45)), pitch=(.42+.04*sin(uTime*.7));
  float cy=cos(yaw),sy=sin(yaw),cp=cos(pitch),sp=sin(pitch);
  mat3 RY=mat3(cy,0.,sy, 0.,1.,0., -sy,0.,cy);
  mat3 RX=mat3(1.,0.,0., 0.,cp,-sp, 0.,sp,cp);
  R=RY*RX;
  vec3 ro=vec3(0.,.05,3.3);
  vec3 rd=normalize(vec3(uv*.92,-2.6));
  vec3 L=normalize(vec3(-.55,.85,.5));
  float lum=0.;
  // Bounding sphere test keeps empty pixels cheap.
  float b=dot(ro,rd),c=dot(ro,ro)-1.3*1.3,disc=b*b-c;
  bool hit=false; float t=0.;
  if(disc>0.){
    t=max(-b-sqrt(disc),0.);float tmax=-b+sqrt(disc);
    for(int i=0;i<72;i++){
      float d=map(ro+rd*t);
      if(d<.0015){hit=true;break;}
      t+=d*.85;
      if(t>tmax)break;
    }
  }
  if(hit){
    vec3 pos=ro+rd*t,n=calcN(pos);
    float dif=max(dot(n,L),0.);
    float rim=pow(1.-max(dot(n,-rd),0.),3.)*.25;
    float lit=clamp(.18+.82*dif+rim,0.,1.);
    lum=.12+.82*(1.-lit);
  }else if(rd.y<0.){
    // Dotted ground shadow under the object.
    float tg=(-.82-ro.y)/rd.y; vec3 g=ro+rd*tg;
    vec2 sp2=(g.xz-vec2(.18,-.05));
    float sh=1.-smoothstep(.1,.75,length(sp2*vec2(1.,1.6)));
    lum=sh*.2;
  }
  if(!hit){
    vec2 cell=floor(fc);
    lum+=step(.992-.012*uEnergy,hash(cell+floor(uTime*10.)))*uEnergy*.6*smoothstep(1.4,.4,length(uv));
  }
  lum*=mix(1.,fall,kf);
  lum=max(lum,step(.972,hash(cellc+3.1))*kf*.95*step(hash(cellc+7.7),fall));   // loose specks, thinning out toward the edge
  // Ordered 4x4 Bayer dithering with 17 tone levels (after Niccolo Fanton's real-time dithering shader, Codrops 2025):
  // tones past 1/17 and 16/17 skip the matrix so flat areas stay clean, and while the agent works the matrix steps
  // one cell at a time for a quiet shimmer. One fragment = 2 css px, grid centred on the canvas.
  float tone=clamp(lum,0.,1.), on;
  if(tone<1./17.) on=0.;
  else if(tone>16./17.) on=1.;
  else {
    float f=floor(uTime*9.)*uShimmer;
    vec2 q=mod(floor(gl_FragCoord.xy-.5*uRes)+vec2(f,f*3.),4.);
    on=step(float(BAYER[int(q.y)*4+int(q.x)]+1)/17.,tone);
  }
  outColor=on>.5?vec4(uFront,1.):vec4(0.);
}`;

// bayer4x4 以常量字符串拼进 shader（GLSL ES 数组初始化器兼容性更稳）
const BAYER_GLSL = `const int BAYER[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);`;
const FRAG_SRC = FRAG.replace("float hash(vec2 p)", `${BAYER_GLSL}\nfloat hash(vec2 p)`);

// 形状叙事顺序：书 → 拼图 → 灯泡，来回往复
const SEQUENCE = [0, 1, 2];

export default function DitherMind({ size = 148 }: { size?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [glFailed, setGlFailed] = useState(false);
  const elapsed = useElapsed(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.imageRendering = "pixelated";
    canvas.style.display = "block";
    const glCtx = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!glCtx) {
      setGlFailed(true);
      return;
    }
    const gl = glCtx;

    // ---- program ----
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG_SRC);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(prog));
      setGlFailed(true);
      return;
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      res: U("uRes"), time: U("uTime"), a: U("uA"), b: U("uB"), t: U("uT"),
      energy: U("uEnergy"), form: U("uForm"), pix: U("uPix"), shimmer: U("uShimmer"),
      front: U("uFront"),
    };
    // 暖白 = 人写的部分，与 logo 笔画同源
    gl.uniform3f(u.front, 0xE7 / 255, 0xEC / 255, 0xF5 / 255);
    gl.uniform1f(u.form, 1);
    gl.uniform1f(u.pix, 1);
    gl.uniform1f(u.shimmer, 1);
    gl.clearColor(0, 0, 0, 0);

    // ---- mind state ----
    let A = 0, B = 0, t0 = -1e9, form = 1, boost = 0, raf = 0, last = 0;
    let visible = true, seqIdx = 0;
    const show = (id: number) => {
      if (id !== B) {
        const now = performance.now();
        const t = Math.min(1, (now - t0) / 950);
        A = t < 0.5 ? A : B;
        B = id;
        t0 = now;
      }
      kick();
    };
    // 出现时散点汇聚成第一形状
    A = B = SEQUENCE[0];
    t0 = -1e9;
    form = 0;

    const shapeTimer = window.setInterval(() => {
      seqIdx = seqIdx >= SEQUENCE.length - 1 ? 0 : seqIdx + 1;
      show(SEQUENCE[seqIdx]);
    }, 2600);

    // ---- sizing ----
    const resize = () => {
      const r = host.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width / CELL));
      const hgt = Math.max(1, Math.round(r.height / CELL));
      if (canvas.width !== w || canvas.height !== hgt) {
        canvas.width = w;
        canvas.height = hgt;
        gl.viewport(0, 0, w, hgt);
      }
      gl.uniform2f(u.res, w, hgt);
      kick();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      kick();
    });
    visibilityObserver.observe(host);

    // ---- loop ----
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const start = performance.now();
    function frame(now: number) {
      raf = 0;
      const dt = Math.min(64, last ? now - last : 16);
      last = now;
      const k = Math.min(1, (now - t0) / 950);
      const t = ease(k);
      if (form < 1) form = Math.min(1, form + (dt / 1000) * (0.45 + boost));
      boost *= Math.pow(0.92, dt / 16.7);
      const fe = 1 - Math.pow(1 - form, 3);
      gl.uniform1f(u.time, reduced ? 0 : (now - start) / 1000 * 0.7);
      gl.uniform1i(u.a, A);
      gl.uniform1i(u.b, B);
      gl.uniform1f(u.t, t);
      gl.uniform1f(u.form, fe);
      gl.uniform1f(u.pix, fe < 0.3 ? 4 : fe < 0.6 ? 3 : fe < 0.85 ? 2 : 1);
      gl.uniform1f(u.energy, 1);
      gl.uniform1f(u.shimmer, reduced ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const settling = k < 1 || form < 1 || boost > 0.01;
      if (visible && !document.hidden && (!reduced || settling)) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    host.appendChild(canvas);
    resize();
    gl.drawArrays(gl.TRIANGLES, 0, 3); // warm-up draw: shader 编译提前完成

    return () => {
      window.clearInterval(shapeTimer);
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
      {glFailed ? (
        <RewriteLoader />
      ) : (
        <>
          <div
            ref={hostRef}
            aria-hidden
            className="relative"
            style={{ width: size, height: size }}
          />
          <p className="text-[13px] font-medium text-muted">
            正在去掉套话
            <span className="ml-2 font-mono text-[12px] tabular-nums text-muted">{elapsed}</span>
          </p>
        </>
      )}
    </div>
  );
}
