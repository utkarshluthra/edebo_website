/* Edebo home: Smooth scroll, parallax, reveals, skin analysis, annotation, ruler, vault, calculator, pricing.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=window.matchMedia('(pointer:fine)').matches;
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function inr(n){return Math.round(n).toLocaleString('en-IN');}

/* ---------- smooth scrolling ---------- */
var lenis=null;
if(!reduce&&typeof Lenis!=='undefined'){
  try{
    lenis=new Lenis({lerp:0.085,wheelMultiplier:0.9,smoothWheel:true});window.__lenis=lenis;
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})(performance.now());
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var t=document.querySelector(id);if(!t)return;e.preventDefault();lenis.scrollTo(t,{offset:-70,duration:1.3});});});
    document.querySelectorAll('.st,.vs-scroll,.ruler-scroll,.tscroll').forEach(function(el){el.setAttribute('data-lenis-prevent-touch','');});
  }catch(e){lenis=null;}
}

/* ---------- progress line + parallax (cached geometry, transform only) ---------- */
var prog=document.createElement('div');prog.className='progress';document.body.appendChild(prog);
var rings=[].slice.call(document.querySelectorAll('.px-ring')).map(function(r){return {el:r,host:r.parentNode,s:parseFloat(r.getAttribute('data-speed'))||0.1};});
var geo=[];function measure(){var y=window.scrollY;geo=rings.map(function(r){var b=r.host.getBoundingClientRect();return {top:b.top+y,h:b.height};});}
measure();window.addEventListener('resize',measure,{passive:true});window.addEventListener('load',measure);
function frame(){
  var y=window.scrollY,vh=window.innerHeight,H=document.documentElement.scrollHeight-vh;
  prog.style.transform='scaleX('+(H>0?y/H:0).toFixed(4)+')';
  if(!reduce){rings.forEach(function(r,i){var g=geo[i];if(!g)return;var mid=g.top+g.h/2-y-vh/2;if(Math.abs(mid)>vh*1.5)return;r.el.style.transform='translate3d(0,'+(mid*r.s).toFixed(1)+'px,0)';});}
  vaultScroll();
}
if(lenis)lenis.on('scroll',frame);else window.addEventListener('scroll',function(){requestAnimationFrame(frame);},{passive:true});

/* ---------- reveal (only below the fold) ---------- */
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('rv-pre');io.unobserve(e.target);}});},{threshold:0.1});
  document.querySelectorAll('[data-rv]').forEach(function(el,i){if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('rv-pre');el.style.transitionDelay=((i%3)*80)+'ms';io.observe(el);}});
}
document.querySelectorAll('.glow').forEach(function(g){var host=g.parentNode;host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect();g.style.setProperty('--gx',(e.clientX-r.left)+'px');g.style.setProperty('--gy',(e.clientY-r.top)+'px');});});
if(fine&&!reduce){document.querySelectorAll('.btn--yellow').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*0.28).toFixed(1)+'px)';});b.addEventListener('pointerleave',function(){b.style.transform='';});});}

function segWire(id,attr,cb){var seg=document.getElementById(id);if(!seg)return;var bs=[].slice.call(seg.querySelectorAll('.seg__btn'));bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.classList.remove('is-active');});b.classList.add('is-active');cb(b.getAttribute(attr));});});}

/* ---------- 3D skin analysis ---------- */
(function(){
  var box=document.getElementById('stAna');if(!box||!window.EdeboStudio||typeof EDEBO==='undefined'){var m=document.getElementById('anaMsg');if(m)m.textContent='3D needs WebGL in your browser.';return;}
  var Z=[{n:'Forehead',x:0,y:0.78,w:0.17,v:[22,18,78,38]},{n:'Under-eye',x:0.17,y:0.42,w:0.075,v:[58,21,64,12]},{n:'Cheeks',x:0.25,y:0.22,w:0.11,v:[47,39,69,44]},{n:'Nose',x:0,y:0.33,w:0.075,v:[19,34,61,73]},{n:'Chin',x:0,y:0.03,w:0.09,v:[26,31,70,49]}];
  var FULL=[41,27,72,46];
  var st,sel=-1,metric=0;
  function zoneAt(p){if(!p)return -1;var best=-1,bw=0.3;Z.forEach(function(z,i){var dx=z.x<0.001?p.x:Math.abs(p.x)-z.x,dy=p.y-z.y,w=Math.exp(-(dx*dx+dy*dy)/(z.w*z.w));if(p.z>0.1&&w>bw){bw=w;best=i;}});return best;}
  function report(){
    var vals=sel>=0?Z[sel].v:FULL;document.getElementById('anaZone').textContent=sel>=0?Z[sel].n:'Full face';
    document.querySelectorAll('#anaRep .rr').forEach(function(r){var i=+r.getAttribute('data-i');r.querySelector('b').textContent=vals[i];r.querySelector('em').style.width=vals[i]+'%';r.classList.toggle('is-on',i===metric);});
    if(st){st.mat.uniforms.uSel.value=sel;st.mat.uniforms.uMetric.value=metric;}
  }
  EDEBO.onReady(function(E){
    st=new EdeboStudio(box,{onTap:function(h){var p=h?h.point.clone():null;if(p)st.group.worldToLocal(p);var z=zoneAt(p);sel=(z===sel)?-1:z;report();},
      onHover:function(h){if(!st)return;var p=h?h.point.clone():null;if(p)st.group.worldToLocal(p);st.mat.uniforms.uHover.value=zoneAt(p);box.style.cursor=h?'pointer':'grab';}});
    st.setGeo(E.geo,'face',{ty:0.38,cz:4.3,cy:0.55});
    var u=st.mat.uniforms;u.uHeatOn.value=1;u.uLines.value=0.6;
    Z.forEach(function(z,i){u.uZones.value[i].set(z.x,z.y,0,z.w);});
    document.getElementById('anaMsg').hidden=true;report();
  });
  segWire('anaMetric','data-m',function(v){metric=+v;report();});
  report();
})();

/* ---------- 3D annotation ---------- */
(function(){
  var box=document.getElementById('stAnno');if(!box||!window.EdeboStudio||typeof EDEBO==='undefined'){var m=document.getElementById('annoMsg');if(m)m.textContent='3D needs WebGL in your browser.';return;}
  var st,faceGeo,bodyGeo,view='face',tool='point',pend=null,n=0,hint=document.getElementById('annoHint'),count=document.getElementById('annoCount');
  var VIEWS={face:{ty:0.4,cz:3.9,cy:0.5},hair:{ty:0.7,cz:3.1,cy:1.8},body:{ty:-0.05,cz:6.4,cy:0.7}};
  function surf(x,y){var h=st.cast(x,y);if(!h)return null;var p=h.point.clone();st.group.worldToLocal(p);return {p:p,n:h.face.normal.clone()};}
  function pp(x,y,tag){var s=surf(x,y);if(s)return st.addPin(s.p,s.n,{tag:tag});}
  function curve(fn,a,b,steps,o){var pts=[];for(var i=0;i<=steps;i++){var t=a+(b-a)*i/steps,xy=fn(t),s=surf(xy[0],xy[1]);if(s)pts.push(s.p.clone().addScaledVector(s.n,0.012));}if(pts.length>1)st.addCurve(pts,o);return pts;}
  function preset(){
    st.clear(true);n=0;pend=null;
    var u=st.mat.uniforms;
    if(view==='face'){
      curve(function(t){return [0,t];},1.02,-0.03,60,{dashed:true,color:0xA78BFA,tag:'Midline',at:8});
      pp(-0.24,0.23,'L cheek');pp(0.24,0.23,'R cheek');pp(0,0.01,'Chin');pp(-0.13,0.17,'');pp(0.13,0.17,'');
      var a=pp(-0.37,0.41,''),b=pp(0.37,0.41,'');if(a&&b)st.addLine(a,b,{});
    }else if(view==='hair'){
      u.uHair.value=1;
      curve(function(t){return [t,0.95+0.55*t*t];},-0.36,0.36,50,{dashed:true,color:0xA78BFA,tag:'Current',at:6,opacity:.9});
      curve(function(t){return [t,0.86+0.55*t*t];},-0.36,0.36,50,{color:0xFFFFFF,tag:'Proposed',at:44});
      var m=pp(0,0.86,'Midfrontal');pp(-0.34,0.924,'');pp(0.34,0.924,'');
      var g=pp(0,0.55,'Glabella');if(m&&g)st.addLine(g,m,{});
    }else{
      var ring=bodyGeo.userData.ring(0.38,0.012),circ=0;for(var i=1;i<ring.length;i++)circ+=ring[i].distanceTo(ring[i-1]);
      st.addCurve(ring,{dashed:true,color:0xE4DAFB,tag:'Waist '+Math.round(circ*250)+' mm',at:32});
      u.uPlan.value[0].set(0.5,-0.5,0.08,0.2);u.uPlan.value[1].set(-0.5,-0.5,0.08,0.2);
      pp(0,-0.62,'Lower abdomen');var c=pp(0,0.62,''),nv=pp(0,-0.41,'Navel');if(c&&nv)st.addLine(c,nv,{});
    }
    sync();
  }
  function sync(){var mk=st.pins.filter(function(p){return p.user&&p.kind==='pt';}).length,ms=st.lines.filter(function(l){return l.user;});
    count.textContent=(mk||ms.length)?(mk+' mark'+(mk===1?'':'s')+(ms.length?' · '+ms.map(function(l){return l.mm.toFixed(1)+' mm';}).join(' · '):'')):'';}
  function setView(v){view=v;st.setGeo(v==='body'?bodyGeo:faceGeo,v==='body'?'body':'face',VIEWS[v]);st.ctrl.autoRotate=false;preset();}
  EDEBO.onReady(function(E){
    faceGeo=E.geo;bodyGeo=EdeboTorso();
    st=new EdeboStudio(box,{editable:true,onTap:function(h){
      if(!h)return;var p=h.point.clone();st.group.worldToLocal(p);var nrm=h.face.normal.clone();
      if(tool==='point'){n++;st.addPin(p,nrm,{user:true,tag:String(n)});hint.textContent='Drag a yellow marker to move it';}
      else{var pin=st.addPin(p,nrm,{user:true,kind:'end'});if(!pend){pend=pin;hint.textContent='Tap the second point';}else{st.addLine(pend,pin,{user:true});pend=null;hint.textContent='Drag either end to adjust';}}
      sync();}});
    st.emit=sync;
    setView('face');st.ctrl.autoRotate=!reduce;
    document.getElementById('annoMsg').hidden=true;
  });
  segWire('annoView','data-v',function(v){if(st)setView(v);});
  segWire('annoTool','data-t',function(t){tool=t;pend=null;hint.textContent=t==='point'?'Tap the model to mark':'Tap two points to measure';});
  document.getElementById('annoClear').addEventListener('click',function(){if(!st)return;st.clear(false);pend=null;sync();});
})();

/* ---------- accuracy ruler + counters ---------- */
(function(){
  var r=document.getElementById('ruler');if(!r) return;var MAX=3;
  for(var i=0;i<=30;i++){var x=i/30*100,t=document.createElement('span');t.className='ruler__tick'+(i%5===0?' mm':'');t.style.left=x+'%';r.appendChild(t);if(i%5===0){var l=document.createElement('span');l.className='ruler__tl'+(i===0?' first':i===30?' last':'');l.style.left=x+'%';l.textContent=(i/10).toFixed(1)+' mm';r.appendChild(l);}}
  var det=document.getElementById('rdetail');
  var M=[{v:0.80,h:58,c:'rm--l',lab:'0.80',d:'0.80 mm · smartphone photogrammetry vs. Vectra M5 (2025)'},{v:0.86,h:132,c:'rm--r',lab:'0.86',d:'0.86 mm · smartphone scan vs. 3dMDface (2023)'},{v:1.10,h:92,c:'',lab:'1.10',d:'1.10 mm · iPhone TrueDepth vs. Vectra M5 (2025)'}];
  var btns=[];
  var rg=document.createElement('button');rg.type='button';rg.className='rrange';rg.style.left=(0.46/MAX*100)+'%';rg.style.width=((1.40-0.46)/MAX*100)+'%';rg.innerHTML='<span>0.46–1.40 mm</span>';
  rg.addEventListener('click',function(){sel(-1);det.textContent='0.46–1.40 mm · range across smartphone studies (2022 review)';});r.appendChild(rg);
  M.forEach(function(m,i){var b=document.createElement('button');b.type='button';b.className='rm '+m.c;b.style.left=(m.v/MAX*100)+'%';b.style.bottom='52px';b.innerHTML='<b>'+m.lab+'</b><i style="height:'+m.h+'px"></i>';b.addEventListener('click',function(){sel(i);});b.addEventListener('mouseenter',function(){sel(i);});r.appendChild(b);btns.push(b);});
  function sel(i){btns.forEach(function(b,k){b.classList.toggle('is-on',k===i);});if(i>=0)det.textContent=M[i].d;}
  sel(0);
  if(reduce||!('IntersectionObserver' in window)) return;
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);var el=e.target,to=parseFloat(el.getAttribute('data-count')),dec=+el.getAttribute('data-dec'),unit=el.querySelector('small').outerHTML,t0=performance.now();(function step(t){var k=cl((t-t0)/1100,0,1),ease=1-Math.pow(1-k,3);el.innerHTML=(to*ease).toFixed(dec)+unit;if(k<1)requestAnimationFrame(step);})(t0);});},{threshold:0.6});
  document.querySelectorAll('[data-count]').forEach(function(n){if(n.getBoundingClientRect().top>window.innerHeight)cio.observe(n);});
})();

/* ---------- security vault ---------- */
var vault=document.getElementById('vault'),secSec=document.getElementById('security');
function vaultScroll(){if(!vault)return;var r=secSec.getBoundingClientRect(),vh=window.innerHeight;if(r.bottom<0||r.top>vh)return;var p=cl((vh*0.8-r.top)/(r.height*0.7),0,1);vault.style.setProperty('--gap',(10+p*46).toFixed(1)+'px');vault.style.transform='rotateX(58deg) rotateZ('+(-40+p*20).toFixed(1)+'deg)';}
(function(){
  if(!vault) return;
  var planes=[].slice.call(vault.querySelectorAll('.plane:not(.plane--core)')),layers=[].slice.call(document.querySelectorAll('#layers .layer'));
  function act(L){layers.forEach(function(x){x.classList.toggle('is-on',x===L);});var k=L.getAttribute('data-k');planes.forEach(function(p){p.classList.toggle('is-on',p.style.getPropertyValue('--i').trim()===k);});}
  act(layers[0]);
  if('IntersectionObserver' in window){var lio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)act(e.target);});},{rootMargin:'-45% 0px -45% 0px'});layers.forEach(function(l){lio.observe(l);});}
  layers.forEach(function(l){l.addEventListener('pointerenter',function(){act(l);});});
  vaultScroll();
  var cv=document.getElementById('vaultCore'),cx=cv.getContext('2d'),pts=[];
  for(var y=-1;y<=1.001;y+=0.075){for(var x=-1;x<=1.001;x+=0.075){var a=x/0.74,b=y/0.96;if(a*a+b*b<=1)pts.push([x,y]);}}
  var vis=true;if('IntersectionObserver' in window){new IntersectionObserver(function(e){vis=e[0].isIntersecting;},{threshold:0}).observe(cv);}
  function size(){var s=cv.parentNode.clientWidth;cv.width=s*2;cv.height=s*2;}size();window.addEventListener('resize',size,{passive:true});
  (function fr(t){if(vis){var w=cv.width,h=cv.height;cx.clearRect(0,0,w,h);var sw=((t*0.00025)%1)*2.4-1.2;pts.forEach(function(p){var on=Math.max(0,1-Math.abs(p[1]-sw)*5);cx.fillStyle='rgba('+Math.round(167+80*on)+','+Math.round(139+100*on)+',250,'+(0.35+0.65*on).toFixed(2)+')';cx.beginPath();cx.arc(w/2+p[0]*w*0.36,h/2+p[1]*h*0.36,(1.6+2.2*on)*(w/400),0,6.283);cx.fill();});}if(!reduce)requestAnimationFrame(fr);})(0);
})();

/* ---------- practice calculator ---------- */
(function(){
  var s=document.getElementById('cScans');if(!s) return;var k=document.getElementById('cPkg'),plan='pro';
  var P={starter:{p:1999,c:100},pro:{p:4999,c:200},premium:{p:9999,c:1000}};
  function fill(r){r.style.setProperty('--f',((r.value-r.min)/(r.max-r.min)*100)+'%');}
  function upd(){var n=+s.value,pkg=+k.value,pl=P[plan];document.getElementById('oScans').textContent=inr(n);document.getElementById('oPkg').textContent='₹'+inr(pkg);
    var per=pl.p/Math.min(n,pl.c);document.getElementById('oPer').textContent='₹'+(per<10?per.toFixed(2):inr(per));
    var mo=pkg/pl.p;document.getElementById('oMonths').textContent=mo>=10?Math.round(mo):mo.toFixed(1);
    document.getElementById('calc').classList.toggle('is-over',n>pl.c);fill(s);fill(k);}
  s.addEventListener('input',upd);k.addEventListener('input',upd);segWire('cPlan','data-p',function(v){plan=v;upd();});upd();
})();

/* ---------- comparison focus ---------- */
segWire('vsPick','data-c',function(c){document.querySelectorAll('#vsTable [data-col]').forEach(function(cell){var me=cell.getAttribute('data-col');cell.classList.toggle('dim',c!=='all'&&me!==c);cell.classList.toggle('foc',c!=='all'&&me===c);});});

/* ---------- pricing ---------- */
(function(){
  var state={cur:'inr',bill:'mo'},ps=document.getElementById('pScans');
  function plat(){if(!ps)return;var n=+ps.value,usd=state.cur==='usd',base=usd?299:25000,r=usd?[0.12,0.10,0.07]:[10,8,6];var o=Math.max(0,n-5000),tot=base+Math.min(o,20000)*r[0]+Math.min(Math.max(o-20000,0),75000)*r[1]+Math.max(o-95000,0)*r[2];
    document.getElementById('opScans').textContent=inr(n);document.getElementById('opTotal').textContent=usd?'$'+Math.round(tot).toLocaleString('en-US'):'₹'+inr(tot);document.getElementById('opPer').textContent=n>0?(usd?'$'+(tot/n).toFixed(3):'₹'+(tot/n).toFixed(2)):'–';ps.style.setProperty('--f',(n/ps.max*100)+'%');}
  function apply(){document.querySelectorAll('#pricing .amt').forEach(function(el){var v=el.getAttribute('data-'+state.cur+'-'+state.bill)||el.getAttribute('data-'+state.cur+'-mo');if(v!=null)el.textContent=v;});document.querySelectorAll('#pricing .per--bill').forEach(function(el){el.textContent=state.bill==='yr'?'/yr':'/mo';});document.querySelectorAll('#pricing td[data-inr]').forEach(function(el){el.textContent=el.getAttribute('data-'+state.cur);});plat();}
  segWire('curSeg','data-cur',function(v){state.cur=v;apply();});segWire('billSeg','data-bill',function(v){state.bill=v;apply();});
  segWire('trackSeg','data-track',function(v){document.querySelectorAll('.price-view').forEach(function(pv){pv.hidden=pv.getAttribute('data-view')!==v;});document.getElementById('billSeg').hidden=(v!=='practice');measure();});
  if(ps)ps.addEventListener('input',plat);apply();
})();
frame();
})();
