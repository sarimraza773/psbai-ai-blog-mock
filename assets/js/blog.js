// News page interactivity: search + tag filter + social actions + sections (Latest/Hot/Archives)
(function(){
  const STORAGE_LIKES = 'psbai_like_counts_v1';

  const posts = [
    { id:'p1', title:'Edge AI on microcontrollers gets a big efficiency boost', date:'2026-02-01', displayDate:'Feb 01, 2026', tags:['Robotics','Education'], primary:'Robotics', archive:'2026-02', likesSeed:42, commentsSeed:6, blurb:'A new technique reduces on-device inference cost by pruning + quantizing while maintaining accuracy in common sensor tasks.'},
    { id:'p2', title:'Text-to-video models learn longer scenes with better motion', date:'2026-01-27', displayDate:'Jan 27, 2026', tags:['GenAI','Computer Vision'], primary:'Computer Vision', archive:'2026-01', likesSeed:88, commentsSeed:14, blurb:'Researchers propose training and decoding tweaks that preserve temporal coherence across multi-shot sequences.'},
    { id:'p3', title:'Healthcare assistants improve triage with structured reasoning', date:'2026-01-18', displayDate:'Jan 18, 2026', tags:['Healthcare','GenAI'], primary:'Healthcare', archive:'2026-01', likesSeed:74, commentsSeed:10, blurb:'A clinical workflow prototype uses constrained outputs and verification steps to reduce unsafe recommendations.'},
    { id:'p4', title:'Classroom copilots: what worked in pilot courses', date:'2026-01-10', displayDate:'Jan 10, 2026', tags:['Education'], primary:'Education', archive:'2026-01', likesSeed:33, commentsSeed:4, blurb:'A pilot program highlights prompt scaffolding, rubric-aligned feedback, and clear AI-use policies that students actually follow.'},
    { id:'p5', title:'Better retrieval for technical documentation with hybrid indexing', date:'2025-12-29', displayDate:'Dec 29, 2025', tags:['GenAI'], primary:'GenAI', archive:'2025-12', likesSeed:51, commentsSeed:8, blurb:'A hybrid approach blends dense retrieval with keyword constraints to reduce hallucinations when answering “where is it defined?” questions.'},
    { id:'p6', title:'Prompt injection defenses improve with structured tool policies', date:'2025-12-22', displayDate:'Dec 22, 2025', tags:['Security','Policy & Ethics'], primary:'Security', archive:'2025-12', likesSeed:67, commentsSeed:12, blurb:'A lightweight policy layer helps tools ignore untrusted instructions and reduces data exfiltration risk in agent workflows.'},
    { id:'p7', title:'Policy update: transparency labels for synthetic media', date:'2026-01-05', displayDate:'Jan 05, 2026', tags:['Policy & Ethics'], primary:'Policy & Ethics', archive:'2026-01', likesSeed:29, commentsSeed:3, blurb:'A proposal outlines disclosure labels and provenance metadata for AI-generated media to support trust and accountability.'},
  ];

  const $q = document.getElementById('q');
  const $tag = document.getElementById('tag');
  const $clear = document.getElementById('clear');

  const $latest = document.getElementById('postListLatest');
  const $hot = document.getElementById('postListHot');
  const $arch = document.getElementById('postListArchives');

  const panels = {
    latest: document.getElementById('panel-latest'),
    hot: document.getElementById('panel-hot'),
    archives: document.getElementById('panel-archives'),
  };

  const tabBtns = Array.from(document.querySelectorAll('.tab[data-tab]'));
  const archiveBtns = Array.from(document.querySelectorAll('.archive-btn[data-archive]'));

  const loadMap = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch { return {}; }
  };
  const saveMap = (key, map) => localStorage.setItem(key, JSON.stringify(map));

  let likeCounts = loadMap(STORAGE_LIKES);

  posts.forEach(p => {
    if (likeCounts[p.id] == null) likeCounts[p.id] = p.likesSeed;
  });
  saveMap(STORAGE_LIKES, likeCounts);

  let activeArchive = 'all';

  const getTextQuery = () => ($q ? $q.value : '').trim().toLowerCase();
  const getTag = () => ($tag ? $tag.value : '').trim();

  const matchesGlobal = (post) => {
    const qq = getTextQuery();
    const t = getTag();
    const okQ = !qq || post.title.toLowerCase().includes(qq) || post.blurb.toLowerCase().includes(qq);
    const okT = !t || post.tags.includes(t) || post.primary === t;
    return okQ && okT;
  };

  const matchesArchive = (post) => activeArchive === 'all' || post.archive === activeArchive;

  const sortLatest = (arr) => arr.slice().sort((a,b)=> (a.date < b.date ? 1 : -1));
  const sortHot = (arr) => arr.slice().sort((a,b)=>{
    const scoreA = (likeCounts[a.id] || 0) + (a.commentsSeed || 0)*3;
    const scoreB = (likeCounts[b.id] || 0) + (b.commentsSeed || 0)*3;
    return scoreB - scoreA;
  });

  const elEmpty = (msg) => {
    const d = document.createElement('div');
    d.className = 'post';
    d.innerHTML = `<div class="post-title">${msg}</div><div class="post-body">Try clearing filters or switching sections.</div>`;
    return d;
  };

  const onLike = (id) => {
    likeCounts[id] = (likeCounts[id] || 0) + 1;
    saveMap(STORAGE_LIKES, likeCounts);
    renderAll();
  };

  const onShare = async (id) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AI Innovation News', text: 'Check this post', url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } else {
        prompt('Copy this link:', url);
      }
    } catch (e) {}
  };

  const onToggleComments = (btn) => {
    const id = btn.getAttribute('data-comment');
    const panel = document.getElementById(`c_${id}`);
    if (!panel) return;
    const open = panel.getAttribute('data-open') === 'true';
    panel.setAttribute('data-open', String(!open));
    panel.hidden = open;
    btn.textContent = open ? 'Comment ' : 'Hide ';
    const span = document.createElement('span');
    span.className = 'count';
    span.textContent = (posts.find(p=>p.id===id)?.commentsSeed ?? 0);
    btn.appendChild(span);
  };

  const renderPosts = (container, list) => {
    if (!container) return;
    container.innerHTML = '';
    if (!list.length) {
      container.appendChild(elEmpty('No posts match your filters.'));
      return;
    }

    list.forEach(p => {
      const likes = likeCounts[p.id] || 0;
      const article = document.createElement('article');
      article.className = 'post';
      article.id = p.id;

      const tagsHtml = [...new Set([p.primary, ...p.tags])].map(t => `<span class="tag">${t}</span>`).join('');

      article.innerHTML = `
        <div class="post-top">
          <div>
            <h3 class="post-title">${p.title}</h3>
            <div class="post-meta">${p.displayDate}</div>
          </div>
        </div>

        <div class="post-tags">${tagsHtml}</div>
        <div class="post-body">${p.blurb}</div>

        <div class="post-actions social-actions">
          <button class="btn btn-quiet" type="button" data-like="${p.id}">Like <span class="count">${likes}</span></button>
          <button class="btn btn-quiet" type="button" data-comment="${p.id}">Comment <span class="count">${p.commentsSeed}</span></button>
          <button class="btn btn-quiet" type="button" data-share="${p.id}">Share</button>
          <a class="btn btn-primary" href="../404.html">Read more</a>
        </div>

        <div class="comments" id="c_${p.id}" hidden data-open="false" aria-label="Comments">
          <div class="comments-title">Comments (dummy)</div>
          <div class="comment">“Really interesting. Would love to see benchmarks.”</div>
          <div class="comment">“This seems promising for classroom workflows.”</div>
          <div class="comment-box">
            <input class="input" type="text" placeholder="Write a comment… (disabled)" disabled />
            <button class="btn btn-primary" type="button" disabled>Post</button>
          </div>
        </div>
      `;
      container.appendChild(article);
    });

    container.querySelectorAll('[data-like]').forEach(btn => {
      btn.addEventListener('click', ()=> onLike(btn.getAttribute('data-like')));
    });
    container.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', ()=> onShare(btn.getAttribute('data-share')));
    });
    container.querySelectorAll('[data-comment]').forEach(btn => {
      btn.addEventListener('click', ()=> onToggleComments(btn));
    });
  };

  const renderAll = () => {
    const global = posts.filter(matchesGlobal);
    renderPosts($latest, sortLatest(global));
    renderPosts($hot, sortHot(global));
    renderPosts($arch, sortLatest(global.filter(matchesArchive)));
  };

  const setTab = (name) => {
    tabBtns.forEach(b=>{
      const active = b.getAttribute('data-tab') === name;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    Object.entries(panels).forEach(([k, el])=>{
      if (!el) return;
      el.hidden = (k !== name);
    });
  };

  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const name = btn.getAttribute('data-tab');
      if (!name) return;
      setTab(name);
      const top = document.querySelector('.feed-header');
      if (top) top.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  const setActiveArchive = (val) => {
    activeArchive = val || 'all';
    archiveBtns.forEach(b=>{
      const isActive = (b.getAttribute('data-archive') || 'all') === activeArchive;
      b.classList.toggle('active', isActive);
    });
    renderAll();
  };
  archiveBtns.forEach(btn=>{
    btn.addEventListener('click', ()=> setActiveArchive(btn.getAttribute('data-archive') || 'all'));
  });

  if ($q) $q.addEventListener('input', renderAll);
  if ($tag) $tag.addEventListener('change', renderAll);
  if ($clear) $clear.addEventListener('click', ()=>{
    if ($q) $q.value = '';
    if ($tag) $tag.value = '';
    renderAll();
  });

  renderAll();
})();
