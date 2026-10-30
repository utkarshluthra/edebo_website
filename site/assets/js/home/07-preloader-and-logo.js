/* Edebo home: Preloader exit and nav logo spin.
   Loaded in order from index.html; files share globals (THREE, EDEBO, clamp, smooth...). */
(function(){
  var pre=document.getElementById('pre');
  if(pre){var done=function(){pre.classList.add('is-done');};pre.addEventListener('animationend',function(e){if(e.target===pre&&e.animationName==='preOut')done();});setTimeout(function(){pre.classList.add('go');},400);setTimeout(done,6000);}
  var nl=document.querySelector('.nav .lg');
  if(nl){var host=nl.parentNode;
    var spin=function(){if(nl.classList.contains('is-spin'))return;nl.classList.add('is-spin');};
    host.addEventListener('mouseenter',spin);host.addEventListener('focus',spin);
    nl.querySelector('.lg__g3').addEventListener('animationend',function(){nl.classList.remove('is-spin');});}
})();
