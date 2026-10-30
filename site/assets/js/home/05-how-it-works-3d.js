/* Edebo home: How it works: four real-time 3D renders of the head in one WebGL context.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
/* ================= How it works: four real-time 3D renders of the head, one shared WebGL context ================= */
(function(){
if(typeof THREE==='undefined'||typeof EDEBO==='undefined') return;
var cvs=[].slice.call(document.querySelectorAll('.hs__cv'));if(!cvs.length) return;
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var RW=900,RH=760,ren;
try{ren=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){return;}
ren.setPixelRatio(1);ren.setSize(RW,RH,false);ren.setClearColor(0x000000,0);
var cam=new THREE.PerspectiveCamera(27,RW/RH,0.1,50);cam.position.set(0,0.52,3.9);cam.lookAt(0,0.42,0);
var scenes=[],groups=[],U={t:{value:0},scan:{value:0.5},rev:{value:0.4}};

var rimV='varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
function ghostMat(){return new THREE.ShaderMaterial({uniforms:{uScan:U.scan},vertexShader:rimV,transparent:true,depthWrite:false,
  fragmentShader:'uniform float uScan;varying vec3 vN;varying vec3 vP;void main(){float rim=pow(1.0-abs(vN.z),2.0);float band=exp(-pow((vP.y-uScan)/0.035,2.0));vec3 c=mix(vec3(0.32,0.22,0.6),vec3(0.65,0.55,0.98),rim)*0.55+vec3(1.0,0.93,1.0)*band;gl_FragColor=vec4(c,0.10+rim*0.35+band*0.9);}'});}
function solidMat(cheek){return new THREE.ShaderMaterial({uniforms:{uRev:U.rev,uCheek:{value:cheek?1:0}},vertexShader:'attribute float aChg;varying float vC;'+rimV.replace('void main(){','void main(){vC=aChg;'),extensions:{derivatives:true},
  fragmentShader:'uniform float uRev;uniform float uCheek;varying vec3 vN;varying vec3 vP;varying float vC;void main(){if(uCheek<0.5&&vP.y>uRev)discard;vec3 n=normalize(vN);float d=max(dot(n,normalize(vec3(-0.4,0.6,0.8))),0.0);float rim=pow(1.0-max(n.z,0.0),2.4);vec3 c=vec3(0.42,0.36,0.66)*(0.3+0.7*d)+vec3(0.65,0.55,0.98)*rim*0.9;float f=vP.y/0.035;float dd=min(fract(f),1.0-fract(f));c=mix(c,vec3(0.9,0.86,0.98),(1.0-smoothstep(0.0,1.2*fwidth(f),dd))*0.28);float edge=exp(-pow((vP.y-uRev)/0.012,2.0))*(1.0-uCheek);c+=vec3(1.0,0.95,1.0)*edge;c=mix(c,vec3(0.86,0.78,1.0)*(0.5+0.5*d),clamp(vC*1.2,0.0,0.85)*uCheek);gl_FragColor=vec4(c,1.0);}'});}
function ptsMat(above){return new THREE.ShaderMaterial({uniforms:{uT:U.t,uRev:U.rev,uAbove:{value:above?1:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'uniform float uT;uniform float uRev;uniform float uAbove;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float dep=clamp((-mv.z-3.2)/-1.4,0.0,1.0);float tw=0.75+0.25*sin(uT*3.0+position.x*40.0+position.y*31.0);vA=(0.25+0.75*dep)*tw*(uAbove>0.5?step(uRev,position.y):1.0);gl_PointSize=(2.0+dep*3.4)*(4.0/-mv.z);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying float vA;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d);if(r>0.5)discard;gl_FragColor=vec4(mix(vec3(0.65,0.55,0.98),vec3(1.0),vA*0.6),smoothstep(0.5,0.05,r)*vA);}'});}

function lights(s){s.add(new THREE.AmbientLight(0xffffff,0.2));}

EDEBO.onReady(function(E){
  var geo=E.geo,pos=geo.attributes.position;
  /* stage 0: ghost head, glowing scan band, a phone with beams */
  var s0=new THREE.Scene(),g0=new THREE.Group();s0.add(g0);g0.add(new THREE.Mesh(geo,ghostMat()));
  var phone=new THREE.Group();
  function rr(w,h,r){var s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  phone.add(new THREE.Mesh(new THREE.ExtrudeGeometry(rr(0.34,0.68,0.07),{depth:0.03,bevelEnabled:false}),new THREE.MeshBasicMaterial({color:0x1c1726})));
  var edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints(rr(0.34,0.68,0.07).getPoints(40)),new THREE.LineBasicMaterial({color:0xC4B5FD}));edge.position.z=0.032;phone.add(edge);
  var lens=new THREE.Mesh(new THREE.CircleGeometry(0.045,24),new THREE.MeshBasicMaterial({color:0xFFFFFF}));lens.position.set(0,0.22,-0.002);lens.rotation.y=Math.PI;phone.add(lens);
  phone.position.set(0.62,0.5,1.0);phone.rotation.set(0,-0.6,0);s0.add(phone);
  var bp=new Float32Array(7*6),bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(bp,3));
  var beams=new THREE.LineSegments(bg,new THREE.LineBasicMaterial({color:0xC4B5FD,transparent:true,opacity:0.45,blending:THREE.AdditiveBlending}));s0.add(beams);
  /* front-surface depth lookup for beam targets */
  var GX=48,GY=64,zmap=new Float32Array(GX*GY).fill(-9);
  for(var i=0;i<pos.count;i++){var x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),ix=Math.round((x+0.6)/1.2*(GX-1)),iy=Math.round((y+0.1)/1.25*(GY-1));if(ix<0||iy<0||ix>=GX||iy>=GY)continue;var k=iy*GX+ix;if(z>zmap[k])zmap[k]=z;}
  function zAt(x,y){var ix=Math.round((x+0.6)/1.2*(GX-1)),iy=Math.round((y+0.1)/1.25*(GY-1));ix=Math.max(0,Math.min(GX-1,ix));iy=Math.max(0,Math.min(GY-1,iy));return zmap[iy*GX+ix];}
  scenes.push(s0);groups.push(g0);
  /* stage 1: dense point cloud */
  var s1=new THREE.Scene(),g1=new THREE.Group();s1.add(g1);g1.add(new THREE.Points(geo,ptsMat(false)));scenes.push(s1);groups.push(g1);
  /* stage 2: surface rebuilt bottom-up out of the points */
  var s2=new THREE.Scene(),g2=new THREE.Group();s2.add(g2);
  var gS=geo.clone();gS.setAttribute('aChg',new THREE.BufferAttribute(new Float32Array(pos.count),1));
  g2.add(new THREE.Mesh(gS,solidMat(false)));g2.add(new THREE.Points(geo,ptsMat(true)));scenes.push(s2);groups.push(g2);
  /* stage 3: Day 0 wire ghost under the Day 30 surface with added cheek volume */
  var s3=new THREE.Scene(),g3=new THREE.Group();s3.add(g3);
  var gB=geo.clone(),pb=gB.attributes.position,nb=gB.attributes.normal,ch=new Float32Array(pb.count);
  for(i=0;i<pb.count;i++){var X=pb.getX(i),Y=pb.getY(i),Z=pb.getZ(i),w=Math.exp(-(Math.pow(Math.abs(X)-0.25,2)+Math.pow(Y-0.22,2))/0.008)*(Z>0.15?1:0);ch[i]=w;pb.setXYZ(i,X+nb.getX(i)*0.035*w,Y+nb.getY(i)*0.035*w,Z+nb.getZ(i)*0.035*w);}
  gB.setAttribute('aChg',new THREE.BufferAttribute(ch,1));gB.computeVertexNormals();
  g3.add(new THREE.Mesh(gB,solidMat(true)));
  var wire=new THREE.LineSegments(new THREE.WireframeGeometry(geo),new THREE.LineBasicMaterial({color:0xA78BFA,transparent:true,opacity:0.16,depthWrite:false}));wire.scale.setScalar(1.004);g3.add(wire);
  scenes.push(s3);groups.push(g3);

  var vis=false,hs=document.getElementById('how');
  if('IntersectionObserver' in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting;},{threshold:0}).observe(hs);}else vis=true;
  function size(){cvs.forEach(function(c){var r=c.getBoundingClientRect(),d=Math.min(1.5,devicePixelRatio||1);c.width=Math.max(2,Math.round(r.width*d));c.height=Math.max(2,Math.round(r.height*d));});}
  size();addEventListener('resize',size,{passive:true});
  var ctxs=cvs.map(function(c){return c.getContext('2d');}),t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);if(!vis)return;
    var t=reduce?2:(now-t0)/1000,p=window.__hsP||0;U.t.value=t;
    U.scan.value=1.02-((t*0.32)%1)*1.1;U.rev.value=-0.1+(0.5-0.5*Math.cos(t*0.8))*1.25;
    var vw=innerWidth;
    cvs.forEach(function(c,i){
      var r=c.getBoundingClientRect();if(r.right<-50||r.left>vw+50||r.bottom<0||r.top>innerHeight)return;
      groups[i].rotation.y=-0.55+p*1.1+(reduce?0:Math.sin(t*0.5+i)*0.08);
      if(i===0){ /* beams follow the band across the front of the face */
        s0.updateMatrixWorld(true);var tip=new THREE.Vector3();lens.getWorldPosition(tip);
        for(var b=0;b<7;b++){var bx=-0.27+0.09*b,by=U.scan.value,bz=zAt(bx,by);var v=new THREE.Vector3(bx,by,bz>-1?bz:0.3);v.applyAxisAngle(new THREE.Vector3(0,1,0),groups[0].rotation.y);bp.set([tip.x,tip.y,tip.z,v.x,v.y,v.z],b*6);}
        bg.attributes.position.needsUpdate=true;beams.visible=U.scan.value>-0.05&&U.scan.value<1.0;
      }
      ren.render(scenes[i],cam);
      var x=ctxs[i],W=c.width,H=c.height,s=Math.max(W/RW,H/RH),dw=RW*s,dh=RH*s;
      x.clearRect(0,0,W,H);x.drawImage(ren.domElement,(W-dw)/2,(H-dh)/2-H*0.04,dw,dh);
      if(i===3){var tw=W*0.2,th=tw*0.3,lx=W*0.62,ly=H*0.42;x.fillStyle='rgba(124,58,237,.95)';x.beginPath();if(x.roundRect)x.roundRect(lx,ly,tw,th,th/2);else x.rect(lx,ly,tw,th);x.fill();x.fillStyle='#fff';x.font='700 '+Math.round(th*0.46)+'px DM Sans, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('+2.1 mm',lx+tw/2,ly+th/2);}
    });
  }
  requestAnimationFrame(frame);
});
})();
