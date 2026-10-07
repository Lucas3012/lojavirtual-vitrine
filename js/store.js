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
