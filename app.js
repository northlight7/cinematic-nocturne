import {T,mat,mesh,box,cyl,ring,texture,createStage,cameraAt,span,mix,initUI} from './core.js?v=composition-8'
initUI()
const s=createStage({background:'#240f18',exposure:.92}),{scene,camera}=s
scene.fog=new T.Fog('#240f18',16,38);s.ground.material.color.set('#090207');s.key.color.set('#ffb983');s.key.intensity=3.6;s.key.position.set(-4,7,5);s.fill.color.set('#f5bbce');s.fill.intensity=1.3
scene.environmentIntensity=.65
const product=new T.Group();scene.add(product);product.rotation.y=-.12
const gold=mat('#d6a35c',.25,.85),capMat=mat('#201a1b',.18,.45,{envMapIntensity:1.3}),glass=new T.MeshPhysicalMaterial({color:'#c38342',roughness:.12,transmission:.78,thickness:.28,ior:1.47,metalness:0,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.2})
const profile=[[0,0],[.58,0],[.78,.06],[.87,.2],[.87,2.1],[.82,2.32],[.7,2.46],[.36,2.63],[.25,2.72],[.25,2.94],[0,2.94]].map(p=>new T.Vector2(...p))
const bodyGeo=new T.LatheGeometry(profile,96)
const coords=bodyGeo.attributes.position
for(let i=0;i<coords.count;i++){const x=coords.getX(i),y=coords.getY(i),z=coords.getZ(i),r=Math.hypot(x,z);if(r>.72&&y>.12&&y<2.35){const a=Math.atan2(z,x),f=1+Math.cos(a*40)*.008;coords.setXYZ(i,x*f,y,z*f)}}bodyGeo.computeVertexNormals()
const bottle=mesh(bodyGeo,glass,product,[0,-.17,0]);
const liquidMat=new T.MeshPhysicalMaterial({color:'#8f4015',roughness:.1,transmission:.3,thickness:.7,ior:1.35,transparent:true,opacity:.7})
cyl(.765,1.82,liquidMat,product,[0,.96,0]);cyl(.76,.025,mat('#d98938',.22,.2),product,[0,1.89,0]);
ring(.7,.025,gold,product,[0,-.12,0]);ring(.83,.009,gold,product,[0,.05,0])
cyl(.27,.18,gold,product,[0,2.74,0]);cyl(.19,.24,gold,product,[0,2.94,0]);const atomizer=cyl(.24,.17,gold,product,[0,3.12,0]);const hole=cyl(.036,.015,mat('#110b09',1),product,[0,3.12,.238]);hole.rotation.x=Math.PI/2
const cap=new T.Group();cap.position.set(0,3.35,0);product.add(cap)
cyl(.42,.75,capMat,cap,[0,.12,0]);cyl(.424,.07,gold,cap,[0,-.24,0]);ring(.4,.008,gold,cap,[0,.5,0]);
const ribs=new T.InstancedMesh(new T.BoxGeometry(.012,.58,.012),mat('#817162',.35,.75),40),ribPose=new T.Object3D();for(let i=0;i<40;i++){const a=i/40*Math.PI*2;ribPose.position.set(Math.sin(a)*.422,.13,Math.cos(a)*.422);ribPose.updateMatrix();ribs.setMatrixAt(i,ribPose.matrix)}cap.add(ribs)
const labelMap=texture((c,w,h)=>{c.fillStyle='#eadbc2';c.fillRect(0,0,w,h);c.strokeStyle='#aa895d';c.lineWidth=2;c.strokeRect(30,28,w-60,h-56);c.fillStyle='#3b2225';c.textAlign='center';c.font='30px serif';c.fillText('N O C T U R N E',w/2,100);c.font='italic 74px serif';c.fillText('No. 04',w/2,227);c.font='14px sans-serif';c.fillText('R O S E   ·   A M B E R   ·   C E D A R',w/2,294);c.font='16px sans-serif';c.fillText('EAU DE PARFUM',w/2,366);c.font='13px sans-serif';c.fillText('ATELIER COLLECTION   /   50 ML',w/2,409)},512,460)
const label=mesh(new T.CylinderGeometry(.886,.886,1.1,48,1,true,-.74,1.48),mat('#fff8ea',.85,0,{map:labelMap,side:T.DoubleSide}),product,[0,1.1,0]);label.castShadow=false
const stageBase=cyl(1.25,.17,mat('#482a31',.42,.15),scene,[0,-.29,0]);ring(1.23,.018,gold,scene,[0,-.2,0]);
function petalGeometry(){const vertices=[],uv=[],idx=[],n=12;for(let v=0;v<=n;v++)for(let u=0;u<=n;u++){const a=u/n*2-1,b=v/n;vertices.push(a*Math.sin(Math.PI*b)*.44,(b-.5)*1.1,Math.sin(b*Math.PI)*.2+Math.pow(a,2)*.16+Math.sin(b*4)*.04);uv.push(u/n,b)}for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*(n+1)+x;idx.push(i,i+1,i+n+1,i+1,i+n+2,i+n+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
const petals=[],petalGeo=petalGeometry(),petalMats=['#a92b4b','#d3697b','#dc9b8e','#892943'].map(c=>new T.MeshPhysicalMaterial({color:c,roughness:.48,side:T.DoubleSide,metalness:.05,clearcoat:.25}))
for(let i=0;i<42;i++){const o=mesh(petalGeo,petalMats[i%4],scene);o.userData.phase=i*2.39996;o.userData.radius=2.3+(i%6)*.33;o.scale.setScalar(.3+(i%5)*.12);petals.push(o)}
const petalInstances=petalMats.map((m,j)=>{const im=new T.InstancedMesh(petalGeo,m,Math.ceil((42-j)/4));im.castShadow=true;im.receiveShadow=true;scene.add(im);return im});petals.forEach(o=>scene.remove(o));
const citrus=new T.Group();scene.add(citrus)
const rind=mat('#c7a148',.7),fruit=mat('#e0c27a',.55),leafMat=mat('#565a36',.65,0,{side:T.DoubleSide})
for(let i=0;i<3;i++){const g=new T.Group();citrus.add(g);g.position.set(-2.3+i*1.8,1.8+i*.4,-1.2);g.rotation.set(.6,i*.8,.5);cyl(.35,.09,rind,g);cyl(.31,.1,fruit,g);for(let j=0;j<7;j++){const a=j/7*Math.PI*2;box(.012,.01,.27,mat('#fff0bb',.8),g,[Math.sin(a)*.14,.06,Math.cos(a)*.14],.003).rotation.y=a}const l=mesh(petalGeo,leafMat,g,[.3,.2,0]);l.rotation.z=-1.2;l.scale.set(.45,.7,.5)}
const particleCount=250,positions=new Float32Array(particleCount*3),particleGeo=new T.BufferGeometry();particleGeo.setAttribute('position',new T.BufferAttribute(positions,3))
const particleTex=texture((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'#fff8de');g.addColorStop(.18,'#ffe2b0');g.addColorStop(1,'#ffe2b000');c.fillStyle=g;c.fillRect(0,0,w,h)},32,32)
const particleMat=new T.PointsMaterial({color:'#f2c189',map:particleTex,size:.11,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});const mist=new T.Points(particleGeo,particleMat);scene.add(mist)
let currentTime=0,sprayAt=-100,burst=0,note='Rose'
function spray(){sprayAt=currentTime;document.querySelector('[data-spray-state]').textContent='A trace of '+note.toLowerCase()+', suspended in the air.';s.wake()}
document.querySelectorAll('[data-spray]').forEach(b=>b.addEventListener('click',spray))
document.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-note]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));note=b.dataset.note;document.querySelector('[data-note-description]').textContent={Rose:'Velvet petals. A soft, floral heart.',Bergamot:'Bright peel. A green, unexpected opening.',Cedar:'Dry wood. A quiet, lasting warmth.'}[note];petalMats.forEach((m,i)=>m.color.set({Rose:['#a92b4b','#d3697b','#dc9b8e','#892943'],Bergamot:['#8d8b34','#b4a954','#dec275','#737637'],Cedar:['#965742','#b37e5c','#ca9a73','#724a3d']}[note][i]));s.wake()}))
const shots=[{p:0,pos:[2.8,5.5,10.5],target:[0,1.8,0],frame:[.73,.57],mobile:[2.8,5.2,15.2],mobileTarget:[0,2,0],mobileFrame:[.5,.73]},{p:.33,pos:[1.8,4.4,10.3],target:[0,1.8,0],frame:[.73,.57],mobile:[2,4.9,15.1],mobileTarget:[0,2,0],mobileFrame:[.5,.73]},{p:.67,pos:[.8,2.9,9.7],target:[0,1.8,0],frame:[.73,.57],mobile:[1,4.2,15],mobileTarget:[0,2,0],mobileFrame:[.5,.73]},{p:1,pos:[-.2,2.4,9.1],target:[0,1.8,0],frame:[.73,.57],mobile:[0,3.7,14.8],mobileTarget:[0,2,0],mobileFrame:[.5,.73]}]
s.update(({p,time,dt,mobile,pointer,activeMotion})=>{currentTime=time;cameraAt(camera,p,shots,mobile,pointer)
 const open=span(p,.1,.28);cap.position.set(open*.65,3.35+open*(mobile?.45:.75),-open*.2);cap.rotation.z=-open*.3;cap.rotation.x=open*.12;product.rotation.y=-.12
 const gather=span(p,.12,.37),release=span(p,.38,.72)
 petals.forEach((o,i)=>{const a=o.userData.phase+(activeMotion?time*.14:0)+p*3.2,r=o.userData.radius*(1-gather*.35+release*.5),y=1.7+Math.sin(a*.7+i)*1.8+(gather-release)*.8;o.position.set(Math.cos(a)*r+pointer.x*.2,y,Math.sin(a)*r*.65+pointer.y*.2);o.rotation.set(a*.7+time*.15,a+i,a*.3);o.material.emissive.set('#2b0810');o.material.emissiveIntensity=.15;const heroVisibility=mix(.6,1,gather);o.scale.setScalar((.3+(i%5)*.12)*heroVisibility);o.updateMatrix();petalInstances[i%4].setMatrixAt(Math.floor(i/4),o.matrix)});petalInstances.forEach(im=>im.instanceMatrix.needsUpdate=true)
 citrus.rotation.y=p*2.4+time*.035;citrus.visible=p>.12&&p<.74;citrus.position.y=Math.sin(p*Math.PI)*.5
 const event=Math.max(0,1-(time-sprayAt)/3);burst=activeMotion?mix(burst,event,1-Math.exp(-dt*14)):event;const storyMist=span(p,.47,.6)*(1-span(p,.72,.85))*.5;const amount=Math.max(burst,storyMist);particleMat.opacity=amount*.75;atomizer.position.y=3.12-burst*.07
 for(let i=0;i<particleCount;i++){const q=(i/particleCount+time*.25)%1,a=i*2.39996,spread=q*1.5;positions[i*3]=Math.cos(a)*spread+Math.sin(time+i)*.05;positions[i*3+1]=3.05+q*.5+Math.sin(a)*spread*.4;positions[i*3+2]=.4+q*4.5}particleGeo.attributes.position.needsUpdate=true
 document.querySelector('.stage').dataset.spray=amount.toFixed(2)
})
