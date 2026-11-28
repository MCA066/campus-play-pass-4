import React,{useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowRight,ChevronLeft,ChevronRight,Play,Pause} from 'lucide-react';
const THREE_URL='https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const SPORTS=[
 {name:'Football',title:'Own the pitch.',description:'Find your squad. Challenge your rivals. Make every match count.',accent:'#bca6ff',detail:'The beautiful game',number:'01'},
 {name:'Cricket',title:'Raise your game.',description:'Build your team and compete from the first ball to the final over.',accent:'#f4ce87',detail:'Every ball matters',number:'02'},
 {name:'Chess',title:'Think. Move. Win.',description:'Challenge a friend online and build a game history worth studying.',accent:'#9be7df',detail:'A battle of minds',number:'03'}
];
function FallbackArt({sport}){
 return <svg className="arena-fallback-art" viewBox="0 0 440 360" role="img" aria-label={sport+' arena illustration'}>
 <defs><radialGradient id="arena-static-bg"><stop stopColor="#6c43b6" stopOpacity=".5"/><stop offset="1" stopColor="#151022" stopOpacity="0"/></radialGradient><linearGradient id="arena-static-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2b8"/><stop offset=".48" stopColor="#b78132"/><stop offset="1" stopColor="#f9ce78"/></linearGradient><linearGradient id="arena-static-silver" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eee8ff"/><stop offset="1" stopColor="#66558d"/></linearGradient></defs>
 <ellipse cx="220" cy="167" rx="218" ry="160" fill="url(#arena-static-bg)"/><ellipse cx="220" cy="289" rx="153" ry="33" fill="#191127" stroke="#8f75c1"/><ellipse cx="220" cy="288" rx="118" ry="22" fill="none" stroke="#e5b85d" opacity=".65"/>
 <g stroke="#bda6ff" fill="none" opacity=".3"><ellipse cx="220" cy="170" rx="181" ry="51" transform="rotate(-24 220 170)"/><ellipse cx="220" cy="170" rx="181" ry="51" transform="rotate(24 220 170)"/></g>
 {sport==='Football'?<g><circle cx="220" cy="159" r="101" fill="url(#arena-static-silver)" stroke="#f7d28a" strokeWidth="2"/><g fill="#271c40" stroke="#a794d0" strokeWidth="2"><path d="M220 113l46 33-18 54h-56l-18-54z"/><path d="M220 58l-38 20 2 37 36 12 36-12 2-37z"/><path d="M124 127l40 12 12 43-37 23-19-23z"/><path d="M316 127l-40 12-12 43 37 23 19-23z"/><path d="M184 242l11-36h50l11 36-36 18z"/></g></g>:sport==='Cricket'?<g><g transform="rotate(24 220 170)"><rect x="189" y="45" width="62" height="181" rx="12" fill="url(#arena-static-gold)"/><rect x="208" y="5" width="24" height="62" rx="9" fill="#a993e1"/><path d="M203 84v123m34-123v123" stroke="#fff2c6" opacity=".5"/></g><circle cx="284" cy="220" r="49" fill="#8f3047" stroke="#ffb6af" strokeWidth="2"/><path d="M257 181q59 38 54 78m-62-71q60 38 55 78" fill="none" stroke="#f9e7d5" strokeWidth="2" strokeDasharray="5 4"/></g>:<g fill="url(#arena-static-gold)" stroke="#fbe0a7" strokeWidth="2"><path d="M185 259h70l17 17v8H168v-8z M186 254q0-45 19-76l-24-22 13-18-17-20 43-27 23-36 18 38-12 23q36 36 6 74l-4 64z"/><circle cx="228" cy="130" r="4" fill="#2d1d38" stroke="none"/></g>}
 </svg>
}
export function ArenaScene({sport,paused}){
 const host=useRef(null),control=useRef({sport,paused}),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 control.current={sport,paused};
 const reduced=useReducedMotion();
 useEffect(()=>{
  if(reduced||!host.current)return;
  let disposed=false,cleanup=()=>{};
  import(/* @vite-ignore */ THREE_URL).then(T=>{
   if(disposed||!host.current)return;
   const mount=host.current;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x100c1b,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
   renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement);
   const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,80);camera.position.set(0,1.9,8.6);camera.lookAt(0,.35,0);
   const light=new T.HemisphereLight(0xe7d8ff,0x332044,2.15);scene.add(light);
   for(const [color,intensity,x,y,z] of [[0xffe4a8,85,4,4,4],[0x9a69ff,115,-4,2,-2],[0x72d5f7,45,0,4,-4]]){const l=new T.PointLight(color,intensity,25,2);l.position.set(x,y,z);scene.add(l)}
   // Procedural studio environment for real metallic reflections, no texture downloads.
   const studio=new T.Scene();studio.background=new T.Color(0x34294c);
   const panel=(x,y,z,w,h,color)=>{const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh)};
   panel(-4,2,2,3,6,0xbda1ff);panel(4,2,2,3,5,0xffe2a1);panel(0,5,0,5,4,0xffffff);panel(0,1,-5,4,3,0x7462bc);
   const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(studio,.05);scene.environment=env.texture;
   const mat=(color,metalness=.7,roughness=.24)=>new T.MeshStandardMaterial({color,metalness,roughness});
   const gold=mat(0xeabf69,.94,.22),dark=mat(0x28203e,.65,.32),silver=mat(0xe4ddf5,.58,.24),red=mat(0xa62845,.12,.32),wood=mat(0xd9ad64,.25,.38),grip=mat(0x4b336e,.15,.48);
   const mesh=(g,m,parent,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o};
   const lathe=(pairs,m,p)=>mesh(new T.LatheGeometry(pairs.map(([x,y])=>new T.Vector2(x,y)),64),m,p);
   const base= new T.Group();scene.add(base);base.position.y=-1.45;
   mesh(new T.CylinderGeometry(2.02,2.12,.16,80),dark,base);
   mesh(new T.TorusGeometry(1.93,.026,12,100),gold,base,0,.095,0).rotation.x=Math.PI/2;
   mesh(new T.TorusGeometry(1.5,.014,8,100),gold,base,0,.10,0).rotation.x=Math.PI/2;
   const group=new T.Group();group.position.y=.25;scene.add(group);
   const objects={};
   const football=new T.Group();group.add(football);objects.Football=football;
   // Truncated icosahedron: exact 12 pentagons and 20 hexagons projected to a sphere.
   const ico=new T.IcosahedronGeometry(1,0),pos=ico.attributes.position,verts=[],faces=[];
   for(let i=0;i<pos.count;i+=3){const ids=[];for(let j=0;j<3;j++){const v=new T.Vector3().fromBufferAttribute(pos,i+j);let idx=verts.findIndex(a=>a.distanceTo(v)<.001);if(idx<0){idx=verts.length;verts.push(v)}ids.push(idx)}faces.push(ids)}ico.dispose();
   const around=verts.map(()=>new Set());faces.forEach(([a,b,c])=>{around[a].add(b);around[a].add(c);around[b].add(a);around[b].add(c);around[c].add(a);around[c].add(b)});
   const cut=(a,b)=>verts[a].clone().lerp(verts[b],1/3).normalize().multiplyScalar(1.19);
   function patch(points,material){const center=points.reduce((v,p)=>v.add(p),new T.Vector3()).multiplyScalar(1/points.length).normalize().multiplyScalar(1.20);const data=[];const normal=center.clone().normalize();for(let i=0;i<points.length;i++){let a=points[i].clone().lerp(center,.035),b=points[(i+1)%points.length].clone().lerp(center,.035);if(a.clone().sub(center).cross(b.clone().sub(center)).dot(normal)<0)[a,b]=[b,a];data.push(...center.toArray(),...a.toArray(),...b.toArray())}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data,3));g.computeVertexNormals();mesh(g,material,football)}
   mesh(new T.SphereGeometry(1.08,48,32),dark,football);
   for(const [a,b,c] of faces)patch([cut(a,b),cut(b,a),cut(b,c),cut(c,b),cut(c,a),cut(a,c)],silver);
   verts.forEach((v,i)=>{const n=v.clone().normalize(),u=new T.Vector3(0,1,0).cross(n);if(u.length()<.01)u.set(1,0,0);u.normalize();const w=n.clone().cross(u);const pts=[...around[i]].map(j=>cut(i,j)).sort((a,b)=>Math.atan2(a.dot(w),a.dot(u))-Math.atan2(b.dot(w),b.dot(u)));patch(pts,gold)});
   const cricket=new T.Group();group.add(cricket);objects.Cricket=cricket;
   const bat=new T.Group();cricket.add(bat);bat.rotation.z=-.35;bat.position.set(-.27,.1,0);
   const shape=new T.Shape();shape.moveTo(-.34,-1.1);shape.quadraticCurveTo(-.42,-1.15,-.42,-.95);shape.lineTo(-.40,.58);shape.quadraticCurveTo(-.39,.78,-.12,.86);shape.lineTo(.12,.86);shape.quadraticCurveTo(.39,.78,.40,.58);shape.lineTo(.42,-.95);shape.quadraticCurveTo(.42,-1.15,.34,-1.1);shape.closePath();
   const blade=mesh(new T.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:true,bevelThickness:.055,bevelSize:.045,bevelSegments:3,steps:1}),wood,bat);blade.position.z=-.07;
   mesh(new T.CylinderGeometry(.095,.10,.76,28),grip,bat,0,1.16);
   for(let i=0;i<9;i++)mesh(new T.TorusGeometry(.096,.012,8,26),gold,bat,0,.84+i*.075,0).rotation.x=Math.PI/2;
   const ball=new T.Group();cricket.add(ball);ball.position.set(.83,-.64,.57);mesh(new T.SphereGeometry(.53,48,32),red,ball);
   for(const y of [-.03,.03])mesh(new T.TorusGeometry(Math.sqrt(.53**2-y*y),.012,10,64),gold,ball,0,y,0).rotation.x=Math.PI/2;
   ball.rotation.z=.68;
   const chess=new T.Group();group.add(chess);objects.Chess=chess;
   const king=new T.Group();chess.add(king);king.position.set(-.45,-1.07,0);
   lathe([[0,0],[.58,0],[.63,.09],[.63,.17],[.53,.25],[.45,.29],[.43,.42],[.32,.55],[.22,1.15],[.35,1.3],[.36,1.39],[.27,1.45],[.43,1.62],[.42,1.73],[.29,1.82],[0,1.82]],gold,king);
   mesh(new T.BoxGeometry(.16,.58,.18),gold,king,0,2.02);mesh(new T.BoxGeometry(.48,.15,.18),gold,king,0,2.09);
   const pawn=new T.Group();chess.add(pawn);pawn.position.set(.73,-1.05,.48);pawn.scale.setScalar(.72);
   lathe([[0,0],[.52,0],[.56,.13],[.45,.23],[.34,.3],[.21,.83],[.35,.94],[.34,1.05],[.2,1.12],[0,1.12]],silver,pawn);
   mesh(new T.SphereGeometry(.30,40,24),silver,pawn,0,1.28);
   const rings=new T.Group();scene.add(rings);
   for(let i=0;i<2;i++){const r=mesh(new T.TorusGeometry(1.75+i*.34,.009,8,100),new T.MeshBasicMaterial({color:i?0xeac36f:0xa994ff,transparent:true,opacity:.38}),rings);r.rotation.set(.8+i*.8,.3+i*.6,.4)}
   // GLSL background: moving radial ribbons, star sparks, and depth fog rendered on the GPU.
   const shader=new T.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uTime:{value:0},uColor:{value:new T.Color(0x9965ff)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}',fragmentShader:'varying vec2 vUv;uniform float uTime;uniform vec3 uColor;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=vUv-.5;float r=length(p*vec2(1.2,1.));float a=atan(p.y,p.x);float mist=exp(-r*r*9.);float ribbon=pow(.5+.5*sin(a*4.+r*22.-uTime*.55),9.)*exp(-pow((r-.32)*4.,2.));vec2 cell=floor(vUv*vec2(62.,47.));float spark=step(.978,hash(cell))*(1.-smoothstep(.02,.23,length(fract(vUv*vec2(62.,47.))-.5)))*(.5+.5*sin(uTime+hash(cell)*40.));vec3 col=uColor*(mist*.32+ribbon*.21)+vec3(1.,.77,.38)*spark*.7;gl_FragColor=vec4(col,clamp(mist*.45+ribbon*.35+spark,0.,.8));}'});
   const back=mesh(new T.PlaneGeometry(2,2),shader,scene);back.frustumCulled=false;back.renderOrder=-100;
   const particleGeo=new T.BufferGeometry(),points=[];for(let i=0;i<100;i++){const a=i*2.399963,r=2.1+(i%13)*.08;points.push(Math.cos(a)*r,Math.sin(i*3.43)*1.45,Math.sin(a)*r)}particleGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));const particles=new T.Points(particleGeo,new T.PointsMaterial({color:0xffd88a,size:.025,transparent:true,opacity:.65}));scene.add(particles);
   let raf=0,inView=true,last=performance.now(),time=0,pointerX=0,pointerY=0,selected='';
   const pointer=e=>{const r=mount.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5};
   const leave=()=>{pointerX=0;pointerY=0};mount.addEventListener('pointermove',pointer);mount.addEventListener('pointerleave',leave);
   const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<1?49:40;camera.updateProjectionMatrix()};
   const observer=new ResizeObserver(resize);observer.observe(mount);resize();
   const visibility=new IntersectionObserver(([e])=>{inView=e.isIntersecting});visibility.observe(mount);
   const frame=stamp=>{raf=requestAnimationFrame(frame);const dt=Math.min((stamp-last)/1000,.05);last=stamp;if(!inView||document.hidden)return;const {sport,paused}=control.current;if(selected!==sport){selected=sport;Object.entries(objects).forEach(([key,o])=>{o.visible=key===sport});shader.uniforms.uColor.value.set(sport==='Cricket'?0xc99549:sport==='Chess'?0x4b9cba:0x9965ff)}if(!paused){time+=dt;group.rotation.y=time*.45+pointerX*.6;group.position.y=.25+Math.sin(time*1.5)*.11;group.rotation.x=pointerY*.13;rings.rotation.y=time*.15;particles.rotation.y=time*.06;shader.uniforms.uTime.value=time}renderer.render(scene,camera)};
   raf=requestAnimationFrame(frame);setReady(true);
   const lost=e=>{e.preventDefault();setFailed(true);setReady(false);cancelAnimationFrame(raf)};renderer.domElement.addEventListener('webglcontextlost',lost);
   cleanup=()=>{cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();mount.removeEventListener('pointermove',pointer);mount.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',lost);const gs=new Set(),ms=new Set();for(const root of [scene,studio])root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material)});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove()};
  }).catch(()=>{if(!disposed)setFailed(true)});
  return()=>{disposed=true;cleanup()};
 },[reduced]);
 return <div className="arena-stage"><div ref={host} className="arena-webgl"/>{(!ready||failed||reduced)&&<FallbackArt sport={sport}/>}<div className="arena-stage-caption"><span className="arena-live-dot"/> {ready&&!failed&&!reduced?'REALTIME 3D ARENA':'ARENA EDITION'}</div></div>
}
export function ArenaHero({onSport,browse,me}){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false);const reduced=useReducedMotion();const s=SPORTS[index];const change=d=>setIndex(i=>(i+d+SPORTS.length)%SPORTS.length);
 return <section className="arena-hero" style={{'--arena-highlight':s.accent}}>
 <div className="arena-hero-copy"><div className="arena-kicker"><span/> CAMPUSPLAY / ARENA</div><div className="arena-index">DISCIPLINE {s.number} / 03</div><motion.h1 key={s.name} initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}}>{s.title}</motion.h1><p>{s.description}</p><div className="arena-hero-actions"><button className="cp2-primary" onClick={()=>s.name==='Chess'?browse('Online Chess'):onSport(s.name)}>Enter {s.name} <ArrowRight size={18}/></button><button className="arena-ghost" onClick={()=>browse('Tournaments')}>Explore tournaments <ArrowRight size={16}/></button></div><div className="arena-selector" role="group" aria-label="Select arena sport">{SPORTS.map((x,i)=><button key={x.name} aria-pressed={index===i} className={index===i?'active':''} onClick={()=>setIndex(i)}><span>{x.number}</span>{x.name}</button>)}</div><div className="arena-hero-meta">WELCOME, {me.name.split(' ')[0].toUpperCase()} <span>•</span> {s.detail.toUpperCase()}</div></div>
 <div className="arena-visual"><ArenaScene sport={s.name} paused={paused}/><div className="arena-scene-controls"><button onClick={()=>change(-1)} aria-label="Previous sport"><ChevronLeft size={18}/></button><button onClick={()=>setPaused(p=>!p)} aria-label={paused?'Resume motion':'Pause motion'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><button onClick={()=>change(1)} aria-label="Next sport"><ChevronRight size={18}/></button></div><span className="arena-visual-index">{s.number}</span></div>
 </section>
}
