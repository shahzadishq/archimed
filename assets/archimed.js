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
    fab.classList.toggle('show',y>(hero?hero.offsetHeight*.7:520));
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

  /* ---------- Multi-step wizards (inquiry + job applications) → prepared e-mail ---------- */
  $$('form.wizard').forEach(function(form){
    var panes=$$('.wz-pane',form), steps=$$('.wz-steps li',form), bar=$('.wz-bar i',form),
        label=$('.wz-label',form), count=$('.wz-count',form), status=$('.status',form), F=form.elements, cur=0;
    var mailOk=function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);};
    if(bar) bar.style.width=(100/panes.length)+'%';
    function valid(i){
      var first=null;
      $$('[required]',panes[i]).forEach(function(f){
        var v=f.value.trim(), bad=!v||(f.type==='email'&&!mailOk(v));
        f.setAttribute('aria-invalid',bad); if(bad&&!first) first=f;
      });
      if(first){first.focus();return false;}
      return true;
    }
    function rows(){
      var out=[];
      $$('input,select,textarea',form).forEach(function(f){
        if(!f.name||f.type==='checkbox') return;
        var l=f.id&&$('label[for="'+f.id+'"]',form), name=f.dataset.sum||(l?l.textContent.replace('*','').trim():f.name);
        var v=f.type==='file'?(f.files&&f.files[0]?f.files[0].name:''):f.value;
        out.push([name,v]);
      });
      return out;
    }
    function summary(){
      var sum=$('.wz-sum',form); sum.innerHTML='';
      rows().forEach(function(r){var w=d.createElement('div'),t=d.createElement('dt'),v=d.createElement('dd');t.textContent=r[0];v.textContent=String(r[1]).trim()||'–';w.append(t,v);sum.appendChild(w);});
    }
    function go(i){
      panes[cur].hidden=true; cur=i; panes[i].hidden=false;
      panes[i].classList.remove('anim'); void panes[i].offsetWidth; panes[i].classList.add('anim');
      steps.forEach(function(s,k){s.classList.toggle('on',k===i);s.classList.toggle('done',k<i);});
      bar.style.width=((i+1)/panes.length*100)+'%';
      label.textContent=panes[i].dataset.label; count.textContent='0'+(i+1)+' / 0'+panes.length;
      if(i===panes.length-1) summary();
      var top=form.getBoundingClientRect().top; if(top<0) form.scrollIntoView({behavior:'smooth',block:'start'});
    }
    $$('[data-next]',form).forEach(function(b){b.addEventListener('click',function(){if(valid(cur)) go(cur+1);});});
    $$('[data-prev]',form).forEach(function(b){b.addEventListener('click',function(){go(cur-1);});});
    $$('input,select,textarea',form).forEach(function(f){f.addEventListener('input',function(){f.removeAttribute('aria-invalid');});f.addEventListener('change',function(){f.removeAttribute('aria-invalid');});});
    $$('.wz-pane input',form).forEach(function(f){f.addEventListener('keydown',function(e){if(e.key==='Enter'&&cur<panes.length-1){e.preventDefault();if(valid(cur))go(cur+1);}});});
    $$('.file input',form).forEach(function(f){f.addEventListener('change',function(){var box=f.closest('.file'),n=$('[data-fname]',box);box.classList.toggle('has',!!f.files.length);if(n)n.textContent=f.files.length?f.files[0].name:'PDF, JPG oder PNG · max. 10 MB';});});
    F.consent.addEventListener('change',function(){$('.consent',form).classList.remove('bad');status.textContent='';});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(cur<panes.length-1){if(valid(cur))go(cur+1);return;}
      if(!F.consent.checked){$('.consent',form).classList.add('bad');status.textContent=form.dataset.consentMsg||'Bitte bestätigen Sie die Datenschutzerklärung.';return;}
      var subjF=form.dataset.subjectField&&F[form.dataset.subjectField];
      var subject=(form.dataset.subject||'Anfrage')+(subjF&&subjF.value?': '+subjF.value:'');
      var body=rows().map(function(r){return r[0]+': '+String(r[1]).trim();}).join('\n');
      if($('.file input',form)) body+='\n\n(Bitte Lebenslauf / Unterlagen an diese E-Mail anhängen.)';
      location.href='mailto:'+(form.dataset.mail||'intensiv@archi-med.de')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      $('.wz-progress',form).hidden=true; panes[cur].hidden=true; $('.hint',form).hidden=true; $('.wz-done',form).hidden=false;
    });
  });

  /* "Jetzt bewerben" on a job card: pre-select that job in the application form */
  $$('[data-apply]').forEach(function(a){a.addEventListener('click',function(){
    var f=d.getElementById(a.getAttribute('href').slice(1)), sel=f&&$('select[name="job"]',f);
    if(sel){sel.value=a.dataset.apply;sel.removeAttribute('aria-invalid');}
  });});

  /* ---------- Filterable lists (jobs, blog, press) ---------- */
  $$('[data-filter-list]').forEach(function(box){
    var list=d.getElementById(box.dataset.filterList), items=$$('[data-cat]',list), chips=$$('[data-value]',box),
        sel=$('select',box), q=$('input[type="search"]',box), cnt=$('.count',box), empty=list.parentElement.querySelector('.empty'), cat='';
    function apply(){
      var loc=sel?sel.value:'', s=q?q.value.trim().toLowerCase():'', n=0;
      items.forEach(function(it){
        var ok=(!cat||(' '+it.dataset.cat+' ').indexOf(' '+cat+' ')>-1)&&(!loc||it.dataset.loc===loc)&&(!s||it.textContent.toLowerCase().indexOf(s)>-1);
        it.hidden=!ok; if(ok){n++;it.classList.add('in');}
      });
      if(cnt) cnt.textContent=n+(n===1?' Eintrag':' Einträge');
      if(empty) empty.hidden=n>0;
    }
    chips.forEach(function(c){c.addEventListener('click',function(){cat=c.dataset.value;chips.forEach(function(x){x.setAttribute('aria-pressed',String(x===c));});apply();});});
    if(sel) sel.addEventListener('change',apply);
    if(q) q.addEventListener('input',apply);
    apply();
  });

  /* Press release cards jump to the article list and pre-filter it */
  $$('[data-topic]').forEach(function(a){a.addEventListener('click',function(){var c=$('.filters [data-value="'+a.dataset.topic+'"]');if(c)c.click();});});

  /* ---------- Legal pages: highlight the current TOC entry ---------- */
  (function(){
    var links=$$('.toc a'); if(!links.length||!('IntersectionObserver' in window)) return;
    var map={}; links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
    var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on');});var a=map[e.target.id];if(a)a.classList.add('on');}});},{rootMargin:'-15% 0px -75% 0px'});
    $$('.prose h2[id]').forEach(function(h){obs.observe(h);});
  })();

  /* ---------- Social Media showcase: phone switches platform ---------- */
  (function(){
    var sec=$('#social-media'); if(!sec) return;
    var phone=$('.phone',sec), cards=$$('.sm-card',sec), dots=$$('.sm-dots button',sec), order=['ig','tt','fb'], cur='ig', timer, inView=false;
    var D={ig:{h:'archimed.gmbh',k:'Pflegedienst · Hannover',b:'Folgen'},tt:{h:'@archimed_pflegedienst',k:'Kurzvideos aus dem Pflegealltag',b:'Folgen'},fb:{h:'ARCHIMED GmbH',k:'Gesundheit & Pflege · Hannover',b:'Gefällt mir'}};
    function show(p){
      if(p===cur) return; cur=p;
      phone.classList.add('swap');
      setTimeout(function(){
        phone.dataset.p=p; $('.ph-handle',phone).textContent=D[p].h; $('.ph-kind',phone).textContent=D[p].k; $('.ph-btn',phone).textContent=D[p].b;
        $('.ph-pico use',phone).setAttribute('href','#'+p);
        phone.classList.remove('swap');
        $$('.ph-grid a',phone).forEach(function(a){a.style.animation='none';void a.offsetWidth;a.style.animation='';});
      },320);
      cards.forEach(function(c){c.classList.toggle('on',c.dataset.p===p);});
      dots.forEach(function(d){var on=d.dataset.p===p;d.classList.remove('on');if(on){void d.offsetWidth;d.classList.add('on');}});
    }
    function next(){show(order[(order.indexOf(cur)+1)%order.length]);}
    function play(){clearInterval(timer);} /* auto-switch disabled: phone stays still unless the visitor hovers/clicks a channel */
    function pause(){clearInterval(timer);sec.classList.add('paused');}
    cards.forEach(function(c){
      c.addEventListener('mouseenter',function(){pause();show(c.dataset.p);});
      c.addEventListener('focus',function(){pause();show(c.dataset.p);});
      c.addEventListener('mouseleave',function(){sec.classList.remove('paused');play();});
    });
    dots.forEach(function(d){d.addEventListener('click',function(){show(d.dataset.p);play();});});
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){inView=e[0].isIntersecting;inView?play():clearInterval(timer);},{threshold:.25}).observe(sec);}
    if(reduce) sec.classList.add('paused');
    /* 3D tilt removed: phone stays static */
  })();

  /* ---------- Active menu state for main menu, dropdown items and mobile menu ---------- */
  (function(){
    var here=(location.pathname.split('/').pop()||'design-2.html').toLowerCase();
    if(here==='index.html') here='design-2.html';
    $$('.menu a, .overlay a').forEach(function(a){
      var h=(a.getAttribute('href')||'').split('#')[0].toLowerCase();
      if(!h||h!==here||(a.getAttribute('href')||'').indexOf('#')>-1) return;
      a.classList.add('on'); a.setAttribute('aria-current','page');
      var sub=a.closest('.submenu, .ov-sub');
      if(sub){var parent=sub.parentElement.querySelector(':scope > a'); if(parent) parent.classList.add('on');}
    });
  })();

  /* ---------- Kontakt: Google Map, loaded only after the visitor clicks (DSGVO two-click) ---------- */
  $$('[data-gmap]').forEach(function(b){b.addEventListener('click',function(){var box=b.closest('.gmap'),f=d.createElement('iframe');f.src=b.dataset.gmap;f.title='Google Maps: ARCHIMED, Sokelantstraße 5, 30165 Hannover';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';f.allowFullscreen=true;box.innerHTML='';box.appendChild(f);box.classList.add('on');});});

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
