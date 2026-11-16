(function(){
  window.__archimed=1;
  var d=document, root=d.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  d.getElementById('year').textContent=new Date().getFullYear();
  function $(s,c){return (c||d).querySelector(s);} function $$(s,c){return [].slice.call((c||d).querySelectorAll(s));}

  /* ---------- Scroll-driven bits: progress, header, fab, parallax, statement, stacking cards ---------- */
  var header=$('.header'), progress=$('.progress'), fab=$('.fab'), hero=$('.hero'), totop=$('.totop');
  var attBg=$('.attitude .bg'), attitude=$('.attitude');
  var words=[], statement=$('[data-words]');
  if(statement && !reduce){
    statement.innerHTML=statement.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>';}).join(' ');
    words=$$('.w',statement);
  }
  var cards=$$('.why-card');
  var lastY=scrollY, ticking=false;
  function frame(){
    ticking=false;
    var y=scrollY, vh=innerHeight, max=root.scrollHeight-vh;
    var pr=(max>0?(y/max):0).toFixed(4);
    progress.style.setProperty('--p',pr);
    totop.style.setProperty('--p',pr);
    totop.classList.toggle('show',y>vh);
    header.classList.toggle('solid',y>30);
    var menuOpen=overlay.classList.contains('open');
    lastY=y;
    if(hero) fab.classList.toggle('show',y>hero.offsetHeight*.7);
    if(reduce) return;
    if(attitude){var r=attitude.getBoundingClientRect();
    if(r.bottom>0 && r.top<vh && attBg) attBg.style.setProperty('--py',((r.top-vh/2)*-.12).toFixed(1)+'px');}
    if(words.length){
      var sr=statement.getBoundingClientRect();
      var p=Math.min(1,Math.max(0,(vh*.85-sr.top)/(sr.height+vh*.35)));
      var lit=p*words.length;
      for(var i=0;i<words.length;i++){words[i].style.setProperty('--o',Math.max(.18,Math.min(1,lit-i+1)).toFixed(2));}
    }
    for(var k=0;k<cards.length-1;k++){
      var next=cards[k+1].getBoundingClientRect(), cur=cards[k].getBoundingClientRect();
      var overlap=Math.min(1,Math.max(0,(cur.bottom-next.top)/cur.height));
      cards[k].style.setProperty('--s',(1-overlap*.06).toFixed(3));
    }
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame);}}
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll);
  totop.addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'});});

  /* ---------- Active nav link ---------- */
  var navLinks=$$('.menu a');
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(es){es.forEach(function(e){navLinks.forEach(function(a){if(a.getAttribute('href')==='#'+e.target.id) a.classList.toggle('on',e.isIntersecting);});});},{rootMargin:'-45% 0px -50% 0px'});
    navLinks.forEach(function(a){var h=a.getAttribute('href');if(!h||h.charAt(0)!=='#')return;var s=$(h);if(s) spy.observe(s);});
  }

  /* ---------- Mobile menu ---------- */
  var overlay=$('#menu'), menuBtn=$('.burger'), closeBtn=$('.ov-close'), lastFocus;
  function openMenu(){lastFocus=d.activeElement;overlay.classList.add('open');menuBtn.setAttribute('aria-expanded','true');root.style.overflow='hidden';setTimeout(function(){closeBtn.focus();},60);}
  function closeMenu(restore){overlay.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');root.style.overflow='';if(restore!==false && lastFocus) lastFocus.focus();}
  menuBtn.addEventListener('click',openMenu); closeBtn.addEventListener('click',closeMenu);
  $$('a',overlay).forEach(function(a){a.addEventListener('click',function(){closeMenu(false);});});
  overlay.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeMenu();return;}
    if(e.key!=='Tab') return;
    var f=$$('a,button',overlay), first=f[0], last=f[f.length-1];
    if(e.shiftKey && d.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && d.activeElement===last){e.preventDefault();first.focus();}
  });

  /* ---------- Services tabs ---------- */
  var svc=$('[data-tabs]'), tabs=$$('[role=tab]',svc), panels=$$('[role=tabpanel]',svc);
  if(svc){
  svc.classList.add('tabs-on');
  function select(i,focus){
    tabs.forEach(function(t,j){var on=i===j;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;panels[j].classList.toggle('active',on);});
    if(focus) tabs[i].focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){select(i);});
    if(fine){var timer;t.addEventListener('mouseenter',function(){timer=setTimeout(function(){select(i);},120);});t.addEventListener('mouseleave',function(){clearTimeout(timer);});}
    t.addEventListener('keydown',function(e){
      var k=e.key, n=tabs.length;
      if(k==='ArrowDown'||k==='ArrowRight'){e.preventDefault();select((i+1)%n,true);}
      else if(k==='ArrowUp'||k==='ArrowLeft'){e.preventDefault();select((i-1+n)%n,true);}
      else if(k==='Home'){e.preventDefault();select(0,true);}
      else if(k==='End'){e.preventDefault();select(n-1,true);}
    });
  });
  }

  /* ---------- Contact form → prepared e-mail ---------- */
  var form=$('#anfrage'), status=$('.status',form);
  if(form){
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var F=form.elements, name=F.fullname.value.trim(), reach=F.reach.value.trim(), ok=true;
    [F.fullname,F.reach].forEach(function(f){var bad=!f.value.trim();f.setAttribute('aria-invalid',bad);if(bad&&ok){f.focus();ok=false;}});
    if(!ok){status.textContent='Bitte geben Sie Ihren Namen und eine Telefonnummer oder E-Mail-Adresse an.';return;}
    var topic=F.topic.value, body='Name: '+name+'\nErreichbar unter: '+reach+'\nAnliegen: '+topic+'\n\n'+F.msg.value.trim();
    status.textContent='Ihr E-Mail-Programm wird geöffnet …';
    location.href='mailto:intensiv@archi-med.de?subject='+encodeURIComponent('Anfrage: '+topic)+'&body='+encodeURIComponent(body);
  });
  $$('input',form).forEach(function(f){f.addEventListener('input',function(){f.removeAttribute('aria-invalid');});});
  }


  /* ---------- Failed images: keep the warm frame, hide the broken-image icon and alt text ---------- */
  $$('main img').forEach(function(img){function miss(){img.style.visibility='hidden';}if(img.complete&&img.src&&img.naturalWidth===0)miss();img.addEventListener('error',miss);});

  /* ---------- Reveals + counters ---------- */
  var revealEls=$$('[data-reveal]'), counters=$$('[data-count]');
  function countUp(el){
    var to=+el.dataset.count, from=+(el.dataset.from||0), t0=null, dur=1600;
    function tick(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,4);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(tick);}
    el.textContent=from; requestAnimationFrame(tick);
  }
  if(reduce || !('IntersectionObserver' in window)){revealEls.forEach(function(el){el.classList.add('in');});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -10% 0px',threshold:.12});
    revealEls.forEach(function(el){
      var sibs=[].filter.call(el.parentElement.children,function(c){return c.hasAttribute('data-reveal');});
      if(!el.style.getPropertyValue('--d')) el.style.setProperty('--d',(Math.min(sibs.indexOf(el),5)*.08)+'s');
      io.observe(el);
    });
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);co.unobserve(e.target);}});},{threshold:.6});
    counters.forEach(function(c){co.observe(c);});
  }
  frame();
})();
