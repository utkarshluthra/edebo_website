/* Edebo home: Mobile menu and waitlist form (emails sign-ups to the team via Web3Forms).
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
/* mobile menu */
(function(){
  var nav=document.querySelector('.nav'),b=document.getElementById('navBurger'),sh=document.getElementById('navSheet');if(!b)return;
  function set(o){nav.classList.toggle('is-open',o);sh.hidden=!o;b.setAttribute('aria-expanded',String(o));b.setAttribute('aria-label',o?'Close menu':'Open menu');if(window.__lenis){o?__lenis.stop():__lenis.start();}}
  b.addEventListener('click',function(){set(sh.hidden);});
  sh.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!sh.hidden)set(false);});
})();

/* waitlist: emails each sign-up to the Edebo team through Web3Forms; keeps a private copy here when the claude.ai sandbox blocks outside requests */
(function(){
  var WEB3FORMS_KEY='28b7b400-19b4-4727-b2d4-99e32a64e8f9';
  var f=document.getElementById('wlForm');if(!f)return;
  var msg=document.getElementById('wlMsg'),btn=document.getElementById('wlBtn');
  var dbP=null,userP=null;
  if(window.claude&&claude.use){dbP=claude.use('db');userP=claude.use('user');}
  function say(t,c){msg.textContent=t;msg.className='wl__msg'+(c?' '+c:'');}
  async function viaWeb3(d){
    var fd=new FormData();
    fd.append('access_key',WEB3FORMS_KEY);
    fd.append('subject','New Edebo waitlist sign-up: '+d.name+(d.org?' ('+d.org+')':''));
    fd.append('from_name','Edebo website');
    fd.append('replyto',d.email);
    fd.append('name',d.name);fd.append('email',d.email);
    [['phone','Phone'],['city','City'],['org','Clinic or company'],['role','Role']].forEach(function(p){fd.append(p[1],d[p[0]]||'-');});
    fd.append('Submitted at',new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST');
    var r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Accept':'application/json'},body:fd});
    var j=await r.json().catch(function(){return {};});
    if(!r.ok||j.success===false)throw new Error(j.message||'web3forms');
  }
  async function viaDb(d){
    var db=dbP?await dbP:null,user=userP?await userP:null;
    if(!db||!user)throw new Error('nodb');
    await db.collection('waitlist').doc(await user.id()).set(d);
  }
  f.addEventListener('submit',async function(e){
    e.preventDefault();
    if(f.elements.botcheck&&f.elements.botcheck.checked)return;
    var d={};['name','email','phone','city','org','role'].forEach(function(k){d[k]=(f.elements[k].value||'').trim();});
    var bad=false;
    [['wlName',!d.name],['wlEmail',!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)]].forEach(function(x){document.getElementById(x[0]).setAttribute('aria-invalid',x[1]?'true':'false');if(x[1])bad=true;});
    if(bad){say('Add your name and a valid email to join.','err');return;}
    btn.disabled=true;btn.textContent='Sending…';say('');
    d.submittedAt=new Date().toISOString();d.source=location.hostname||'edebo';
    var sent=false;
    try{await viaWeb3(d);sent=true;}catch(err1){try{await viaDb(d);sent=true;}catch(err2){}}
    if(sent){f.reset();btn.textContent='Joined';say("You're on the list. We'll write to you at "+d.email+'.','ok');}
    else{btn.disabled=false;btn.textContent='Join waitlist';say('We could not send this just now. Write to support@edebo.in and we will add you.','err');}
  });
})();
