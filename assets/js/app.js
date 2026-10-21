/* ============================================================
   毕业季相册 · 交互脚本
   ============================================================ */
(function () {
  const S = window.SITE;
  const A = window.ALBUMS;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 首屏 ---------------- */
  $('heroTitle').textContent = S.hero.title;
  $('heroSub').textContent = S.hero.subtitle;
  $('heroDesc').textContent = S.hero.desc;
  $('heroTags').innerHTML = S.hero.tags.map((t) => `<i>${esc(t)}</i>`).join('');

  // 挑横构图照片做首屏轮播
  const all = [];
  A.forEach((a) => a.items.forEach((it) => all.push(Object.assign({}, it, { seg: a.label }))));
  const landscape = all.filter((p) => p.w >= p.h).sort(() => 0.5 - Math.random()).slice(0, 5);
  const slides = landscape.length ? landscape : all.slice(0, 5);

  $('heroSlides').innerHTML = slides
    .map((p, i) => `<div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image:url('${esc(p.l)}')"></div>`)
    .join('');
  $('heroDots').innerHTML = slides.map((_, i) => `<div class="dot${i === 0 ? ' on' : ''}" data-i="${i}"></div>`).join('');

  let cur = 0;
  const slideEls = document.querySelectorAll('.hero-slide');
  const dotEls = document.querySelectorAll('.dot');
  const go = (n) => {
    cur = (n + slides.length) % slides.length;
    slideEls.forEach((el, i) => el.classList.toggle('active', i === cur));
    dotEls.forEach((el, i) => el.classList.toggle('on', i === cur));
  };
  dotEls.forEach((d) => d.addEventListener('click', () => go(+d.dataset.i)));
  setInterval(() => go(cur + 1), 5200);

  /* ---------------- 数据条 ---------------- */
  $('statsBar').innerHTML = S.stats
    .map((s) => `<div class="stat"><b>${esc(s.num)}<em>${esc(s.unit)}</em></b><span>${esc(s.label)}</span></div>`)
    .join('');

  /* ---------------- 套餐 ---------------- */
  $('pkgList').innerHTML = S.packages
    .map((p) => `
      <div class="pkg${p.hot ? ' hot' : ''}">
        ${p.hot ? '<div class="pkg-flag">最多班级选择</div>' : ''}
        <div class="pkg-name">${esc(p.name)}</div>
        <div class="pkg-tagline">${esc(p.tagline)}</div>
        <div class="pkg-price"><i>¥</i><b>${p.price}</b><small>${esc(p.unit)}</small></div>
        <div><span class="pkg-for">${esc(p.for)}</span></div>
        <ul class="pkg-feats">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <a class="pkg-btn" href="#contact">选这个套餐咨询</a>
      </div>`)
    .join('');

  /* ---------------- 作品样片 ---------------- */
  const tabs = [{ key: 'all', label: '全部' }].concat(A.map((a) => ({ key: a.key, label: a.label })));
  const count = (k) => (k === 'all' ? all.length : (A.find((a) => a.key === k) || { items: [] }).items.length);
  $('galTabs').innerHTML = tabs
    .map((t, i) => `<button class="gal-tab${i === 0 ? ' on' : ''}" data-k="${t.key}">${esc(t.label)}<i>${count(t.key)}</i></button>`)
    .join('');

  let photoSet = all;

  function renderGallery(k) {
    photoSet = k === 'all' ? all : (A.find((a) => a.key === k) || { items: [] }).items.slice();
    $('masonry').innerHTML = photoSet
      .map((p, i) => `
        <div class="item" data-i="${i}">
          <img src="${esc(p.t)}" alt="${esc(p.seg || '')}毕业照" loading="lazy" width="${p.w}" height="${p.h}">
          <div class="mask"><span>${esc(p.seg || '样片')}</span></div>
        </div>`)
      .join('');
  }
  renderGallery('all');

  $('galTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.gal-tab');
    if (!b) return;
    document.querySelectorAll('.gal-tab').forEach((x) => x.classList.toggle('on', x === b));
    renderGallery(b.dataset.k);
  });

  /* ---------------- 灯箱 ---------------- */
  const lb = $('lb'), lbImg = $('lbImg'), lbCount = $('lbCount');
  let lbIdx = 0;

  function openLb(i) {
    lbIdx = i;
    lbImg.src = photoSet[i].l;
    lbCount.textContent = `${i + 1} / ${photoSet.length}`;
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('on');
    document.body.style.overflow = '';
  }
  function moveLb(d) {
    lbIdx = (lbIdx + d + photoSet.length) % photoSet.length;
    lbImg.src = photoSet[lbIdx].l;
    lbCount.textContent = `${lbIdx + 1} / ${photoSet.length}`;
  }

  $('masonry').addEventListener('click', (e) => {
    const it = e.target.closest('.item');
    if (it) openLb(+it.dataset.i);
  });
  $('lbClose').addEventListener('click', closeLb);
  $('lbPrev').addEventListener('click', () => moveLb(-1));
  $('lbNext').addEventListener('click', () => moveLb(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') moveLb(-1);
    if (e.key === 'ArrowRight') moveLb(1);
  });

  /* ---------------- 工艺（图标） ---------------- */
  const ICONS = {
    book: '<path d="M4 4h9a3 3 0 013 3v13a2.5 2.5 0 00-2.5-2.5H4V4zm16 0h-4v13.5H20a1.5 1.5 0 001.5-1.5V5.5A1.5 1.5 0 0020 4z"/>',
    print: '<path d="M7 9V3h10v6m0 0H7m10 0a3 3 0 013 3v5h-3m-10-8H4a3 3 0 00-3 3v5h3m0 4h10m-10-4h10v4H7v-4z"/>',
    film: '<path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h10v6H7V9z"/>',
    layout: '<path d="M3 4h18v16H3V4zm2 2v5h6V6H5zm8 0v12h7V6h-7zm-8 7v5h6v-5H5z"/>',
    cloud: '<path d="M7 18h11a4 4 0 000-8 6 6 0 00-11.6 2A3.5 3.5 0 007 18z"/>',
    gift: '<path d="M20 7h-2.2A3 3 0 0012 3.6 3 3 0 006.2 7H4a1 1 0 00-1 1v3h18V8a1 1 0 00-1-1zM3 13v8h8v-8H3zm10 0v8h8v-8h-8z"/>'
  };
  $('craftList').innerHTML = S.craft
    .map((c) => `
      <div class="craft">
        <div class="craft-ico"><svg viewBox="0 0 24 24" fill="currentColor">${ICONS[c.icon] || ICONS.book}</svg></div>
        <h4>${esc(c.title)}</h4>
        <p>${esc(c.desc)}</p>
      </div>`)
    .join('');

  /* ---------------- 流程 ---------------- */
  $('stepList').innerHTML = S.steps
    .map((s) => `<div class="step"><div class="step-n">${esc(s.step)}</div><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></div>`)
    .join('');

  /* ---------------- 院校 ---------------- */
  $('schoolList').innerHTML = S.schools.map((s) => `<span class="school">${esc(s)}</span>`).join('');

  /* ---------------- FAQ ---------------- */
  $('faqList').innerHTML = S.faqs
    .map((f, i) => `
      <div class="faq">
        <button class="faq-q">${esc(f.q)}<span class="ic">+</span></button>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </div>`)
    .join('');

  $('faqList').addEventListener('click', (e) => {
    const b = e.target.closest('.faq-q');
    if (!b) return;
    const item = b.parentElement;
    const body = b.nextElementSibling;
    const open = item.classList.contains('on');
    document.querySelectorAll('.faq').forEach((x) => { x.classList.remove('on'); x.querySelector('.faq-a').style.maxHeight = null; });
    if (!open) { item.classList.add('on'); body.style.maxHeight = body.scrollHeight + 'px'; }
  });

  /* ---------------- 页脚 & 电话 ---------------- */
  $('fBrand').textContent = S.brand.name;
  $('fSlogan').textContent = S.brand.slogan;
  $('fContact').innerHTML = [
    `联系人：${esc(S.brand.person)}`,
    `电话：${esc(S.brand.phone)}`,
    esc(S.brand.wechat)
  ].map((x) => `<span>${x}</span>`).join('');

  /* ---------------- 滚动效果 ---------------- */
  const nav = $('nav'), fab = $('fab');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    fab.classList.toggle('show', y > 700);
  }, { passive: true });
})();
