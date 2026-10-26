import * as T from 'three'
import {RoomEnvironment} from './assets/vendor/RoomEnvironment.js'
import {RoundedBoxGeometry} from './assets/vendor/RoundedBoxGeometry.js'
export {T}
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n))
export const mix=(a,b,t)=>a+(b-a)*t
export const ease=t=>{t=clamp(t);return t*t*(3-2*t)}
export const span=(p,a,b)=>ease((p-a)/(b-a))
export function mat(color,roughness=.4,metalness=0,extra={}){return new T.MeshStandardMaterial({color,roughness,metalness,...extra})}
export function mesh(g,m,parent,pos=[0,0,0]){const o=new T.Mesh(g,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
export const box=(w,h,d,m,parent,pos=[0,0,0],r=.04)=>mesh(new RoundedBoxGeometry(w,h,d,3,r),m,parent,pos)
export const cyl=(r,h,m,parent,pos=[0,0,0],r2=r,n=96)=>mesh(new T.CylinderGeometry(r,r2,h,n),m,parent,pos)
export function ring(r,t,m,parent,pos=[0,0,0]){const o=mesh(new T.TorusGeometry(r,t,8,100),m,parent,pos);o.rotation.x=-Math.PI/2;return o}
export function texture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t}
export function noiseTexture(base,grain=15){return texture((c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);let seed=7548;for(let i=0;i<16000;i++){seed=(seed*16807)%2147483647;const x=seed%w;seed=(seed*16807)%2147483647;const y=seed%h;const v=(i%2)?255:0;c.fillStyle=`rgba(${v},${v},${v},${grain/255})`;c.fillRect(x,y,1,1)}})}
export function tube(points,r,m,parent){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,12,false),m,parent)}
export function cameraAt(camera,p,shots,mobile=false,pointer={x:0,y:0}){
 let k=0;while(k<shots.length-2&&p>shots[k+1].p)k++
 const a=shots[k],b=shots[k+1],t=ease((p-a.p)/(b.p-a.p));const ap=mobile&&a.mobile?a.mobile:a.pos,bp=mobile&&b.mobile?b.mobile:b.pos
 camera.position.set(...ap.map((v,i)=>mix(v,bp[i],t)));camera.position.x+=pointer.x*.22;camera.position.y+=pointer.y*.14
 const at=mobile&&a.mobileTarget?a.mobileTarget:a.target,bt=mobile&&b.mobileTarget?b.mobileTarget:b.target
 camera.lookAt(...at.map((v,i)=>mix(v,bt[i],t)))
}
export function createStage({background='#eae5d9',floor=true,exposure=1.1,shadow=true}){
 const host=document.querySelector('.stage'),story=document.querySelector('.story'),canvas=document.querySelector('#world')
 let renderer
 try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'})}catch(error){document.body.classList.add('no-webgl');document.querySelector('.render-status').textContent='Static view · 3D unavailable';throw error}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=exposure
 renderer.shadowMap.enabled=shadow;renderer.shadowMap.type=T.PCFShadowMap
 const scene=new T.Scene();scene.background=new T.Color(background)
 const camera=new T.PerspectiveCamera(36,innerWidth/innerHeight,.05,150);camera.zoom=innerWidth>=700&&innerWidth<1050?.74:1;camera.updateProjectionMatrix()
 const pmrem=new T.PMREMGenerator(renderer),envScene=new RoomEnvironment(),env=pmrem.fromScene(envScene,.04);scene.environment=env.texture;envScene.dispose();pmrem.dispose()
 const key=new T.DirectionalLight('#fff0dc',4.2);key.position.set(-3,8,5);key.castShadow=shadow;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.025;key.shadow.bias=-.0002;scene.add(key)
 const fill=new T.DirectionalLight('#d2e4ff',1.3);fill.position.set(5,2,-4);scene.add(fill);scene.add(new T.HemisphereLight('#ffffff','#3f302a',1.1))
 const ground=mesh(new T.PlaneGeometry(200,200),mat(background,.95),scene,[0,-.39,0]);ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.visible=floor
 const pointer={x:0,y:0},look={x:0,y:0};let targetP=0,p=0,time=0,last=0,raf=0,paused=false,visible=true,renderStep=()=>{},frames=[],lastStats=0,contextLost=false,initialized=false
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let reducedMotion=reduced.matches;document.body.classList.toggle('motion-off',reducedMotion)
 const motion=document.querySelector('[data-motion]');if(motion){motion.setAttribute('aria-pressed',String(reducedMotion));motion.textContent=reducedMotion?'Motion off':'Pause motion'}
 const move=e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=-(e.clientY/innerHeight-.5)*2;const cur=document.querySelector('.cursor');if(cur){cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';cur.dataset.active='true'}}
 const leave=()=>{pointer.x=0;pointer.y=0;const c=document.querySelector('.cursor');if(c)c.dataset.active='false'}
 const scroll=()=>{const r=story.getBoundingClientRect();targetP=clamp(-r.top/(story.offsetHeight-innerHeight));if(!initialized){p=targetP;initialized=true}visible=r.bottom>0&&r.top<innerHeight;if(visible)start()}
 const resize=()=>{renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.5));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.zoom=innerWidth>=700&&innerWidth<1050?.74:1;camera.updateProjectionMatrix();scroll();p=targetP;start()}
 const loop=stamp=>{raf=0;if(document.hidden||!visible||contextLost)return;const rawFrameMs=last?stamp-last:16.7;const dt=Math.min(rawFrameMs/1000,.05);last=stamp
  if(!paused&&!reducedMotion)time+=dt
  const activeMotion=!paused&&!reducedMotion;p=activeMotion?mix(p,targetP,1-Math.exp(-dt*12)):targetP
  look.x=mix(look.x,activeMotion?pointer.x:0,1-Math.exp(-dt*7));look.y=mix(look.y,activeMotion?pointer.y:0,1-Math.exp(-dt*7))
  renderStep({p:reducedMotion||paused?0:p,rawProgress:targetP,time,dt,mobile:innerWidth<700,pointer:look,activeMotion})
  renderer.render(scene,camera)
  frames.push(rawFrameMs);if(frames.length>180)frames.shift()
  if(stamp-lastStats>750||!activeMotion){lastStats=stamp;host.dataset.progress=p.toFixed(3);host.dataset.camera=camera.position.toArray().map(v=>v.toFixed(2)).join(',');host.dataset.drawCalls=renderer.info.render.calls;host.dataset.triangles=renderer.info.render.triangles;host.dataset.frameMs=([...frames].sort((a,b)=>a-b)[Math.floor(frames.length*.95)]||0).toFixed(1);document.querySelectorAll('[data-chapter]').forEach((x,i)=>x.classList.toggle('is-active',Math.min(3,Math.floor(targetP*3+.18))===i));const progress=document.querySelector('.travel-progress');if(progress)progress.style.transform=`scaleX(${targetP})`}
  if(activeMotion||Math.abs(p-targetP)>.0001)start()
 }
 function start(){if(!raf&&!document.hidden&&visible&&!contextLost)raf=requestAnimationFrame(loop)}
 const onVisibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()}
 const motionChange=()=>{reducedMotion=reduced.matches;document.body.classList.toggle('motion-off',reducedMotion||paused);start()};reduced.addEventListener('change',motionChange)
 const motionClick=()=>{if(reducedMotion){reducedMotion=false;paused=false}else paused=!paused;document.body.classList.toggle('motion-off',reducedMotion||paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'Resume motion':'Pause motion';start()};motion?.addEventListener('click',motionClick)
 window.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);document.addEventListener('visibilitychange',onVisibility)
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;document.body.classList.add('no-webgl');document.querySelector('.render-status').textContent='3D paused · reload to restore'});canvas.addEventListener('webglcontextrestored',()=>location.reload())
 const cleanup=()=>{cancelAnimationFrame(raf);window.removeEventListener('pointermove',move);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);document.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',motionChange);motion?.removeEventListener('click',motionClick);const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ms.add(m);Object.values(m).forEach(v=>{if(v?.isTexture)ts.add(v)})})});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());env.dispose();renderer.dispose()};const onPageHide=e=>{if(e.persisted){cancelAnimationFrame(raf);raf=0;last=0}else cleanup()};const onPageShow=()=>{last=0;scroll();p=targetP;start()};window.addEventListener('pagehide',onPageHide);window.addEventListener('pageshow',onPageShow)
 document.body.classList.add('scene-ready');document.querySelector('.render-status').textContent='Live 3D · scroll to explore';scroll()
 return{scene,camera,renderer,key,fill,ground,canvas,host,pointer,update(fn){renderStep=fn;start()},wake:start,paused:()=>paused||reducedMotion}
}
export function initUI(){
 const dialog=document.querySelector('dialog');document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>dialog?.showModal()));document.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()})
 document.querySelectorAll('[data-cursor]').forEach(el=>{el.addEventListener('pointerenter',()=>{const c=document.querySelector('.cursor');if(c){c.textContent=el.dataset.cursor;c.classList.add('expanded')}});el.addEventListener('pointerleave',()=>{const c=document.querySelector('.cursor');if(c){c.textContent='';c.classList.remove('expanded')}})})
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav-links')?.classList.remove('open');document.querySelector('[data-menu]')?.setAttribute('aria-expanded','false')}))
 document.querySelector('[data-menu]')?.addEventListener('click',e=>{const open=document.querySelector('.nav-links').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))})
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('revealed')}),{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>obs.observe(el))
}
