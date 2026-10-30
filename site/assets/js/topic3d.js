/* Edebo topic pages: interactive 3D contour model in the hero (face, scalp, compare, body) + scroll reveal */
(function(){
  /* scroll reveal */
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){io.observe(el);});
  }else{rv.forEach(function(el){el.classList.add('in');});}

  var cv=document.getElementById('t3d');if(!cv)return;
  var box=cv.parentNode,mode=cv.getAttribute('data-mode')||'face';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function noGL(){box.classList.add('no3d');}
  if(typeof THREE==='undefined'){noGL();return;}
  var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){noGL();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,0.1,50);
  var VIEW={face:{p:[0,0.15,4.7],t:[0,0.05,0],r:0.5},scalp:{p:[0,2.7,3.1],t:[0,0.5,0],r:0},compare:{p:[0,0.1,4.7],t:[0,0.05,0],r:0},body:{p:[0,0.05,4.9],t:[0,0,0],r:0.4}}[mode]||{p:[0,0.15,5.6],t:[0,0,0],r:0};
  cam.position.set(VIEW.p[0],VIEW.p[1],VIEW.p[2]);cam.lookAt(VIEW.t[0],VIEW.t[1],VIEW.t[2]);

  var VS='varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
  var FS='uniform float uT;uniform float uScan;uniform float uSplit;uniform int uMode;uniform float uTop;varying vec3 vP;varying vec3 vN;varying vec3 vV;'+
    'float band(float y,float d){float f=fract(y*d);float w=fwidth(y*d)*1.2;return 1.0-smoothstep(0.0,w,min(f,1.0-f));}'+
    'void main(){vec3 n=normalize(vN);float rim=pow(1.0-max(dot(n,vV),0.0),2.2);float lam=max(dot(n,normalize(vec3(0.4,0.6,0.8))),0.0);'+
    'vec3 base=vec3(0.106,0.082,0.18)*(0.55+0.6*lam);vec3 lineC=vec3(0.427,0.294,0.788);vec3 lineHi=vec3(0.894,0.855,0.984);'+
    'float l=band(vP.y,11.0);vec3 c=base+lineC*l*(0.55+0.7*lam);'+
    'if(uMode==1){float h=smoothstep(uTop-0.42,uTop-0.30,vP.y);c=mix(c,c+vec3(0.55,0.45,0.85)*0.45,h);c+=lineHi*l*h*0.9;float hl=1.0-smoothstep(0.0,0.018,abs(vP.y-(uTop-0.36)));c=mix(c,vec3(1.0),hl*0.9*step(-0.1,n.z+vP.z));}'+
    'if(uMode==2){float side=smoothstep(uSplit-0.01,uSplit+0.01,vP.x);vec3 after=base*1.15+lineHi*l*(0.5+0.5*lam);c=mix(c,after,side);'+
    'float ck=exp(-(pow(abs(vP.x)-0.3,2.0)/0.02+pow(vP.y-0.15,2.0)/0.03))*smoothstep(0.0,0.3,n.z);c=mix(c,vec3(0.851,0.8,0.969),clamp(ck*1.6,0.0,0.85)*side);'+
    'float sl=1.0-smoothstep(0.0,0.012,abs(vP.x-uSplit));c=mix(c,vec3(1.0),sl);}'+
    'float sc=exp(-pow((vP.y-uScan)/0.025,2.0));c=mix(c,vec3(0.769,0.71,0.992),sc*0.85);'+
    'c+=vec3(0.48,0.36,0.93)*rim*0.55;gl_FragColor=vec4(c,1.0);}';
  var mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uScan:{value:9},uSplit:{value:0},uMode:{value:mode==='scalp'?1:mode==='compare'?2:0},uTop:{value:1.3}},vertexShader:VS,fragmentShader:FS,extensions:{derivatives:true}});
  var grp=new THREE.Group();scene.add(grp);var mesh=null,yMin=-1.3,yMax=1.3;

  function place(geo){
    geo.computeBoundingBox();var bb=geo.boundingBox,size=new THREE.Vector3(),ctr=new THREE.Vector3();bb.getSize(size);bb.getCenter(ctr);
    geo.translate(-ctr.x,-ctr.y,-ctr.z);var s=Math.min(2.6/size.y,2.4/size.x);geo.scale(s,s,s);geo.computeVertexNormals();geo.computeBoundingBox();
    yMin=geo.boundingBox.min.y;yMax=geo.boundingBox.max.y;mat.uniforms.uTop.value=yMax;
    mesh=new THREE.Mesh(geo,mat);grp.add(mesh);resize();start();
  }
  function torsoGeo(){
    var K=[[0,.6,.42],[.1,.62,.43],[.22,.57,.4],[.38,.47,.33],[.52,.52,.36],[.66,.58,.41],[.78,.62,.38],[.86,.66,.33],[.91,.55,.26],[.95,.3,.19],[1,.17,.16]];
    function sm(t){return t*t*(3-2*t);}
    function ip(v,k){var i=0;while(i<K.length-2&&K[i+1][0]<v)i++;var a=K[i],b=K[i+1],t=sm((v-a[0])/(b[0]-a[0]));return a[k]+(b[k]-a[k])*t;}
    var NV=120,NU=96,pos=[],idx=[],i,j;
    for(j=0;j<=NV;j++){var v=j/NV,a=ip(v,1),d=ip(v,2),y=-1.2+v*2.4;for(i=0;i<=NU;i++){var th=i/NU*Math.PI*2,c=Math.cos(th),s=Math.sin(th),e=2.5;var x=a*Math.sign(c)*Math.pow(Math.abs(c),2/e),z=d*Math.sign(s)*Math.pow(Math.abs(s),2/e);
      if(z>0){z+=0.085*(Math.exp(-(Math.pow(x-0.24,2)/0.018+Math.pow(v-0.67,2)/0.004))+Math.exp(-(Math.pow(x+0.24,2)/0.018+Math.pow(v-0.67,2)/0.004)));z-=0.03*Math.exp(-(x*x/0.0012+Math.pow(v-0.33,2)/0.0008));}
      var sh=Math.exp(-Math.pow(v-0.87,2)/0.004)*Math.pow(Math.abs(c),6)*0.05;pos.push(x*(1+sh),y+sh*0.4,z);}}
    for(j=0;j<NV;j++)for(i=0;i<NU;i++){var p=j*(NU+1)+i,q=p+NU+1;idx.push(p,p+1,q,p+1,q+1,q);}
    var g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);return g;
  }
  function parse(buf){
    if(!THREE.GLTFLoader){noGL();return;}
    new THREE.GLTFLoader().parse(buf,'',function(gltf){var m=null;gltf.scene.traverse(function(o){if(o.isMesh&&!m)m=o;});if(!m){noGL();return;}
      var g=m.geometry.clone();m.updateWorldMatrix(true,false);g.applyMatrix4(m.matrixWorld);['uv','uv2','tangent','color'].forEach(function(a){if(g.attributes[a])g.deleteAttribute(a);});place(g);},noGL);
  }
  if(mode==='body'){place(torsoGeo());}
  else{
    fetch(cv.getAttribute('data-model')).then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer();}).then(function(buf){
      var h=new Uint8Array(buf,0,4);if(h[0]===0x67&&h[1]===0x6C&&h[2]===0x54&&h[3]===0x46){parse(buf);return;}
      var bin=atob(new TextDecoder().decode(buf).trim()),out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);parse(out.buffer);
    }).catch(noGL);
  }

  /* drag to turn */
  var rotY=VIEW.r,vel=0,drag=false,lx=0,lastInput=-1e9;
  cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;lastInput=performance.now();try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;rotY+=dx*0.01;vel=dx*0.01;lastInput=performance.now();if(reduce)start();});
  function up(){drag=false;}cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);

  function resize(){var w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
  window.addEventListener('resize',resize);
  var visible=true,running=false,t0=performance.now();
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)start();}).observe(box);}
  function frame(now){
    if(!visible){running=false;return;}
    var t=(now-t0)/1000;
    if(!drag){vel*=0.94;rotY+=vel;if(!reduce&&now-lastInput>2500){var target=VIEW.r+Math.sin(t*0.35)*0.45;rotY+=(target-rotY)*0.01;}}
    grp.rotation.y=rotY;
    var span=yMax-yMin;mat.uniforms.uScan.value=reduce?9:yMax-((t*0.28)%1.4)/1.2*span;
    mat.uniforms.uSplit.value=reduce?0:Math.sin(t*0.5)*0.35;
    renderer.render(scene,cam);
    if(reduce){running=false;return;}
    requestAnimationFrame(frame);
  }
  function start(){if(running||!mesh)return;running=true;requestAnimationFrame(frame);}
})();
