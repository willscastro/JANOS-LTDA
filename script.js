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

  // Formulário de contato.
  // Com FORM_EMAIL preenchido, envia por e-mail (FormSubmit). Vazio: abre o WhatsApp.
  var FORM_EMAIL = '';
  var WHATSAPP_NUMBER = '5528992575032';
  var form = document.getElementById('contact-form');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = function(id){ var el = form.elements[id]; return el ? el.value.trim() : ''; };

      if (FORM_EMAIL){
        var send = form.querySelector('button[type="submit"]');
        var label = send.textContent;
        send.textContent = 'Enviando…';
        send.disabled = true;
        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(FORM_EMAIL), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: 'Novo contato pelo site Janus — ' + v('service'),
            _template: 'table',
            _captcha: 'false',
            _honey: '',
            Nome: v('name'),
            Empresa: v('company'),
            'E-mail': v('email'),
            Telefone: v('phone'),
            Assunto: v('service'),
            Mensagem: v('message')
          })
        }).then(function(r){ return r.json(); }).then(function(data){
          if (data && (data.success === true || data.success === 'true')){
            send.textContent = 'Mensagem enviada ✓';
            form.reset();
          } else { throw new Error('falha'); }
        }).catch(function(){
          send.textContent = 'Erro ao enviar. Fale pelo WhatsApp.';
        }).then(function(){
          setTimeout(function(){ send.textContent = label; send.disabled = false; }, 3500);
        });
        return;
      }

      var lines = ['Olá, Janus! Vim pelo site.', '', 'Nome: ' + v('name')];
      if (v('company')) lines.push('Empresa: ' + v('company'));
      lines.push('Assunto: ' + v('service'));
      if (v('phone')) lines.push('Telefone: ' + v('phone'));
      if (v('email')) lines.push('E-mail: ' + v('email'));
      lines.push('', v('message'));
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Abrindo o WhatsApp…';
      btn.disabled = true;
      var win = window.open(url, '_blank', 'noopener');
      if (!win){ window.location.href = url; }
      setTimeout(function(){
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 2600);
    });
  }
})();
