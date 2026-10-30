/* Edebo home: 3D studio: real face and body meshes you can orbit, mark and measure.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
/* ================= 3D studio: real face and body meshes you can orbit, mark and measure ================= */
(function(){
if(typeof THREE==='undefined') return;
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function cl(x,a,b){return Math.max(a,Math.min(b,x));}

/* ---- procedural clinical torso (dress-form style), y from -1.2 to 1.2 ---- */
function torsoGeo(){
  var K=[ // v, half-width, half-depth
    [0.00,0.60,0.42],[0.10,0.62,0.43],[0.22,0.57,0.40],[0.38,0.47,0.33],[0.52,0.52,0.36],
    [0.66,0.58,0.41],[0.78,0.62,0.38],[0.86,0.66,0.33],[0.91,0.55,0.26],[0.95,0.30,0.19],[1.00,0.17,0.16]];
  function interp(v,k){var i=0;while(i<K.length-2&&K[i+1][0]<v)i++;var a=K[i],b=K[i+1],t=(v-a[0])/(b[0]-a[0]);t=t*t*(3-2*t);return a[k]+(b[k]-a[k])*t;}
  var NV=120,NU=96,pos=[],idx=[];
  for(var j=0;j<=NV;j++){
    var v=j/NV,a=interp(v,1),d=interp(v,2),y=-1.2+v*2.4;
    for(var i=0;i<=NU;i++){
      var th=i/NU*Math.PI*2,c=Math.cos(th),s=Math.sin(th);
      var e=2.5,cx=Math.sign(c)*Math.pow(Math.abs(c),2/e),sz=Math.sign(s)*Math.pow(Math.abs(s),2/e);
      var x=a*cx,z=d*sz;
      if(z>0){ /* chest, navel, abdominal line */
        z+=0.085*(Math.exp(-(Math.pow(x-0.24,2)/0.018+Math.pow(v-0.67,2)/0.004))+Math.exp(-(Math.pow(x+0.24,2)/0.018+Math.pow(v-0.67,2)/0.004)));
        z-=0.03*Math.exp(-(x*x/0.0012+Math.pow(v-0.33,2)/0.0008));
        z-=0.012*Math.exp(-(x*x/0.002))*smooth(0.35,0.6,v)*(1-smooth(0.6,0.66,v));
      }else{ z+=0.02*Math.exp(-x*x/0.004)*(v>0.3&&v<0.9?1:0); }
      var sh=Math.exp(-Math.pow(v-0.87,2)/0.004)*Math.pow(Math.abs(c),6)*0.05; /* rounded shoulder caps */
      pos.push(x*(1+sh),y+sh*0.4,z);
    }
  }
  for(j=0;j<NV;j++)for(i=0;i<NU;i++){var p=j*(NU+1)+i,q=p+NU+1;idx.push(p,p+1,q,p+1,q+1,q);}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  g.userData.ring=function(v,off){var a=interp(v,1),d=interp(v,2),pts=[];for(var i=0;i<=128;i++){var th=i/128*Math.PI*2,c=Math.cos(th),s=Math.sin(th),e=2.5;pts.push(new THREE.Vector3(a*Math.sign(c)*Math.pow(Math.abs(c),2/e)*(1+off),-1.2+v*2.4,d*Math.sign(s)*Math.pow(Math.abs(s),2/e)*(1+off)));}return pts;};
  return g;
}
function smooth(a,b,x){x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x);}

/* ---- surface shader: skin-tone violet with rim, scan contours, analysis heat and plan zones ---- */
var VS='varying vec3 vN;varying vec3 vP;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
var FS=[
'uniform vec3 uBase;uniform vec3 uRim;uniform vec3 uLine;uniform vec3 uHeat;uniform vec3 uHot;uniform float uLines;uniform float uHeatOn;uniform int uMetric;uniform vec4 uZones[6];uniform float uSel;uniform float uHover;uniform vec4 uPlan[4];uniform float uHair;',
'varying vec3 vN;varying vec3 vP;varying vec3 vW;',
'float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}',
'float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}',
'void main(){vec3 n=normalize(vN);vec3 L=normalize(vec3(-0.4,0.6,0.8));float dif=max(dot(n,L),0.0);float back=max(dot(n,normalize(vec3(0.6,0.2,-0.5))),0.0);',
' float rim=pow(1.0-max(n.z,0.0),2.4);vec3 c=uBase*(0.30+0.70*dif)+uRim*rim*0.9+uRim*back*0.25;',
' float f=vP.y/0.04;float dd=min(fract(f),1.0-fract(f));float ln=1.0-smoothstep(0.0,1.2*fwidth(f),dd);c=mix(c,uLine,ln*0.22*uLines);',
' float front=smoothstep(0.05,0.45,vP.z);',
/* analysis zones */
' float zsum=0.0;float zsel=0.0;float zhov=0.0;',
' for(int i=0;i<6;i++){vec4 z=uZones[i];if(z.w<=0.0)continue;vec2 d=vec2(abs(vP.x)-z.x,vP.y-z.y);if(z.x<0.001)d.x=vP.x;float w=exp(-dot(d,d)/(z.w*z.w))*front;zsum=max(zsum,w);if(abs(float(i)-uSel)<0.5)zsel=w;if(abs(float(i)-uHover)<0.5)zhov=w;}',
' if(uHeatOn>0.5){float m;vec3 q=vP*28.0;',
'  if(uMetric==0){m=smoothstep(0.72,0.86,n3(q*1.3));}',
'  else if(uMetric==1){m=n3(vP*6.0)*0.6+0.4*smoothstep(0.3,0.0,abs(abs(vP.x)-0.22))*smoothstep(0.42,0.18,abs(vP.y-0.26));}',
'  else if(uMetric==2){m=n3(q*2.2)*0.8;}',
'  else {m=smoothstep(0.6,0.95,n3(q*3.0))*smoothstep(0.5,0.1,abs(vP.y-0.3));}',
'  float k=clamp(m*zsum*1.4,0.0,0.95);c=mix(c,mix(uHeat,vec3(1.0,0.86,0.98),m),k);',
'  float edge=smoothstep(0.30,0.36,zsel)-smoothstep(0.36,0.42,zsel);c=mix(c,vec3(1.0),edge*0.9);c+=uHot*zsel*0.18;c+=vec3(0.12)*zhov*(1.0-zsel);}',
/* plan zones (flanks etc.) */
' for(int i=0;i<4;i++){vec4 p=uPlan[i];if(p.w<=0.0)continue;float w=exp(-dot(vP-p.xyz,vP-p.xyz)/(p.w*p.w));float hatch=step(0.5,fract((vP.x+vP.y)*28.0));c=mix(c,uHot,w*(0.35+0.2*hatch));}',
/* hairline graft band */
' if(uHair>0.5){float yc=0.95-0.0+0.55*vP.x*vP.x;float yp=0.86+0.55*vP.x*vP.x;float band=smoothstep(yp-0.008,yp+0.008,vP.y)*(1.0-smoothstep(yc-0.008,yc+0.008,vP.y))*front*step(abs(vP.x),0.36);float hatch=step(0.5,fract((vP.x-vP.y)*30.0));c=mix(c,uHot,band*(0.32+0.2*hatch));}',
' gl_FragColor=vec4(c,1.0);}'].join('\n');

function makeMat(){
  var z=[];for(var i=0;i<6;i++)z.push(new THREE.Vector4(0,0,0,0));
  var p=[];for(i=0;i<4;i++)p.push(new THREE.Vector4(0,0,0,0));
  return new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,extensions:{derivatives:true},uniforms:{
    uBase:{value:new THREE.Color(0x6B5BA8)},uRim:{value:new THREE.Color(0xA78BFA)},uLine:{value:new THREE.Color(0xE4DAFB)},
    uHeat:{value:new THREE.Color(0x7C3AED)},uHot:{value:new THREE.Color(0xC4B5FD)},uLines:{value:1},uHeatOn:{value:0},uMetric:{value:0},
    uZones:{value:z},uSel:{value:-1},uHover:{value:-1},uPlan:{value:p},uHair:{value:0}}});
}

var MM={face:195,body:250};

function Studio(box,opt){
  var self=this;this.box=box;this.opt=opt;
  var cv=document.createElement('canvas');cv.className='st__cv';box.appendChild(cv);
  this.labels=document.createElement('div');this.labels.className='st__labels';box.appendChild(this.labels);
  var r=this.renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.setClearColor(0x000000,0);
  this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(30,1,0.05,50);
  var oc=this.ctrl=new THREE.OrbitControls(this.cam,cv);
  oc.enableDamping=true;oc.dampingFactor=0.08;oc.enablePan=false;oc.enableZoom=false;oc.rotateSpeed=0.7;oc.minDistance=1.6;oc.maxDistance=7;
  oc.autoRotate=!reduce;oc.autoRotateSpeed=0.6;
  oc.addEventListener('start',function(){oc.autoRotate=false;self.touched=true;});
  this.group=new THREE.Group();this.scene.add(this.group);
  this.mat=makeMat();this.mesh=null;this.pins=[];this.lines=[];this.preset=new THREE.Group();this.group.add(this.preset);
  this.ray=new THREE.Raycaster();this.v2=new THREE.Vector2();this.visible=false;this.dirty=true;
  this.tmp=new THREE.Vector3();
  var down=null,dragPin=null;
  cv.addEventListener('pointerdown',function(e){
    down={x:e.clientX,y:e.clientY};
    var hitPin=self.pickPin(e);
    if(hitPin&&opt.editable){dragPin=hitPin;oc.enabled=false;cv.setPointerCapture(e.pointerId);}
  });
  cv.addEventListener('pointermove',function(e){
    if(dragPin){var h=self.pick(e);if(h){dragPin.set(h.point,h.face.normal);self.updateLines();self.emit();}return;}
    if(opt.onHover&&e.pointerType==='mouse'){var h2=self.pick(e);opt.onHover(h2);}
  });
  cv.addEventListener('pointerup',function(e){
    if(dragPin){dragPin=null;oc.enabled=true;return;}
    if(!down)return;var moved=Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y);down=null;
    if(moved>6)return;var h=self.pick(e);if(opt.onTap)opt.onTap(h,e);
  });
  cv.addEventListener('pointerleave',function(){if(opt.onHover)opt.onHover(null);});
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){self.visible=es[0].isIntersecting;},{threshold:0.02}).observe(box);}else this.visible=true;
  window.addEventListener('resize',function(){self.size();},{passive:true});
  this.size();
  (function loop(){requestAnimationFrame(loop);if(!self.visible||!self.mesh)return;
    var yw=self.box.getAttribute('data-yaw');
    if(yw!==null&&!self.touched){oc.autoRotate=false;var t=parseFloat(yw)||0;self.group.rotation.y+=(t-self.group.rotation.y)*0.12;}
    oc.update();self.render();})();
}
Studio.prototype.size=function(){var r=this.box.getBoundingClientRect();if(!r.width)return;this.W=r.width;this.H=r.height;this.renderer.setSize(r.width,r.height,false);this.cam.aspect=r.width/r.height;this.cam.updateProjectionMatrix();};
Studio.prototype.setGeo=function(geo,kind,view){
  if(this.mesh)this.group.remove(this.mesh);
  this.kind=kind;this.mm=MM[kind];
  this.mesh=new THREE.Mesh(geo,this.mat);this.group.add(this.mesh);
  var V=view||{};this.ctrl.target.set(V.tx||0,V.ty||0,0);
  this.cam.position.set(V.cx||0,V.cy||0,V.cz||4.2);this.ctrl.update();
  this.ctrl.minPolarAngle=0.35;this.ctrl.maxPolarAngle=2.5;
};
Studio.prototype.pick=function(e){
  if(!this.mesh)return null;var r=this.renderer.domElement.getBoundingClientRect();
  this.v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.v2,this.cam);
  var h=this.ray.intersectObject(this.mesh,false);return h.length?h[0]:null;
};
Studio.prototype.cast=function(x,y){
  var ry=this.group.rotation.y;this.group.rotation.y=0;this.group.updateMatrixWorld(true);var res=this._cast(x,y);this.group.rotation.y=ry;this.group.updateMatrixWorld(true);return res;
};
Studio.prototype._cast=function(x,y){
  this.ray.set(new THREE.Vector3(x,y,4),new THREE.Vector3(0,0,-1));var h=this.ray.intersectObject(this.mesh,false);return h.length?h[0]:null;
};
Studio.prototype.pickPin=function(e){
  var r=this.renderer.domElement.getBoundingClientRect(),best=null,bd=22;
  var self=this;this.pins.forEach(function(p){if(!p.user)return;var s=self.toScreen(p.p);var d=Math.hypot(s.x-(e.clientX-r.left),s.y-(e.clientY-r.top));if(d<bd&&s.front){bd=d;best=p;}});return best;
};
Studio.prototype.toScreen=function(v){
  var p=v.clone();this.group.localToWorld(p);var front=true;
  var toCam=this.cam.position.clone().sub(p).normalize();
  p.project(this.cam);return {x:(p.x+1)/2*this.W,y:(1-p.y)/2*this.H,front:front,toCam:toCam};
};
function Pin(st,point,normal,opt){
  this.st=st;this.user=!!opt.user;this.kind=opt.kind||'pt';this.label=opt.label||'';this.num=opt.num;
  var col=this.user?0xFACC15:0xA78BFA;
  this.obj=new THREE.Group();
  var head=new THREE.Mesh(new THREE.SphereGeometry(this.kind==='end'?0.022:0.03,20,14),new THREE.MeshBasicMaterial({color:col}));
  var halo=new THREE.Mesh(new THREE.RingGeometry(0.045,0.058,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.65,side:THREE.DoubleSide,depthTest:false}));
  this.halo=halo;this.obj.add(head);this.obj.add(halo);st.group.add(this.obj);
  this.el=document.createElement('span');this.el.className='st__pin'+(this.user?' is-user':'');this.el.textContent=opt.tag||'';
  if(opt.tag)st.labels.appendChild(this.el);
  this.set(point,normal);
}
Pin.prototype.set=function(p,n){this.p=p.clone();this.n=(n||new THREE.Vector3(0,0,1)).clone().normalize();this.obj.position.copy(this.p).addScaledVector(this.n,0.012);this.halo.lookAt(this.obj.position.clone().add(this.n));this.halo.position.set(0,0,0);this.halo.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),this.n));};
Pin.prototype.remove=function(){this.st.group.remove(this.obj);if(this.el.parentNode)this.el.parentNode.removeChild(this.el);};
Studio.prototype.addPin=function(p,n,o){var pin=new Pin(this,p,n,o);this.pins.push(pin);return pin;};
Studio.prototype.addLine=function(a,b,o){
  var geo=new THREE.BufferGeometry().setFromPoints([a.p,b.p]);
  var m=new THREE.LineDashedMaterial({color:o.user?0xFACC15:0xE4DAFB,dashSize:0.03,gapSize:0.018,depthTest:false,transparent:true});
  var l=new THREE.Line(geo,m);l.computeLineDistances();l.renderOrder=5;this.group.add(l);
  var el=document.createElement('span');el.className='st__len'+(o.user?' is-user':'');this.labels.appendChild(el);
  var L={a:a,b:b,line:l,el:el,user:o.user,label:o.label};this.lines.push(L);this.updateLines();return L;
};
Studio.prototype.addCurve=function(pts,o){
  var geo=new THREE.BufferGeometry().setFromPoints(pts);
  var m=o.dashed?new THREE.LineDashedMaterial({color:o.color||0xE4DAFB,dashSize:0.035,gapSize:0.022,transparent:true,opacity:o.opacity||1}):new THREE.LineBasicMaterial({color:o.color||0xE4DAFB,transparent:true,opacity:o.opacity||1});
  var l=new THREE.Line(geo,m);if(o.dashed)l.computeLineDistances();this.preset.add(l);
  if(o.tag){var el=document.createElement('span');el.className='st__tag';el.textContent=o.tag;this.labels.appendChild(el);this.tags=this.tags||[];this.tags.push({el:el,p:pts[o.at||Math.floor(pts.length/2)]});}
  return l;
};
Studio.prototype.dist=function(a,b){return a.distanceTo(b)*this.mm;};
Studio.prototype.updateLines=function(){var self=this;this.lines.forEach(function(L){L.line.geometry.setFromPoints([L.a.p.clone().addScaledVector(L.a.n,0.012),L.b.p.clone().addScaledVector(L.b.n,0.012)]);L.line.computeLineDistances();L.mm=self.dist(L.a.p,L.b.p);L.el.textContent=L.mm.toFixed(1)+' mm';});};
Studio.prototype.clear=function(all){
  var keep=[];this.pins.forEach(function(p){if(all||p.user)p.remove();else keep.push(p);});this.pins=keep;
  var kl=[],self=this;this.lines.forEach(function(L){if(all||L.user){self.group.remove(L.line);L.el.remove();}else kl.push(L);});this.lines=kl;
  if(all){while(this.preset.children.length)this.preset.remove(this.preset.children[0]);(this.tags||[]).forEach(function(t){t.el.remove();});this.tags=[];
    var u=this.mat.uniforms;u.uPlan.value.forEach(function(v){v.set(0,0,0,0);});u.uHair.value=0;}
};
Studio.prototype.render=function(){
  this.renderer.render(this.scene,this.cam);
  var self=this,camDir=new THREE.Vector3();
  function place(el,v,n){var s=self.toScreen(v);var wp=v.clone();self.group.localToWorld(wp);var vis=n?self.cam.position.clone().sub(wp).normalize().dot(n.clone().applyQuaternion(self.group.quaternion))>0.05:true;
    el.style.transform='translate('+s.x.toFixed(1)+'px,'+s.y.toFixed(1)+'px)';el.style.opacity=vis?1:0;}
  this.pins.forEach(function(p){if(p.el.parentNode)place(p.el,p.p,p.n);p.halo.visible=true;});
  this.lines.forEach(function(L){var m=L.a.p.clone().add(L.b.p).multiplyScalar(0.5).add(L.a.n.clone().add(L.b.n).multiplyScalar(0.03));place(L.el,m,null);});
  (this.tags||[]).forEach(function(t){place(t.el,t.p,null);});
};
window.EdeboStudio=Studio;window.EdeboTorso=torsoGeo;
})();
