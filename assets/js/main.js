// Home page interactivity: dropdown navigation + accordion
(function(){
  const sel = document.getElementById('learnMore');
  const go = document.getElementById('learnGo');
  if (sel && go){
    const nav = () => {
      const v = sel.value;
      if (!v) return;
      // If it's a relative page, navigate
      if (v.includes('.html') || v.endsWith('/')) {
        window.location.href = v;
        return;
      }
      // Otherwise scroll to anchor
      const el = document.querySelector(v);
      if (el){
        el.scrollIntoView({behavior:'smooth', block:'start'});
      } else {
        window.location.href = v;
      }
    };
    go.addEventListener('click', nav);
    sel.addEventListener('change', (e)=>{ if(e.target.value) nav(); });
  }

  // Accordion
  document.querySelectorAll('[data-acc]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-acc');
      const panel = document.getElementById(id);
      if (!panel) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      const plus = btn.querySelector('.plus');
      if (plus) plus.textContent = expanded ? '+' : '–';
    });
  });
})();
