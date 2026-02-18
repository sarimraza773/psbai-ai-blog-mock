// Mock submission handling: validate + store locally (includes optional interview scheduling)
(function(){
  const form = document.getElementById('storyForm');
  const success = document.getElementById('success');
  if (!form) return;

  const wantInterview = document.getElementById('wantInterview');
  const interviewGrid = document.getElementById('interviewGrid');
  const interviewDate = document.getElementById('interviewDate');
  const interviewSlot = document.getElementById('interviewSlot');

  const showErr = (name, on) => {
    const el = document.querySelector(`[data-err="${name}"]`);
    if (el) el.hidden = !on;
  };

  const getRole = () => {
    const checked = form.querySelector('input[name="role"]:checked');
    return checked ? checked.value : '';
  };

  // --- Interview scheduling (mock) ---
  const INTERVIEW_KEY = 'psbai_interviews_v1'; // { "YYYY-MM-DD": ["09:00", ...] }

  const loadInterviews = () => {
    try { return JSON.parse(localStorage.getItem(INTERVIEW_KEY) || '{}'); }
    catch { return {}; }
  };
  const saveInterviews = (obj) => localStorage.setItem(INTERVIEW_KEY, JSON.stringify(obj));

  const pad = (n) => String(n).padStart(2,'0');

  // Generate 15-minute slots 09:00–16:45
  const generateSlots = () => {
    const slots = [];
    for (let h = 9; h <= 16; h++){
      for (let m of [0,15,30,45]){
        slots.push(`${pad(h)}:${pad(m)}`);
      }
    }
    return slots;
  };

  const setSlotOptions = (dateStr) => {
    if (!interviewSlot) return;
    const all = generateSlots();
    const booked = (loadInterviews()[dateStr] || []);
    const open = all.filter(s => !booked.includes(s));
    interviewSlot.innerHTML =
      '<option value="">Select a time…</option>' +
      open.map(s => `<option value="${s}">${s}</option>`).join('');
  };

  if (wantInterview && interviewGrid){
    wantInterview.addEventListener('change', ()=>{
      const on = wantInterview.checked;
      interviewGrid.hidden = !on;
      if (!on){
        if (interviewDate) interviewDate.value = '';
        if (interviewSlot) interviewSlot.value = '';
        showErr('interviewDate', false);
        showErr('interviewSlot', false);
      }
    });
  }

  if (interviewDate){
    interviewDate.addEventListener('change', ()=>{
      if (!interviewDate.value) return;
      setSlotOptions(interviewDate.value);
      if (interviewSlot) interviewSlot.value = '';
    });
  }

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

    // interview validation (only if requested)
    const wants = !!(wantInterview && wantInterview.checked);
    const dateStr = interviewDate ? interviewDate.value : '';
    const slotStr = interviewSlot ? interviewSlot.value : '';

    const validInterviewDate = !wants || !!dateStr;
    const validInterviewSlot = !wants || !!slotStr;

    showErr('interviewDate', !validInterviewDate);
    showErr('interviewSlot', !validInterviewSlot);

    if (!(validEmail && validRole && validTitle && validDesc && validInterviewDate && validInterviewSlot)) return;

    try {
      const key = 'psbai_story_submissions_v2';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      const submission = {
        email, role, title, desc,
        interview: wants ? { date: dateStr, slot: slotStr, durationMinutes: 15 } : null,
        createdAt: new Date().toISOString()
      };

      existing.unshift(submission);
      localStorage.setItem(key, JSON.stringify(existing));

      // reserve slot (mock)
      if (wants){
        const interviews = loadInterviews();
        interviews[dateStr] = interviews[dateStr] || [];
        if (!interviews[dateStr].includes(slotStr)){
          interviews[dateStr].push(slotStr);
          saveInterviews(interviews);
        }
      }
    } catch {}

    form.reset();
    if (interviewGrid) interviewGrid.hidden = true;
    if (success) success.hidden = false;
    success?.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
