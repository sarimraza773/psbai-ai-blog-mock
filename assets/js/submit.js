// Mock submission handling: validate + store locally
(function(){
  const form = document.getElementById('storyForm');
  const success = document.getElementById('success');
  if (!form) return;

  const showErr = (name, on) => {
    const el = document.querySelector(`[data-err="${name}"]`);
    if (el) el.hidden = !on;
  };

  const getRole = () => {
    const checked = form.querySelector('input[name="role"]:checked');
    return checked ? checked.value : '';
  };

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (success) success.hidden = true;

    const email = (form.email?.value || '').trim();
    const role = getRole();
    const title = (form.title?.value || '').trim();
    const desc = (form.desc?.value || '').trim();

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validRole = !!role;
    const validTitle = title.length >= 6;
    const validDesc = desc.length >= 20;

    showErr('email', !validEmail);
    showErr('role', !validRole);
    showErr('title', !validTitle);
    showErr('desc', !validDesc);

    if (!(validEmail && validRole && validTitle && validDesc)) return;

    // store locally (mock)
    try {
      const key = 'psbai_story_submissions_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({
        email, role, title, desc,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}

    form.reset();
    if (success) success.hidden = false;
    success?.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
