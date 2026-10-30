/* Edebo home: Scroll choreography: one rAF loop, cached geometry, transforms and clip-paths only.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
/* ================= scroll choreography: one rAF loop, cached geometry, transforms and clip-paths only ================= */
(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function ease(t){return 1-Math.pow(1-t,3);}
var vw=innerWidth,vh=innerHeight,mobile=vw<760;
function absTop(el){var y=0;var r=el.getBoundingClientRect();return r.top+window.scrollY;}

/* ---------- headline word split (only headings below the fold start hidden) ---------- */
function split(el){
  var walk=function(node){[].slice.call(node.childNodes).forEach(function(n){
    if(n.nodeType===3){var parts=n.textContent.split(/(\s+)/),frag=document.createDocumentFragment();
      parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return;}var w=document.createElement('span');w.className='w';var i=document.createElement('span');i.className='wi';i.textContent=p;w.appendChild(i);frag.appendChild(w);});
      n.parentNode.replaceChild(frag,n);}
    else if(n.nodeType===1&&n.tagName!=='BR'){walk(n);}});};
  walk(el);
  [].slice.call(el.querySelectorAll('.wi')).forEach(function(w,k){w.style.transitionDelay=(k*55)+'ms';});
}
var heads=[].slice.call(document.querySelectorAll('.sh h2,.head h2,.hs__title,.close__cta h2,.vision__big,.faq-layout h2'));
if(!reduce&&'IntersectionObserver' in window){
  var hio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('fx-words-pre');hio.unobserve(e.target);}});},{threshold:0.3});
  heads.forEach(function(h){split(h);if(h.getBoundingClientRect().top>vh){h.classList.add('fx-words-pre');hio.observe(h);}});
  /* table rows cascade, pricing fan */
  var once=function(el,cls,th){if(!el||el.getBoundingClientRect().top<vh)return;el.classList.add(cls);var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){el.classList.remove(cls);o.disconnect();}},{threshold:th||0.15});o.observe(el);};
  var vsT=document.getElementById('vsTable');if(vsT){[].slice.call(vsT.querySelectorAll('tbody tr')).forEach(function(r,i){r.style.transitionDelay=(i*45)+'ms';});once(vsT,'fx-rows-pre');}
  once(document.querySelector('.tiers--3'),'fx-fan-pre',0.12);
}

/* ---------- targets ---------- */
var hs=document.getElementById('how'),track=document.getElementById('hsTrack'),panels=track?[].slice.call(track.children):[],hsNow=document.getElementById('hsNow'),hsBar=document.getElementById('hsBar');
var curtains=[].slice.call(document.querySelectorAll('#annotate,#security,#contact'));
curtains.forEach(function(c){c.classList.add('fx-curtain');});
var player=document.getElementById('player');
var shs=[].slice.call(document.querySelectorAll('.sh,.head'));
var mq=document.getElementById('mq1');
var studios=[document.getElementById('stAna'),document.getElementById('stAnno')].filter(Boolean);
studios.forEach(function(s){s.setAttribute('data-yaw','0');});
var acc=[].slice.call(document.querySelectorAll('.acc3 > div'));
var G={};
function measure(){
  vw=innerWidth;vh=innerHeight;mobile=vw<760;
  if(hs)G.hs={top:absTop(hs),h:hs.offsetHeight,tw:track.scrollWidth};
  G.cur=curtains.map(function(c){return absTop(c);});
  if(player)G.pl=absTop(player);
  G.sh=shs.map(function(s){return absTop(s);});
  G.st=studios.map(function(s){return {top:absTop(s),h:s.offsetHeight};});
  G.acc=acc.map(function(a){return absTop(a);});
  last=-1;
}
var last=-1,vel=0,prevY=window.scrollY;
measure();addEventListener('resize',measure,{passive:true});addEventListener('load',measure);setTimeout(measure,1500);
document.querySelectorAll('#trackSeg .seg__btn,.cmpx summary').forEach(function(b){b.addEventListener('click',function(){setTimeout(measure,60);});});

function tick(){
  var y=window.scrollY,d=y-prevY;prevY=y;vel+= (d-vel)*0.18;
  if(Math.abs(y-last)>0.1||Math.abs(vel)>0.05){
    last=y;
    /* sideways steps */
    if(hs&&!mobile){var g=G.hs,p=cl((y-g.top)/(g.h-vh),0,1),max=Math.max(0,g.tw-vw);
      track.style.transform='translate3d('+(-p*max).toFixed(1)+'px,0,0)';
      panels.forEach(function(pn,i){var r=pn.getBoundingClientRect(),c=(r.left+r.width/2-vw/2)/vw;pn.style.transform='perspective(1400px) rotateY('+(c*-14).toFixed(2)+'deg) scale('+(1-Math.min(0.08,Math.abs(c)*0.1)).toFixed(3)+')';pn.style.opacity=(1-Math.min(0.5,Math.abs(c)*0.6)).toFixed(3);});
      hsNow.textContent='0'+Math.min(4,Math.floor(p*3.999)+1);hsBar.style.transform='scaleX('+p.toFixed(4)+')';window.__hsP=p;}
    /* dark sections open out of a rounded card */
    curtains.forEach(function(c,i){var e=ease(cl((y+vh-G.cur[i])/(vh*0.75),0,1)),k=1-e;c.style.clipPath=k<0.002?'none':'inset(0 '+(k*7).toFixed(2)+'% 0 '+(k*7).toFixed(2)+'% round '+(k*64).toFixed(1)+'px)';});
    /* film grows into place */
    if(player){var f=ease(cl((y+vh-G.pl)/(vh*0.9),0,1));player.style.transform='scale('+(0.78+0.22*f).toFixed(4)+')';player.style.borderRadius=(56-34*f).toFixed(1)+'px';}
    /* eyebrows drift slower than their headlines */
    shs.forEach(function(s,i){var eb=s.querySelector('.eyebrow');if(!eb)return;var off=(G.sh[i]-y-vh*0.5)*0.12;if(Math.abs(off)>300)return;eb.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';});
    /* 3D models turn as you scroll past */
    studios.forEach(function(s,i){var g=G.st[i],p=cl((y+vh-g.top)/(vh+g.h),0,1);s.setAttribute('data-yaw',((p-0.5)*1.5).toFixed(3));});
    /* accuracy numbers rise at different speeds */
    acc.forEach(function(a,i){var off=(G.acc[i]-y-vh*0.6)*(0.05+i*0.04);if(Math.abs(off)>200)return;a.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';});
  }
  /* marquee runs with scroll and leans with speed */
  if(mq){var half=mq.scrollWidth/2,x=-((y*0.45)%half),sk=cl(-vel*0.35,-12,12);mq.style.transform='translate3d('+x.toFixed(1)+'px,0,0) skewX('+sk.toFixed(2)+'deg)';}
  requestAnimationFrame(tick);
}
if(!reduce)requestAnimationFrame(tick);

})();
