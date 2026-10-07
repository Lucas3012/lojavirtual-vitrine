// Camada de dados compartilhada - Supabase (produtos visiveis para todos) + cache local
const DB = {
  products: 'loja_products_v1',
  config: 'loja_config_v1',
  auth: 'loja_admin_auth_v1',
  clicks: 'loja_clicks_v1'
};

// Conexao Supabase (chave publica/segura para o front)
const SUPA_URL = 'https://icchspesfqmeakbajlfh.supabase.co';
const SUPA_KEY = 'sb_publishable_f6m6zg_Lu0ZsFlZNPngfDw_gATzwmz2';

const STORE_LABEL = {
  mercadolivre: 'Mercado Livre',
  shopee: 'Shopee',
  tiktok: 'TikTok Shop'
};

// Ícones oficiais (SVG) usados em toda a loja
const ICON = {
  wa: '<svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true"><path fill="#25D366" d="M16 3C9.4 3 4 8.4 4 15c0 2.3.7 4.5 1.9 6.4L4 29l7.8-2c1.8 1 3.9 1.5 6 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.6 1.2 1.2-4.5-.3-.4C5.5 18.8 5 16.9 5 15 5 8.9 9.9 4 16 4s11 4.9 11 11-4.9 11-11 11zm6.1-8.2c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.8.6.7.2 1.4.2 1.9.1.6-.1 2-.8 2.2-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.5z"/></svg>',
  fb: '<svg viewBox="0 0 32 32" width="16" height="16" aria-hidden="true"><path fill="#1877F2" d="M16 3C8.8 3 3 8.8 3 16c0 6.5 4.7 11.9 10.9 12.9v-9.1h-3V16h3v-2.6c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V16h3.3l-.5 3.8h-2.8v9.1C24.3 27.9 29 22.5 29 16c0-7.2-5.8-13-13-13z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="#E1306C" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.2" fill="#E1306C" stroke="none"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
};

function defaultProducts(){
  return [
    {
      id: 'p1',
      title: 'Fone Bluetooth TWS Pro 2 com Case de Carga',
      category: 'Eletrônicos',
      store: 'shopee',
      link: 'https://shopee.com.br/SEU-LINK-DE-AFILIADO-AQUI',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80&auto=format&fit=crop',
      price: 59.90, oldprice: 129.90, featured: true,
      desc: 'Fone sem fio com bluetooth 5.3, case de carga rápida e microfone. O queridinho dos achadinhos!'
    },
    {
      id: 'p2',
      title: 'Air Fryer 5L Digital Mondial 1900W',
      category: 'Casa',
      store: 'mercadolivre',
      link: 'https://mercadolivre.com.br/SEU-LINK-DE-AFILIADO-AQUI',
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&q=80&auto=format&fit=crop',
      price: 389.00, oldprice: 599.00, featured: true,
      desc: 'Air fryer gigante 5L, antiaderente, timer digital. Perfeita para família!'
    },
    {
      id: 'p3',
      title: 'Kit Skincare Vitamina C + Sérum Facial',
      category: 'Beleza',
      store: 'tiktok',
      link: 'https://shop.tiktok.com/SEU-LINK-DE-AFILIADO-AQUI',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&auto=format&fit=crop',
      price: 39.90, oldprice: 89.90, featured: true,
      desc: 'Kit viral do TikTok! Pele glow em 7 dias. Estoque limitado.'
    },
    {
      id: 'p4',
      title: 'Relógio Smartwatch Fit Pro com Monitor Cardíaco',
      category: 'Eletrônicos',
      store: 'shopee',
      link: 'https://shopee.com.br/SEU-LINK-DE-AFILIADO-AQUI-2',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80&auto=format&fit=crop',
      price: 89.90, oldprice: 199.90, featured: false,
      desc: 'Smartwatch com tela HD, monitor de sono, passos e coração. Bateria 7 dias.'
    },
    {
      id: 'p5',
      title: 'Aspirador Robô Varre e Passa Pano',
      category: 'Casa',
      store: 'mercadolivre',
      link: 'https://mercadolivre.com.br/SEU-LINK-DE-AFILIADO-AQUI-2',
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80&auto=format&fit=crop',
      price: 499.00, oldprice: 899.00, featured: false,
      desc: 'Aspira e passa pano sozinho, volta pra base. Casa limpa sem esforço!'
    },
    {
      id: 'p6',
      title: 'Secador Profissional 2200W com Difusor',
      category: 'Beleza',
      store: 'tiktok',
      link: 'https://shop.tiktok.com/SEU-LINK-DE-AFILIADO-AQUI-2',
      image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80&auto=format&fit=crop',
      price: 119.90, oldprice: 249.90, featured: false,
      desc: 'Secador salão em casa, 3 temperaturas, não danifica o cabelo.'
    }
  ];
}

function defaultConfig(){
  return {
    name: 'Achadinhos & Ofertas',
    hero: 'Os melhores achadinhos em um só lugar 🔥',
    sub: 'Mercado Livre • Shopee • TikTok Shop — links verificados, preço baixo todo dia.',
    facebook: 'https://facebook.com/suapagina',
    instagram: 'https://instagram.com/suapagina',
    whatsapp: '',
    groups: '',
    user: 'admin',
    pass: 'admin123'
  };
}

/* ---------- cache local (fallback offline) ---------- */
function getProducts(){
  try{
    const raw = localStorage.getItem(DB.products);
    if(!raw) return defaultProducts();
    return JSON.parse(raw);
  }catch(e){ return defaultProducts(); }
}
function saveProducts(list){ localStorage.setItem(DB.products, JSON.stringify(list)); }
function getConfig(){
  try{
    const raw = localStorage.getItem(DB.config);
    if(!raw){ const d=defaultConfig(); localStorage.setItem(DB.config, JSON.stringify(d)); return d; }
    return {...defaultConfig(), ...JSON.parse(raw)};
  }catch(e){ return defaultConfig(); }
}
function saveConfig(c){ localStorage.setItem(DB.config, JSON.stringify(c)); }

/* ---------- Supabase (produtos compartilhados) ---------- */
async function supaRequest(path, opts){
  const res = await fetch(SUPA_URL + '/rest/v1/' + path, {
    method: (opts && opts.method) || 'GET',
    headers: {
      apikey: SUPA_KEY,
      Authorization: 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json',
      ...(opts && opts.headers ? opts.headers : {})
    },
    body: opts && opts.body ? JSON.stringify(opts.body) : undefined
  });
  if(!res.ok) throw new Error('supabase ' + res.status);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

function rowToProduct(r){
  return {
    id: r.id,
    title: r.title,
    category: r.category || 'Geral',
    store: r.store || 'mercadolivre',
    link: r.link || '',
    image: r.image || '',
    price: Number(r.price) || 0,
    oldprice: Number(r.oldprice) || 0,
    featured: !!r.featured,
    desc: r.desc || ''
  };
}
function productToRow(p){
  return {
    id: p.id,
    title: p.title,
    category: p.category || 'Geral',
    store: p.store || 'mercadolivre',
    link: p.link || '',
    image: p.image || '',
    price: Number(p.price) || 0,
    oldprice: Number(p.oldprice) || 0,
    featured: !!p.featured,
    desc: p.desc || ''
  };
}

// Baixa produtos do banco (todos os visitantes veem). Em caso de falha, usa cache local.
async function fetchProducts(){
  try{
    const rows = await supaRequest('products?select=*');
    const list = (rows || []).map(rowToProduct);
    saveProducts(list);
    return list;
  }catch(e){
    return getProducts();
  }
}

// Salva/atualiza um produto no banco (upsert)
async function pushProduct(p){
  try{
    await supaRequest('products', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: productToRow(p)
    });
    return true;
  }catch(e){ return false; }
}

// Remove do banco
async function deleteProductRemote(id){
  try{
    await supaRequest('products?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    return true;
  }catch(e){ return false; }
}

// Restaura os exemplos no banco
async function restoreDefaultsRemote(){
  const list = defaultProducts();
  for(const p of list){ await pushProduct(p); }
  saveProducts(list);
  return list;
}

/* ---------- utilidades ---------- */
function trackClick(id){
  try{
    const c = JSON.parse(localStorage.getItem(DB.clicks)||'{}');
    c[id]=(c[id]||0)+1;
    localStorage.setItem(DB.clicks, JSON.stringify(c));
  }catch(e){}
}
function getClicks(){ try{return JSON.parse(localStorage.getItem(DB.clicks)||'{}')}catch(e){return{}} }

function discount(p){
  if(!p.oldprice || p.oldprice<=p.price) return 0;
  return Math.round((1-p.price/p.oldprice)*100);
}
function brl(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

function captionFor(p, cfg){
  return `🔥 ACHADINHO IMPERDÍVEL 🔥\n\n✅ ${p.title}\n💰 De ${brl(p.oldprice)} por APENAS ${brl(p.price)} (${discount(p)}% OFF)\n🏬 Loja: ${STORE_LABEL[p.store]||p.store}\n\n👉 Compre aqui: ${p.link}\n\n⚠️ Promoção por tempo limitado, estoque pode acabar!\n\n📲 Siga ${cfg.name} para mais ofertas todos os dias!\n${cfg.facebook}\n\n#achadinhos #ofertas #promocao #${(p.store||'oferta')} #desconto #viral`;
}

function faceShareUrl(link, quote){
  return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(link)+'&quote='+encodeURIComponent(quote||'');
}
function wppShareUrl(text){ return 'https://wa.me/?text='+encodeURIComponent(text); }
