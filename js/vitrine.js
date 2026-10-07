// Vitrine
let allProducts = [];
let activeStore = 'todos';

function applyConfig(){
  const cfg = getConfig();
  document.getElementById('storeName').textContent = cfg.name;
  document.getElementById('heroTitle').textContent = cfg.hero || cfg.name;
  document.getElementById('heroSub').textContent = cfg.sub || '';
  document.getElementById('footerName').textContent = cfg.name;
  document.getElementById('linkFace').href = cfg.facebook || '#';
  document.getElementById('linkInsta').href = cfg.instagram || '#';
  document.getElementById('linkWpp').href = cfg.whatsapp || '#';
  document.title = cfg.name + ' | Vitrine';
}

function badgeClass(store){
  if(store==='mercadolivre') return 'badge-ml';
  if(store==='shopee') return 'badge-shopee';
  return 'badge-tiktok';
}

function cardHTML(p){
  const off = discount(p);
  const img = p.image || 'https://placehold.co/600x600?text='+encodeURIComponent(p.title.slice(0,20));
  const parcel = p.price >= 100 ? `<span class="parcel">12x de ${brl(p.price/12)} sem juros</span>` : '';
  return `<article class="card">
    <div class="card-img" data-open="${p.id}">
      <img src="${img}" alt="${p.title}" loading="lazy" onerror="this.src='https://placehold.co/600x600?text=Oferta'">
      <span class="badge-store ${badgeClass(p.store)}">${STORE_LABEL[p.store]||p.store}</span>
      ${off?`<span class="badge-off">${off}% OFF</span>`:''}
    </div>
    <div class="card-body">
      ${p.featured?'<span class="tag-hot">MAIS VENDIDO</span>':''}
      <span class="cat">${p.category||''}</span>
      <h3>${p.title}</h3>
      <div class="price-block">
        <span class="price">${brl(p.price)}</span>
        ${p.oldprice?`<div class="old-line"><s class="price-old">${brl(p.oldprice)}</s><span class="off-green">${off}% OFF</span></div>`:''}
        <span class="frete">🚚 Frete grátis</span>
        ${parcel}
      </div>
      <div class="card-actions">
        <a class="btn btn-shop card-cta" href="${p.link}" target="_blank" rel="nofollow sponsored noopener" data-buy="${p.id}">Ver oferta</a>
        <button class="btn btn-ghost card-eye" data-open="${p.id}" title="Ver detalhes">👁️</button>
      </div>
      <div class="share-row">
        <button data-share="wpp" data-id="${p.id}" title="WhatsApp">💬 WhatsApp</button>
        <button data-share="face" data-id="${p.id}" title="Facebook">📘 Facebook</button>
        <button data-share="copy" data-id="${p.id}" title="Copiar link">🔗</button>
      </div>
    </div>
  </article>`;
}

function filtered(){
  const q = (document.getElementById('search').value||'').toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;
  let list = allProducts.filter(p=>{
    const okStore = activeStore==='todos' || p.store===activeStore;
    const okCat = cat==='todos' || p.category===cat;
    const okQ = !q || (p.title+' '+(p.desc||'')+' '+(p.category||'')).toLowerCase().includes(q);
    return okStore && okCat && okQ;
  });
  if(sort==='menor') list.sort((a,b)=>a.price-b.price);
  if(sort==='maior') list.sort((a,b)=>b.price-a.price);
  if(sort==='desconto') list.sort((a,b)=>discount(b)-discount(a));
  if(sort==='destaque') list.sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));
  return list;
}

function render(){
  const list = filtered();
  const feat = allProducts.filter(p=>p.featured).slice(0,4);
  document.getElementById('featuredGrid').innerHTML = feat.length? feat.map(cardHTML).join('') : '<p>Sem destaques. Marque ⭐ no admin.</p>';
  document.getElementById('grid').innerHTML = list.map(cardHTML).join('');
  document.getElementById('empty').classList.toggle('hidden', list.length>0);
  document.getElementById('count').textContent = `(${list.length})`;
}

function fillCategories(){
  const cats = [...new Set(allProducts.map(p=>p.category).filter(Boolean))];
  const sel = document.getElementById('categoryFilter');
  sel.innerHTML = '<option value="todos">Todas categorias</option>'+cats.map(c=>`<option>${c}</option>`).join('');
}

function openModal(id){
  const p = allProducts.find(x=>x.id===id);
  if(!p) return;
  const cfg = getConfig();
  const cap = captionFor(p,cfg);
  const img = p.image || 'https://placehold.co/600x600?text=Oferta';
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-grid">
      <img src="${img}" onerror="this.src='https://placehold.co/600x600?text=Oferta'">
      <div>
        <span class="badge-store ${badgeClass(p.store)}">${STORE_LABEL[p.store]}</span>
        <h2>${p.title}</h2>
        <p>${p.desc||''}</p>
        <p><span class="price-old">${p.oldprice?brl(p.oldprice):''}</span><br><strong class="price">${brl(p.price)}</strong></p>
        <a class="btn btn-shop" style="width:100%;text-align:center" target="_blank" rel="nofollow sponsored noopener" href="${p.link}" data-buy="${p.id}">🛒 Ver Oferta no ${STORE_LABEL[p.store]}</a>
        <div class="share-kit">
          <strong>📣 Kit compartilhar (Face / Grupos / Reels)</strong>
          <textarea id="capText" readonly>${cap}</textarea>
          <div class="kit-btns">
            <button class="btn btn-primary" id="kCopy">📋 Copiar legenda</button>
            <a class="btn" target="_blank" href="${faceShareUrl(p.link, p.title+' '+brl(p.price))}">📘 Feed/Grupo</a>
            <a class="btn" target="_blank" href="${wppShareUrl(cap)}">💬 WhatsApp</a>
          </div>
          <small>Reels: copie a legenda, poste o vídeo com a foto do produto e coloque o link nos stories/bio.</small>
        </div>
      </div>
    </div>`;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('kCopy').onclick = ()=>{
    navigator.clipboard.writeText(cap).then(()=>alert('Legenda copiada! Pronta para Feed, Grupo e Reels.'));
  };
}

document.addEventListener('click', e=>{
  const open = e.target.closest('[data-open]');
  if(open){ openModal(open.dataset.open); return; }
  const buy = e.target.closest('[data-buy]');
  if(buy){ trackClick(buy.dataset.buy); return; }
  const sh = e.target.closest('[data-share]');
  if(sh){
    const p = allProducts.find(x=>x.id===sh.dataset.id);
    if(!p) return;
    const cfg = getConfig();
    const cap = captionFor(p,cfg);
    if(sh.dataset.share==='copy'){ navigator.clipboard.writeText(p.link).then(()=>alert('Link de afiliado copiado!')); }
    if(sh.dataset.share==='wpp'){ window.open(wppShareUrl(cap),'_blank'); trackClick(p.id); }
    if(sh.dataset.share==='face'){ window.open(faceShareUrl(p.link, p.title),'_blank'); trackClick(p.id); }
  }
  if(e.target.id==='modalClose' || e.target.id==='modal') document.getElementById('modal').classList.add('hidden');
});

document.getElementById('search').addEventListener('input', render);
document.getElementById('categoryFilter').addEventListener('change', render);
document.getElementById('sortFilter').addEventListener('change', render);
document.querySelectorAll('#storeFilter button').forEach(b=>{
  b.onclick = ()=>{
    document.querySelectorAll('#storeFilter button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    activeStore = b.dataset.store;
    render();
  };
});

allProducts = getProducts();
applyConfig();
fillCategories();
render();

// Sincroniza com o banco (produtos publicados pelo admin aparecem para todos)
fetchProducts().then(list=>{
  allProducts = list;
  fillCategories();
  render();
});

// Contador do banner (estilo "oferta do dia" do Mercado Livre)
function tickBannerTimer(){
  const el = document.getElementById('pbTimer');
  if(!el) return;
  const now = new Date();
  const end = new Date(now); end.setHours(23,59,59,999);
  let s = Math.max(0, Math.floor((end - now)/1000));
  const h = String(Math.floor(s/3600)).padStart(2,'0');
  const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  el.textContent = `⏳ Termina em ${h}:${m}:${ss}`;
}
tickBannerTimer();
setInterval(tickBannerTimer, 1000);
