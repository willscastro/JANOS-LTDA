(function(){
  // Theme toggle (light / dark), persisted in localStorage, with a circular
  // reveal animation (View Transitions API) expanding from the clicked button.
  var toggleTheme = function(e){
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var next = isLight ? 'dark' : 'light';

    var apply = function(){
      document.documentElement.classList.add('theme-switching');
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('janus-theme', next); } catch(err){}
    };

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var supportsVT = typeof document.startViewTransition === 'function';

    if (!supportsVT || reduced) {
      apply();
      return;
    }

    var x = (e && typeof e.clientX === 'number') ? e.clientX : window.innerWidth - 40;
    var y = (e && typeof e.clientY === 'number') ? e.clientY : 40;
    var endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    var transition = document.startViewTransition(apply);
    transition.ready.then(function(){
      document.documentElement.animate(
        {
          clipPath: [
            'circle(0px at ' + x + 'px ' + y + 'px)',
            'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
          ]
        },
        {
          duration: 650,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    }).catch(function(){});
    transition.finished.then(function(){
      document.documentElement.classList.remove('theme-switching');
    }).catch(function(){
      document.documentElement.classList.remove('theme-switching');
    });
  };
  document.querySelectorAll('#theme-toggle, #theme-toggle-mobile').forEach(function(btn){
    btn.addEventListener('click', toggleTheme);
  });

  // Nav shadow on scroll
  var nav = document.querySelector('header.nav');
  if (nav){
    var onScroll = function(){
      if (window.scrollY > 8){ nav.classList.add('scrolled'); }
      else { nav.classList.remove('scrolled'); }
    };
    document.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // Mobile menu
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-menu .close');
  if (burger && menu){
    burger.addEventListener('click', function(){ menu.classList.add('open'); document.body.style.overflow='hidden'; });
  }
  if (closeBtn && menu){
    closeBtn.addEventListener('click', function(){ menu.classList.remove('open'); document.body.style.overflow=''; });
  }
  if (menu){
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ menu.classList.remove('open'); document.body.style.overflow=''; });
    });
  }

  // Reveal on scroll
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if (entry.isIntersecting){
          entry.target.style.animationDelay = (i % 4) * 80 + 'ms';
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    targets.forEach(function(el){ io.observe(el); });
  }

  // Simple contact form (static — no backend wired up)
  var form = document.getElementById('contact-form');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Enviado ✓';
      btn.disabled = true;
      setTimeout(function(){
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 2600);
    });
  }
})();
