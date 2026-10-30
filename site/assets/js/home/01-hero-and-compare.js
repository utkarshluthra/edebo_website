/* Edebo home: Copy buttons, testimonials, product film, contour model, hero scroll scan, Day 0 vs Day 30 compare demo.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function smooth(a,b,x){x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function trap(p,a,b,c,d){return Math.min(smooth(a,b,p),1-smooth(c,d,p));}

/* copy buttons */
document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var el=document.getElementById(b.getAttribute('data-copy')); var t=el.textContent.trim();
    function sel(){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected';}
    try{navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy';},1600);},sel);}catch(e){sel();}
  });
});

/* testimonials nav */
(function(){
  var sc=document.getElementById('tscroll');
  document.querySelectorAll('.tnav button').forEach(function(b){
    b.addEventListener('click',function(){var d=parseInt(b.getAttribute('data-dir'),10)||1;sc.scrollBy({left:d*Math.min(380,sc.clientWidth*0.85),behavior:'smooth'});});
  });
})();


/* product film: autoplays (muted, as browsers require) when scrolled into view, pauses when scrolled away */
(function(){
  var v=document.getElementById('film-video'),wrap=document.getElementById('player'),tog=document.getElementById('playToggle'),snd=document.getElementById('soundBtn'),prog=document.getElementById('filmProg');
  if(!v) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,userPaused=false,inView=false;
  function sync(){wrap.classList.toggle('is-paused',v.paused);tog.setAttribute('aria-label',v.paused?'Play film':'Pause film');}
  function play(){var p=v.play();if(p&&p.catch)p.catch(function(){sync();});}
  v.addEventListener('play',sync);v.addEventListener('pause',sync);
  v.addEventListener('timeupdate',function(){if(v.duration)prog.style.width=(v.currentTime/v.duration*100).toFixed(2)+'%';});
  function toggle(){if(v.paused){userPaused=false;play();}else{userPaused=true;v.pause();}}
  tog.addEventListener('click',toggle);v.addEventListener('click',toggle);
  snd.addEventListener('click',function(){
    var on=v.muted;v.muted=!on;snd.setAttribute('aria-pressed',String(on));snd.querySelector('span').textContent=on?'Sound on':'Tap for sound';
    if(on&&v.paused){userPaused=false;play();}
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      inView=e[0].intersectionRatio>=0.45;
      if(inView&&!userPaused&&!reduce){play();}
      else if(!inView&&!v.paused){v.pause();}
    },{threshold:[0,0.45,0.8]}).observe(wrap);
  }
  sync();
})();

var EDEBO_MODEL_URL='assets/models/head-model.glb';
/* ================= contour model (shared by hero + compare demo) ================= */
var EDEBO = { ready:false, listeners:[] };
EDEBO.onReady = function(fn){ if(EDEBO.ready) fn(EDEBO); else EDEBO.listeners.push(fn); };

/* Slice a triangle soup at height y. Writes segments (x1,y1,z1,x2,y2,z2) into out from offset; returns new offset. */
function sliceTris(T, nT, tmin, tmax, y, out, off){
  for(var t=0;t<nT;t++){
    if(y<tmin[t]||y>tmax[t]) continue;
    var b=t*9, n=0, px=[0,0], pz=[0,0];
    for(var e=0;e<3;e++){
      var i=b+e*3, j=b+((e+1)%3)*3;
      var ya=T[i+1], yb=T[j+1];
      if((ya<y&&yb>=y)||(yb<y&&ya>=y)){
        var k=(y-ya)/(yb-ya);
        if(n<2){ px[n]=T[i]+(T[j]-T[i])*k; pz[n]=T[i+2]+(T[j+2]-T[i+2])*k; }
        n++;
      }
    }
    if(n===2){ out[off++]=px[0];out[off++]=y;out[off++]=pz[0];out[off++]=px[1];out[off++]=y;out[off++]=pz[1]; }
  }
  return off;
}

/* Build contours + a "Day 30" displaced copy from a non-indexed position array */
function buildContours(T, nSlices){
  var nT=T.length/9, tmin=new Float32Array(nT), tmax=new Float32Array(nT), yMin=1e9, yMax=-1e9;
  for(var t=0;t<nT;t++){var a=T[t*9+1],b=T[t*9+4],c=T[t*9+7];tmin[t]=Math.min(a,b,c);tmax[t]=Math.max(a,b,c);if(tmin[t]<yMin)yMin=tmin[t];if(tmax[t]>yMax)yMax=tmax[t];}
  var span=yMax-yMin, buf=new Float32Array(nT*6), segs=[], slices=[];
  for(var s=0;s<nSlices;s++){
    var y=yMax-span*(0.012+0.976*(s+0.5)/nSlices);
    var end=sliceTris(T,nT,tmin,tmax,y,buf,0);
    var cx=0,cz=0,m=end/3; for(var q=0;q<end;q+=3){cx+=buf[q];cz+=buf[q+2];} cx/=Math.max(1,m); cz/=Math.max(1,m);
    slices.push({y:y,cx:cx,cz:cz,start:segs.length/6,count:end/6});
    for(var q2=0;q2<end;q2++) segs.push(buf[q2]);
  }
  segs=new Float32Array(segs);
  /* illustrative follow-up: soft volume added over both cheeks */
  var after=new Float32Array(segs.length), amt=new Float32Array(segs.length/3);
  var yc=yMax-0.31*span, sy=0.06*span, A=0.026*span;
  for(var si=0;si<slices.length;si++){
    var S=slices[si];
    for(var v=S.start*2; v<(S.start+S.count)*2; v++){
      var x=segs[v*3], yy=segs[v*3+1], z=segs[v*3+2], dx=x-S.cx, dz=z-S.cz, r=Math.sqrt(dx*dx+dz*dz)||1;
      var ang=Math.atan2(dx,dz), w=Math.exp(-Math.pow(Math.abs(ang)-0.9,2)/0.16)*Math.exp(-Math.pow(yy-yc,2)/(2*sy*sy));
      var d=A*w; amt[v]=w;
      after[v*3]=x+dx/r*d; after[v*3+1]=yy; after[v*3+2]=z+dz/r*d;
    }
  }
  return {T:T,nT:nT,tmin:tmin,tmax:tmax,yMin:yMin,yMax:yMax,span:span,segs:segs,after:after,amt:amt,slices:slices,buf:buf};
}

function toSoup(geo){
  var pos=geo.attributes.position, idx=geo.index, n=idx?idx.count:pos.count, T=new Float32Array(n*3);
  for(var i=0;i<n;i++){var k=idx?idx.getX(i):i;T[i*3]=pos.getX(k);T[i*3+1]=pos.getY(k);T[i*3+2]=pos.getZ(k);}
  return T;
}

function proceduralGeo(){
  var COLS=60,ROWS=84,sX=0.98,sY=1.28,amp=0.47,idx=new Int32Array((COLS+1)*(ROWS+1)).fill(-1),pos=[],n=0,ind=[];
  function inside(u,v){var t=1;if(v<-0.25)t-=0.5*clamp((-0.25-v)/0.9,0,1);if(v>0.7)t*=(1-0.35*clamp((v-0.7)/0.3,0,1));var a=u/(0.95*t);return a*a+v*v<=1;}
  function h(u,v){var z=0.5*Math.exp(-(u*u+v*v*0.7));z+=0.36*Math.exp(-(u*u)/0.02)*Math.exp(-((v+0.1)*(v+0.1))/0.11);z+=0.16*(Math.exp(-(((u-0.52)*(u-0.52))/0.05+((v+0.05)*(v+0.05))/0.16))+Math.exp(-(((u+0.52)*(u+0.52))/0.05+((v+0.05)*(v+0.05))/0.16)));z-=0.2*(Math.exp(-(((u-0.34)*(u-0.34))/0.02+((v-0.16)*(v-0.16))/0.014))+Math.exp(-(((u+0.34)*(u+0.34))/0.02+((v-0.16)*(v-0.16))/0.014)));return z;}
  for(var j=0;j<=ROWS;j++){var v=-1+2*j/ROWS;for(var i=0;i<=COLS;i++){var u=-1+2*i/COLS;if(!inside(u,v))continue;pos.push(u*sX,v*sY,h(u,v)*amp*2-0.3);idx[j*(COLS+1)+i]=n++;}}
  for(var a=0;a<ROWS;a++)for(var c=0;c<COLS;c++){var p=idx[a*(COLS+1)+c],q=idx[a*(COLS+1)+c+1],r=idx[(a+1)*(COLS+1)+c],s=idx[(a+1)*(COLS+1)+c+1];if(p<0||q<0||r<0||s<0)continue;ind.push(p,r,q,q,r,s);}
  var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));g.setIndex(ind);g.computeVertexNormals();return g;
}

function loadModel(nSlices){
  if(typeof THREE==='undefined'||EDEBO.loading) return;
  EDEBO.loading=true;
  function finish(geo){
    try{
      var C=buildContours(toSoup(geo),nSlices);
      EDEBO.geo=geo;EDEBO.C=C;EDEBO.ready=true;
      EDEBO.listeners.forEach(function(fn){try{fn(EDEBO);}catch(e){console.error(e);}});
    }catch(e){console.error('contour build failed',e);}
  }
  function parse(buffer){
    new THREE.GLTFLoader().parse(buffer,'',function(gltf){
      var mesh=null;gltf.scene.traverse(function(o){if(o.isMesh&&!mesh)mesh=o;});
      if(!mesh){finish(proceduralGeo());return;}
      var geo=mesh.geometry.clone();mesh.updateWorldMatrix(true,false);geo.applyMatrix4(mesh.matrixWorld);
      geo.computeBoundingBox();var bb=geo.boundingBox,size=new THREE.Vector3(),ctr=new THREE.Vector3();bb.getSize(size);bb.getCenter(ctr);
      geo.translate(-ctr.x,-ctr.y,-ctr.z);var s=Math.min(2.6/size.y,2.4/size.x);geo.scale(s,s,s);
      ['uv','uv2','tangent','color'].forEach(function(a){if(geo.attributes[a])geo.deleteAttribute(a);});
      geo.computeVertexNormals();finish(geo);
    },function(err){console.warn('head model failed, using procedural shape',err);finish(proceduralGeo());});
  }
  try{
    if(!THREE.GLTFLoader) throw new Error('no loader');
    var tag=document.getElementById('headModel');
    if(tag&&tag.textContent.trim().length>100){
      /* model embedded in the page */
      var bin=atob(tag.textContent.trim()),bytes=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      parse(bytes.buffer);
    }else{
      /* model served as its own file (faster first paint) */
      fetch(EDEBO_MODEL_URL).then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer();}).then(function(buf){var h=new Uint8Array(buf,0,4);if(h[0]===0x67&&h[1]===0x6C&&h[2]===0x54&&h[3]===0x46){parse(buf);return;}var bin=atob(new TextDecoder().decode(buf).trim()),out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);parse(out.buffer);}).catch(function(){finish(proceduralGeo());});
    }
  }catch(e){finish(proceduralGeo());}
}

/* ================= hero: scroll-driven contour scan ================= */
(function(){
  var stage=document.getElementById('scanStage');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fallback(){stage.classList.add('is-fallback');}
  if(typeof THREE==='undefined'){fallback();return;}
  var isMobile=window.innerWidth<760, NS=isMobile?52:68;
  try{
    var sticky=stage.querySelector('.stage__sticky'), canvas=document.getElementById('scene');
    var W=sticky.clientWidth,H=sticky.clientHeight, shiftX=isMobile?0:1.1;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(W,H,false);renderer.setClearColor(0x111111,1);renderer.outputEncoding=THREE.sRGBEncoding;
    var scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(34,W/H,0.1,100);
    var key=new THREE.DirectionalLight(0xffffff,0.8);key.position.set(-1.4,1.0,1.6);scene.add(key);
    var rim=new THREE.DirectionalLight(0x7C3AED,1.4);rim.position.set(1.8,0.6,-1.2);scene.add(rim);
    scene.add(new THREE.AmbientLight(0x2a2140,0.9));
    var g=new THREE.Group();g.position.x=shiftX;if(isMobile){g.position.y=0.92;g.scale.setScalar(0.64);}scene.add(g);

    var camD=1;
    function fit(){var a=W/H;camera.aspect=a;var f=camera.fov*Math.PI/180,hh=1.72,hw=isMobile?1.15:2.3;camD=Math.max(hh/Math.tan(f/2),(hw/Math.tan(f/2))/a);camera.position.set(0,0,camD);camera.lookAt(0,0,0);camera.updateProjectionMatrix();}
    fit();

    /* line shader: violet contours, brighter toward the viewer, dimmed until scanned */
    var lineVert='attribute float aAmt;uniform float uScanY;uniform float uCamD;varying float vLit;varying float vFront;varying float vAmt;'+
      'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vLit=smoothstep(uScanY-0.015,uScanY+0.015,wp.y);vAmt=aAmt;'+
      'vec4 mv=viewMatrix*wp;vFront=clamp((-mv.z-(uCamD+1.1))/(-2.2),0.0,1.0);gl_Position=projectionMatrix*mv;}';
    var lineFrag='precision mediump float;uniform vec3 uLo;uniform vec3 uHi;uniform vec3 uY;uniform float uLitOn;uniform float uAlpha;uniform float uAmtOn;varying float vLit;varying float vFront;varying float vAmt;'+
      'void main(){vec3 c=mix(uLo,uHi,vFront);float L=mix(1.0,mix(0.22,1.0,vLit),uLitOn);c=mix(c,uY,clamp(vAmt*uAmtOn,0.0,1.0));'+
      'gl_FragColor=vec4(c,uAlpha*L*mix(0.62,1.0,vFront));}';
    function lineMat(lo,hi){return new THREE.ShaderMaterial({uniforms:{uScanY:{value:9},uCamD:{value:camD},uLo:{value:new THREE.Color(lo)},uHi:{value:new THREE.Color(hi)},uY:{value:new THREE.Color(0xFFFFFF)},uLitOn:{value:0},uAlpha:{value:1},uAmtOn:{value:0}},vertexShader:lineVert,fragmentShader:lineFrag,transparent:true,depthWrite:false});}
    var mContour=lineMat(0x6D4BC9,0xE4DAFB), mAfter=lineMat(0x7C3AED,0xF1EEF7);

    /* points for the depth step */
    var ptVert='uniform float uScanY;uniform float uSize;uniform float uPR;varying float vLit;varying float vFront;uniform float uCamD;'+
      'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vLit=smoothstep(uScanY-0.03,uScanY+0.03,wp.y);vec4 mv=viewMatrix*wp;vFront=clamp((-mv.z-(uCamD+1.1))/(-2.2),0.0,1.0);'+
      'gl_PointSize=uSize*(0.6+vFront*0.7)*uPR/(-mv.z);gl_Position=projectionMatrix*mv;}';
    var ptFrag='precision mediump float;uniform vec3 uC;uniform float uAlpha;varying float vLit;varying float vFront;'+
      'void main(){vec2 d=gl_PointCoord-0.5;float r=length(d);if(r>0.5)discard;gl_FragColor=vec4(uC,smoothstep(0.5,0.1,r)*uAlpha*vLit*mix(0.35,1.0,vFront));}';
    var mPts=new THREE.ShaderMaterial({uniforms:{uScanY:{value:9},uSize:{value:isMobile?15:17},uPR:{value:renderer.getPixelRatio()},uCamD:{value:camD},uC:{value:new THREE.Color(0xA78BFA)},uAlpha:{value:0}},vertexShader:ptVert,fragmentShader:ptFrag,transparent:true,depthWrite:false});

    var solidMat=new THREE.MeshStandardMaterial({color:0x2B2147,roughness:0.75,metalness:0,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
    var preMat=new THREE.MeshBasicMaterial({colorWrite:false,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2});

    /* yellow scan ribbon: exact slice of the surface at the scan height, as a thin band */
    var MAXS=6000, rPos=new Float32Array(MAXS*18), rGeo=new THREE.BufferGeometry();rGeo.setAttribute('position',new THREE.BufferAttribute(rPos,3));
    var rMat=new THREE.MeshBasicMaterial({color:0xC4B5FD,transparent:true,opacity:1,side:THREE.DoubleSide,depthWrite:false});
    var ribbon=new THREE.Mesh(rGeo,rMat);ribbon.renderOrder=3;ribbon.frustumCulled=false;g.add(ribbon);
    var sbuf=null;

    /* phone + beam */
    function rr(w,h,r){var s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
    var phone=new THREE.Group(),pm=[];
    function pmat(m){pm.push(m);return m;}
    phone.add(new THREE.Mesh(new THREE.ExtrudeGeometry(rr(0.6,1.24,0.13),{depth:0.05,bevelEnabled:false}),pmat(new THREE.MeshBasicMaterial({color:0x1c1726,transparent:true}))));
    var edge=new THREE.Line(new THREE.BufferGeometry().setFromPoints(rr(0.6,1.24,0.13).getPoints(48)),pmat(new THREE.LineBasicMaterial({color:0xA78BFA,transparent:true,depthTest:false})));edge.position.z=0.056;phone.add(edge);
    var scr=new THREE.Mesh(new THREE.ShapeGeometry(rr(0.5,1.06,0.09)),pmat(new THREE.MeshBasicMaterial({color:0x0c0a12,transparent:true})));scr.position.z=0.057;phone.add(scr);
    var pf=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.04),pmat(new THREE.MeshBasicMaterial({color:0xA78BFA,transparent:true,depthTest:false})));pf.position.set(0,-0.42,0.06);phone.add(pf);
    var lens=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.Path().absarc(0,0.05,0.13,0,Math.PI*2).getPoints(40)),pmat(new THREE.LineBasicMaterial({color:0x7C3AED,transparent:true,depthTest:false})));lens.position.z=0.06;phone.add(lens);
    var tip=new THREE.Object3D();tip.position.set(0,0.6,0.06);phone.add(tip);
    if(isMobile){phone.position.set(0.5,-0.05,1.15);phone.scale.setScalar(0.4);}else{phone.position.set(shiftX+0.62,-0.38,1.15);phone.scale.setScalar(0.46);}
    phone.rotation.set(-0.12,-0.45,-0.12);scene.add(phone);
    function setPhone(o){phone.visible=o>0.01;pm.forEach(function(m){m.opacity=o;});}
    var NB=7,bp=new Float32Array(NB*6),bGeo=new THREE.BufferGeometry();bGeo.setAttribute('position',new THREE.BufferAttribute(bp,3));
    var bMat=new THREE.LineBasicMaterial({color:0xA78BFA,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthTest:false});
    var beams=new THREE.LineSegments(bGeo,bMat);beams.frustumCulled=false;scene.add(beams);var tw=new THREE.Vector3(),ev=new THREE.Vector3();

    var contours=null,after=null,points=null,solid=null,pre=null,C=null;
    EDEBO.onReady(function(E){
      C=E.C;
      var cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.BufferAttribute(C.segs,3));cg.setAttribute('aAmt',new THREE.BufferAttribute(new Float32Array(C.segs.length/3),1));
      contours=new THREE.LineSegments(cg,mContour);contours.renderOrder=2;g.add(contours);
      var ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.BufferAttribute(C.after,3));ag.setAttribute('aAmt',new THREE.BufferAttribute(C.amt,1));
      after=new THREE.LineSegments(ag,mAfter);after.renderOrder=2;after.visible=false;g.add(after);
      /* even point cloud */
      var p=E.geo.attributes.position,seen={},out=[],cell=0.036;
      for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x/cell)+'|'+Math.round(y/cell)+'|'+Math.round(z/cell);if(seen[k])continue;seen[k]=1;out.push(x,y,z);}
      var pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(out),3));
      points=new THREE.Points(pg,mPts);points.renderOrder=2;g.add(points);
      pre=new THREE.Mesh(E.geo,preMat);pre.renderOrder=-1;g.add(pre);
      solid=new THREE.Mesh(E.geo,solidMat);solid.renderOrder=0;g.add(solid);
      sbuf=new Float32Array(C.nT*6);
      document.getElementById('cTotal').textContent=String(C.slices.length);
      draw();
    });

    function setRibbon(y,op){
      if(!C||op<0.01){ribbon.visible=false;return;}
      var end=sliceTris(C.T,C.nT,C.tmin,C.tmax,y,sbuf,0),n=Math.min(MAXS,end/6),h=0.007,o=0;
      for(var s=0;s<n;s++){var a=s*6,x1=sbuf[a],z1=sbuf[a+2],x2=sbuf[a+3],z2=sbuf[a+5];
        rPos[o++]=x1;rPos[o++]=y-h;rPos[o++]=z1; rPos[o++]=x2;rPos[o++]=y-h;rPos[o++]=z2; rPos[o++]=x2;rPos[o++]=y+h;rPos[o++]=z2;
        rPos[o++]=x1;rPos[o++]=y-h;rPos[o++]=z1; rPos[o++]=x2;rPos[o++]=y+h;rPos[o++]=z2; rPos[o++]=x1;rPos[o++]=y+h;rPos[o++]=z1;}
      rGeo.setDrawRange(0,n*6);rGeo.attributes.position.needsUpdate=true;rMat.opacity=op;ribbon.visible=true;
      /* beam targets: front-most points of the slice */
      tip.getWorldPosition(tw);g.updateMatrixWorld();
      var S=nearestSlice(y),cx=S?S.cx:0,cz=S?S.cz:0,best=[];
      for(var q=0;q<n;q++){var bx=sbuf[q*6],bz=sbuf[q*6+2],ang=Math.atan2(bx-cx,bz-cz);if(Math.abs(ang)<0.9)best.push([ang,bx,bz]);}
      best.sort(function(a,b){return a[0]-b[0];});
      for(var b=0;b<NB;b++){var o2=b*6,pick=best.length?best[Math.floor((b/(NB-1))*(best.length-1))]:[0,cx,cz+0.5];
        ev.set(pick[1],y,pick[2]);g.localToWorld(ev);bp[o2]=tw.x;bp[o2+1]=tw.y;bp[o2+2]=tw.z;bp[o2+3]=ev.x;bp[o2+4]=ev.y;bp[o2+5]=ev.z;}
      bGeo.attributes.position.needsUpdate=true;
    }
    function nearestSlice(y){if(!C)return null;var best=null,bd=1e9;C.slices.forEach(function(s){var d=Math.abs(s.y-y);if(d<bd){bd=d;best=s;}});return best;}

    var elIntro=document.getElementById('capIntro'),caps=[1,2,3,4].map(function(n){return document.querySelector('[data-cap="'+n+'"]');}),
        elFinal=document.getElementById('capFinal'),bar=document.getElementById('scanFill'),cSlice=document.getElementById('cSlice'),cPhase=document.getElementById('cPhase');
    var P=0,time=0,lastPhase='';
    function computeP(){var total=stage.offsetHeight-window.innerHeight,top=stage.getBoundingClientRect().top;P=total>0?clamp(-top,0,total)/total:0;}

    function update(){
      var p=P;
      if(C){
        var top=C.yMax-0.03*C.span,bot=C.yMin+0.03*C.span,brow=C.yMax-0.1*C.span,chin=C.yMax-0.5*C.span;
        var introW=1-smooth(0.04,0.10,p);
        var ping=0.5-0.5*Math.cos(time*2*Math.PI/7.0);
        var iy=brow+(chin-brow)*ping;
        var scan=clamp((p-0.10)/(0.42-0.10),0,1),sy=top+(bot-top)*scan;
        var y=iy*introW+sy*(1-introW);
        var scanOn=trap(p,0.08,0.12,0.42,0.47);
        var worldY=y*g.scale.y+g.position.y;
        /* contours: fully lit on load, lit progressively while scanning */
        mContour.uniforms.uScanY.value=worldY;mContour.uniforms.uLitOn.value=(1-introW)*(1-smooth(0.42,0.5,p));
        mContour.uniforms.uAlpha.value=1-0.35*smooth(0.24,0.32,p)+0.35*smooth(0.46,0.56,p);
        var cmp=trap(p,0.62,0.68,0.80,0.86);
        after.visible=cmp>0.01;mAfter.uniforms.uAlpha.value=cmp;mAfter.uniforms.uAmtOn.value=cmp;mContour.uniforms.uAlpha.value*=1-0.45*cmp;
        mPts.uniforms.uScanY.value=worldY;mPts.uniforms.uAlpha.value=trap(p,0.22,0.30,0.46,0.54);
        var rec=smooth(0.44,0.56,p);solidMat.opacity=0.95*rec;solid.visible=rec>0.01;
        setRibbon(y,Math.max(introW,scanOn));
        bMat.opacity=0.34*scanOn;
        setPhone(trap(p,0.06,0.11,0.42,0.50));pf.scale.x=Math.max(0.001,scan);pf.position.x=-0.2+0.2*pf.scale.x;
        var si=Math.round((C.yMax-y)/C.span*C.slices.length);cSlice.textContent=String(clamp(si,0,C.slices.length)).padStart(2,'0');
      }
      var turn=smooth(0.62,0.72,p)*0.8-smooth(0.72,0.84,p)*0.5+smooth(0.84,1,p)*0.3;
      var idle=Math.sin(time*0.32)*0.28*(1-smooth(0.04,0.1,p))+Math.sin(time*0.4)*0.05*smooth(0.04,0.1,p);
      g.rotation.y=-0.25+turn+idle;g.rotation.x=-0.05;
      elIntro.style.opacity=(1-smooth(0.03,0.09,p)).toFixed(3);elIntro.style.pointerEvents=p<0.07?'auto':'none';
      var w=[[0.10,0.13,0.22,0.25],[0.26,0.29,0.38,0.41],[0.42,0.45,0.56,0.60],[0.62,0.65,0.78,0.82]];
      caps.forEach(function(c,i){c.style.opacity=trap(p,w[i][0],w[i][1],w[i][2],w[i][3]).toFixed(3);});
      var fo=smooth(0.84,0.9,p);elFinal.style.opacity=fo.toFixed(3);elFinal.style.pointerEvents=fo>0.5?'auto':'none';
      bar.style.width=(clamp((p-0.08)/0.76,0,1)*100).toFixed(1)+'%';
      var ph=p<0.09?'Ready':p<0.26?'Capture':p<0.42?'Depth':p<0.61?'Reconstruct':p<0.84?'Compare':'Complete';
      if(ph!==lastPhase){cPhase.textContent=ph;lastPhase=ph;}
    }
    function draw(){update();renderer.render(scene,camera);}
    function resize(){W=sticky.clientWidth;H=sticky.clientHeight;renderer.setSize(W,H,false);fit();[mContour,mAfter,mPts].forEach(function(m){m.uniforms.uCamD.value=camD;});mPts.uniforms.uPR.value=renderer.getPixelRatio();if(reduce)draw();}
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('scroll',computeP,{passive:true});
    computeP();
    loadModel(NS);
    if(reduce){stage.classList.remove('stage--tall');document.querySelector('.scrollhint').hidden=true;P=0;time=2.0;window.removeEventListener('scroll',computeP);draw();return;}
    var inView=true;
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){inView=e[0].isIntersecting;},{threshold:0}).observe(sticky);}
    function frame(t){time=t*0.001;if(inView)draw();requestAnimationFrame(frame);}
    requestAnimationFrame(frame);
  }catch(err){console.error('scan init failed',err);fallback();loadModel(NS);}
})();

/* ================= compare demo: Day 0 vs Day 30, real 3D surfaces with a split view ================= */
(function(){
  var box=document.getElementById('demoBox'),cv=document.getElementById('demoCanvas'),range=document.getElementById('demoRange'),
      hint=document.getElementById('demoHint'),line=document.getElementById('demoLine'),msg=document.getElementById('demoMsg');
  if(!box) return;
  function fail(t){msg.textContent=t;msg.hidden=false;}
  if(typeof THREE==='undefined'){fail('The 3D preview needs WebGL support in your browser.');return;}
  var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){fail('The 3D preview needs WebGL support in your browser.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cam=new THREE.PerspectiveCamera(26,1,0.1,50),scA=new THREE.Scene(),scB=new THREE.Scene(),gA=new THREE.Group(),gB=new THREE.Group();
  scA.add(gA);scB.add(gB);
  var split=0.5,touched=false,ready=false,inView=false,W=0,H=0,t0=performance.now();

  var vert='attribute float aChange;varying vec3 vN;varying vec3 vW;varying float vC;'+
    'void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vC=aChange;gl_Position=projectionMatrix*viewMatrix*w;}';
  var frag='uniform vec3 uBase;uniform vec3 uLine;uniform vec3 uRim;uniform vec3 uY;uniform float uStep;uniform float uChange;'+
    'varying vec3 vN;varying vec3 vW;varying float vC;'+
    'void main(){vec3 n=normalize(vN);vec3 L=normalize(vec3(-0.45,0.55,0.75));float dif=max(dot(n,L),0.0);'+
    'float rim=pow(1.0-max(n.z,0.0),2.2);'+
    'vec3 c=uBase*(0.28+0.72*dif)+uRim*rim*0.85;'+
    'float f=vW.y/uStep;float dd=min(fract(f),1.0-fract(f));float ln=1.0-smoothstep(0.0,1.3*fwidth(f),dd);'+
    'float k=clamp(vC*uChange,0.0,1.0);'+
    'c=mix(c,uY*(0.45+0.55*dif),k*0.8);'+
    'c=mix(c,mix(uLine,uY,k),ln*0.45);'+
    'gl_FragColor=vec4(c,1.0);}';
  function mat(change){return new THREE.ShaderMaterial({uniforms:{uBase:{value:new THREE.Color(0x7466AE)},uLine:{value:new THREE.Color(0xE4DAFB)},uRim:{value:new THREE.Color(0xA78BFA)},uY:{value:new THREE.Color(0xE2D4FF)},uStep:{value:0.045},uChange:{value:change}},vertexShader:vert,fragmentShader:frag,extensions:{derivatives:true}});}

  EDEBO.onReady(function(E){
    try{
      var C=E.C,src=E.geo,geoA=src.clone(),geoB=src.clone(),pos=geoB.attributes.position,nor=geoB.attributes.normal,n=pos.count;
      /* per-height centre of the head, so "front" and "cheek" are measured around the right axis */
      var NB=60,sx=new Float32Array(NB),sz=new Float32Array(NB),cnt=new Float32Array(NB),i,b;
      for(i=0;i<n;i++){b=Math.min(NB-1,Math.floor((pos.getY(i)-C.yMin)/C.span*NB));sx[b]+=pos.getX(i);sz[b]+=pos.getZ(i);cnt[b]++;}
      for(b=0;b<NB;b++){if(cnt[b]){sx[b]/=cnt[b];sz[b]/=cnt[b];}}
      var yc=C.yMax-0.375*C.span,sy=0.042*C.span,A=0.024*C.span,ch=new Float32Array(n);
      for(i=0;i<n;i++){
        var y=pos.getY(i);b=Math.min(NB-1,Math.floor((y-C.yMin)/C.span*NB));
        var ang=Math.atan2(pos.getX(i)-sx[b],pos.getZ(i)-sz[b]);
        var w=Math.exp(-Math.pow(Math.abs(ang)-0.72,2)/0.09)*Math.exp(-Math.pow(y-yc,2)/(2*sy*sy));
        ch[i]=w;
        pos.setXYZ(i,pos.getX(i)+nor.getX(i)*A*w,y+nor.getY(i)*A*w,pos.getZ(i)+nor.getZ(i)*A*w);
      }
      geoB.setAttribute('aChange',new THREE.BufferAttribute(ch,1));geoB.computeVertexNormals();
      geoA.setAttribute('aChange',new THREE.BufferAttribute(new Float32Array(n),1));
      gA.add(new THREE.Mesh(geoA,mat(0)));gB.add(new THREE.Mesh(geoB,mat(1)));
      /* frame the head (not the shoulders) */
      var top=C.yMax,chin=C.yMax-0.56*C.span,hx=0,hz=0,hc=0;
      for(b=0;b<NB;b++){var yb=C.yMin+(b+0.5)/NB*C.span;if(yb>chin&&cnt[b]){hx+=sx[b];hz+=sz[b];hc++;}}
      hx/=hc||1;hz/=hc||1;
      [gA,gB].forEach(function(g){g.children[0].position.set(-hx,-(top+chin)/2,-hz);});
      cam.userData.h=(top-chin);
      ready=true;msg.hidden=true;size();
    }catch(e){console.error(e);fail('The 3D preview could not load.');}
  });

  function size(){
    var r=box.getBoundingClientRect();W=r.width;H=r.height;if(!W||!H)return;
    renderer.setSize(W,H,false);cam.aspect=W/H;
    var h=(cam.userData.h||1.4)*1.55,f=cam.fov*Math.PI/180,d=Math.max((h/2)/Math.tan(f/2),(h*0.62/2)/Math.tan(f/2)/cam.aspect);
    cam.position.set(0,0.02,d);cam.lookAt(0,0,0);cam.updateProjectionMatrix();draw();
  }
  function draw(){
    if(!ready||!W)return;
    var t=(performance.now()-t0)/1000,rot=reduce?-0.35:-0.35+0.32*Math.sin(t*0.45);
    gA.rotation.y=gB.rotation.y=rot;
    var dpr=renderer.getPixelRatio(),X=Math.round(W*split);
    renderer.setScissorTest(true);renderer.setViewport(0,0,W,H);
    renderer.setScissor(0,0,X,H);renderer.clear();renderer.render(scA,cam);
    renderer.setScissor(X,0,W-X,H);renderer.render(scB,cam);
    renderer.setScissorTest(false);
    line.style.left=(split*100)+'%';
  }
  range.addEventListener('input',function(){split=clamp(range.value/100,0.03,0.97);if(!touched){touched=true;hint.hidden=true;}draw();});
  window.addEventListener('resize',size,{passive:true});
  if('IntersectionObserver' in window){new IntersectionObserver(function(e){inView=e[0].isIntersecting;},{threshold:0.05}).observe(box);}else{inView=true;}
  (function tick(){
    if(inView&&ready){
      if(!touched&&!reduce){var k=(performance.now()-t0)/1000;split=0.5+0.18*Math.sin(k*0.8);range.value=Math.round(split*100);}
      if(!reduce||!touched)draw();
    }
    requestAnimationFrame(tick);
  })();
  size();
})();

