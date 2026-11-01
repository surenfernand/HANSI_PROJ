
const works=[{id:1,title:'A quiet moment',type:'portraits',medium:'Graphite on paper · A4',price:12500,image:'assets/artwork-1.jpg',badge:'Original'},{id:2,title:'Magnolia mornings',type:'nature',medium:'Fine art print · A4',price:4500,image:'assets/artwork-3.jpg',badge:'Art print'},{id:3,title:'A faithful friend',type:'pets',medium:'Custom pet portrait · A4',price:null,image:'assets/artwork-4.jpg',badge:'Commission'}];let bag=[];try{const saved=JSON.parse(sessionStorage.getItem('lines-light-bag-01-coral-sky')||'[]');if(Array.isArray(saved))bag=saved.filter(id=>works.some(w=>w.id===id&&w.price));}catch{}function saveBag(){try{sessionStorage.setItem('lines-light-bag-01-coral-sky',JSON.stringify(bag))}catch{}document.getElementById('count').textContent=bag.length;}const money=n=>'LKR '+n.toLocaleString('en-US');
function render(filter='all'){if(!document.getElementById('artworks'))return;document.getElementById('artworks').innerHTML=works.filter(w=>filter==='all'||(filter==='shop'?w.price!==null:w.type===filter)).map(w=>`<article class="art-card"><div class="image"><span class="badge">${w.badge}</span><button onclick="showArt(${w.id})" aria-label="View ${w.title}"><img src="${w.image}" alt="${w.title}" loading="lazy"></button></div><div class="card-info"><div><h3>${w.title}</h3><p>${w.medium}</p></div><button class="round" onclick="showArt(${w.id})" aria-label="Enlarge ${w.title}">↗</button></div><div class="price-row"><span>${w.price?money(w.price):'Made just for you'}</span>${w.price?`<button onclick="addToBag(${w.id})">Add to bag +</button>`:'<button onclick="openRequest()">Request a portrait ↗</button>'}</div></article>`).join('')}
function setFilter(f){document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b.dataset.filter===f);b.setAttribute('aria-pressed',b.dataset.filter===f)});render(f)}
function showArt(id){const w=works.find(x=>x.id===id);document.getElementById('light-title').textContent=w.title;document.getElementById('light-sub').textContent=w.medium;document.getElementById('light-image').src=w.image;document.getElementById('light-image').alt=w.title;document.getElementById('lightbox').showModal()}
function addToBag(id){if(bag.includes(id)){toast('This artwork is already in your bag.');return}bag.push(id);saveBag();document.getElementById('count').textContent=bag.length;toast('Artwork added to your bag.')}let timer;function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.hidden=false;clearTimeout(timer);timer=setTimeout(()=>t.hidden=true,2800)}
function openCart(){renderCart();document.getElementById('checkout-note').hidden=true;document.getElementById('cart').showModal()}function renderCart(){const items=bag.map(id=>works.find(w=>w.id===id));document.getElementById('cart-items').innerHTML=items.length?items.map(w=>`<div class="cart-item"><div>${w.title}<br><span class="muted">${money(w.price)}</span></div><button onclick="removeItem(${w.id})">Remove</button></div>`).join(''):'<p class="muted">Your bag is waiting for something lovely.</p>';document.getElementById('cart-total').textContent=items.length?'Subtotal: '+money(items.reduce((s,w)=>s+w.price,0)):'';document.getElementById('checkout').hidden=!items.length}function removeItem(id){bag=bag.filter(x=>x!==id);saveBag();document.getElementById('count').textContent=bag.length;renderCart()}
function openRequest(){document.getElementById('request-result').hidden=true;document.getElementById('request').showModal()}document.getElementById('request-form').addEventListener('submit',e=>{e.preventDefault();document.getElementById('request-result').hidden=false;document.getElementById('request-result').scrollIntoView({block:'nearest',behavior:'smooth'})});document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}));document.querySelectorAll('.navlinks a').forEach(a=>a.addEventListener('click',()=>{document.getElementById('nav').classList.remove('open');document.querySelector('.menu').setAttribute('aria-expanded','false')}));setFilter(document.body.dataset.page==='shop'?'shop':'all');

document.getElementById("contact-form")?.addEventListener("submit",e=>{e.preventDefault();document.getElementById("contact-result").hidden=false;});

saveBag();

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("motion");

  var sel = ".section-head, .filters, .art-card, .commission-art, .step, .about > *, .contact .wrap > *, .contact-layout > *, .divider span, footer .footer-row > *";
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -28px 0px" });

  function arm(root) {
    var groups = new Map();
    root.querySelectorAll(sel).forEach(function (el) {
      if (el.dataset.armed || el.closest("[hidden]")) return;
      el.dataset.armed = "1";
      el.classList.add("reveal");
      var n = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, n + 1);
      el.style.setProperty("--d", Math.min(n, 7) * 80 + "ms");
      el.addEventListener("animationend", function (ev) {
        if (ev.target !== el) return;
        el.classList.remove("reveal");
      });
      io.observe(el);
    });
  }

  arm(document);

  var grid = document.getElementById("artworks");
  if (grid) new MutationObserver(function () { arm(grid); }).observe(grid, { childList: true });

  var header = document.querySelector("header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 6); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var count = document.getElementById("count");
  if (count) {
    new MutationObserver(function () {
      var bag = count.closest(".bag");
      if (!bag) return;
      bag.classList.remove("pop");
      void bag.offsetWidth;
      bag.classList.add("pop");
    }).observe(count, { childList: true, characterData: true, subtree: true });
  }

  var art = document.querySelector(".hero-art");
  var hero = art && art.closest(".hero");
  if (art && hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      art.style.translate = (x * -14).toFixed(1) + "px " + (y * -10).toFixed(1) + "px";
    });
    hero.addEventListener("pointerleave", function () { art.style.translate = ""; });
  }

  if (document.body.classList.contains("05-navy-apricot")) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);
    window.addEventListener("pointermove", function (e) {
      glow.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
    }, { passive: true });
  }
})();

