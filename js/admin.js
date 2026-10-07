// Admin
const $ = id => document.getElementById(id);
let editingId = null;

function isLogged(){ return localStorage.getItem('loja_admin_auth_v1')==='1'; }
function showApp(logged){
  $('loginScreen').classList.toggle('hidden', logged);
  $('adminApp').classList.toggle('hidden', !logged);
  if(logged) fetchProducts().then(()=>refreshAll());
}

$('btnLogin').onclick = ()=>{
  const cfg = getConfig();
  if($('loginUser').value.trim()===cfg.user && $('loginPass').value===cfg.pass){
    localStorage.setItem('loja_admin_auth_v1','1');
    $('loginError').textContent='';
    showApp(true);
  } else $('loginError').textContent='Usuário ou senha incorretos.';
};
$('btnLogout').onclick = ()=>{ localStorage.removeItem('loja_admin_auth_v1'); showApp(false); };

document.querySelectorAll('.admin-menu button').forEach(b=>{
  b.onclick = ()=>{
    document.querySelectorAll('.admin-menu button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.tab').forEach(t=>t.classList.add('hidden'));
    $('tab-'+b.dataset.tab).classList.remove('hidden');
  };
});

function refreshAll(){
  const list = getProducts();
  const cfg = getConfig();
  $('totalP').textContent = list.length;
  // tabela
  const q = ($('adminSearch').value||'').toLowerCase();
  const clicks = getClicks();
  const rows = list.filter(p=>!q || p.title.toLowerCase().includes(q));
  $('productTable').innerHTML = rows.map(p=>`
    <div class="prod-row">
      <img src="${p.image||'https://placehold.co/100x100?text=?'}" onerror="this.src='https://placehold.co/100x100?text=?'">
      <div>
        <strong>${p.title}</strong><br>
        <small>${STORE_LABEL[p.store]} • ${p.category} • <b>${brl(p.price)}</b> • cliques: ${clicks[p.id]||0} ${p.featured?'• ⭐':''}</small><br>
        <small style="color:#666">${p.link.slice(0,60)}...</small>
      </div>
      <div class="actions">
        <button class="btn" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn" onclick="toggleFeat('${p.id}')">⭐</button>
        <button class="btn" onclick="shareGo('${p.id}')">📣</button>
        <button class="btn" onclick="delProduct('${p.id}')">🗑️</button>
      </div>
    </div>`).join('') || '<p>Nenhum produto.</p>';
  // share select
  $('shareSelect').innerHTML = list.map(p=>`<option value="${p.id}">${p.title}</option>`).join('');
  updateSharePreview();
  // config
  $('c_name').value = cfg.name; $('c_hero').value = cfg.hero;
  $('c_facebook').value = cfg.facebook||''; $('c_instagram').value = cfg.instagram||'';
  $('c_whatsapp').value = cfg.whatsapp||''; $('c_groups').value = cfg.groups||'';
  $('c_user').value = cfg.user||'admin';
  $('catList').innerHTML = [...new Set(list.map(p=>p.category))].map(c=>`<option value="${c}">`).join('');
  buildMarketing();
}

window.editProduct = (id)=>{
  const p = getProducts().find(x=>x.id===id);
  if(!p) return;
  editingId = id;
  $('formTitle').textContent = 'Editar produto';
  $('f_id').value=id; $('f_title').value=p.title; $('f_category').value=p.category;
  $('f_store').value=p.store; $('f_link').value=p.link; $('f_image').value=p.image||'';
  $('f_price').value=p.price; $('f_oldprice').value=p.oldprice||'';
  $('f_featured').checked=!!p.featured; $('f_desc').value=p.desc||'';
  document.querySelector('[data-tab="novo"]').click();
  window.scrollTo(0,0);
};
window.delProduct = (id)=>{
  if(!confirm('Excluir este produto?')) return;
  saveProducts(getProducts().filter(p=>p.id!==id));
  deleteProductRemote(id);
  refreshAll();
};
window.toggleFeat = (id)=>{
  const list = getProducts();
  const p = list.find(x=>x.id===id);
  p.featured=!p.featured;
  saveProducts(list);
  pushProduct(p);
  refreshAll();
};
window.shareGo = (id)=>{
  document.querySelector('[data-tab="divulgar"]').click();
  document.querySelectorAll('.admin-menu button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='divulgar'));
  $('shareSelect').value=id;
  updateSharePreview();
};

$('adminSearch').addEventListener('input', refreshAll);

$('productForm').onsubmit = (e)=>{
  e.preventDefault();
  const list = getProducts();
  const data = {
    id: editingId || 'p'+Date.now(),
    title: $('f_title').value.trim(),
    category: $('f_category').value.trim()||'Geral',
    store: $('f_store').value,
    link: $('f_link').value.trim(),
    image: $('f_image').value.trim(),
    price: parseFloat($('f_price').value)||0,
    oldprice: parseFloat($('f_oldprice').value)||0,
    featured: $('f_featured').checked,
    desc: $('f_desc').value.trim()
  };
  if(!data.title || !data.link || !data.price){ alert('Preencha título, link e preço.'); return; }
  if(editingId){
    const i = list.findIndex(p=>p.id===editingId);
    list[i]=data;
  } else list.unshift(data);
  saveProducts(list);
  pushProduct(data).then(ok=>{ if(!ok) alert('⚠️ Produto salvo localmente, mas falhou ao publicar no banco (sem internet?). Ele aparece para você. Tente salvar de novo.'); });
  editingId=null;
  e.target.reset();
  $('formTitle').textContent='Cadastrar oferta com link de afiliado';
  alert('✅ Produto salvo! Já aparece na vitrine.');
  document.querySelector('[data-tab="produtos"]').click();
  document.querySelectorAll('.admin-menu button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='produtos'));
  refreshAll();
};
$('btnCancelEdit').onclick = ()=>{ editingId=null; $('productForm').reset(); $('formTitle').textContent='Cadastrar oferta com link de afiliado'; };

$('btnSaveConfig').onclick = ()=>{
  const cfg = getConfig();
  cfg.name=$('c_name').value; cfg.hero=$('c_hero').value;
  cfg.facebook=$('c_facebook').value; cfg.instagram=$('c_instagram').value;
  cfg.whatsapp=$('c_whatsapp').value; cfg.groups=$('c_groups').value;
  cfg.user=$('c_user').value||'admin';
  if($('c_pass').value) cfg.pass=$('c_pass').value;
  saveConfig(cfg);
  alert('Configurações salvas!');
};

$('btnExport').onclick = ()=>{
  const blob = new Blob([JSON.stringify({products:getProducts(),config:getConfig()},null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='backup-loja.json'; a.click();
};
$('btnSeed').onclick = ()=>{ if(confirm('Restaurar produtos de exemplo?')){ restoreDefaultsRemote().then(()=>{ refreshAll(); alert('Exemplos restaurados!'); }); } };
$('importFile').addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{ try{
    const d = JSON.parse(r.result);
    if(d.products) saveProducts(d.products);
    if(d.config) saveConfig({...getConfig(),...d.config});
    refreshAll(); alert('Backup importado!');
  }catch(err){ alert('Arquivo inválido'); } };
  r.readAsText(f);
});

function updateSharePreview(){
  const id = $('shareSelect').value;
  const p = getProducts().find(x=>x.id===id);
  if(!p){ $('sharePreview').textContent='Cadastre um produto primeiro.'; return; }
  $('sharePreview').textContent = captionFor(p, getConfig());
}
$('shareSelect').addEventListener('change', updateSharePreview);
$('btnCopyCaption').onclick = ()=>{ navigator.clipboard.writeText($('sharePreview').textContent).then(()=>alert('Legenda copiada! Cole no Feed, Grupo ou Reels.')); };
$('btnCopyLink').onclick = ()=>{
  const p = getProducts().find(x=>x.id===$('shareSelect').value);
  navigator.clipboard.writeText(p.link).then(()=>alert('Link copiado!'));
};
$('btnShareFace').onclick = ()=>{
  const p = getProducts().find(x=>x.id===$('shareSelect').value);
  window.open(faceShareUrl(p.link, p.title),'_blank');
  const cfg = getConfig();
  if(cfg.groups) alert('Dica: você tem grupos cadastrados em Configurações. Abra cada um e cole a legenda lá também para vender mais!');
};
$('btnShareWpp').onclick = ()=>{ window.open(wppShareUrl($('sharePreview').textContent),'_blank'); };

/* ---------- Kit de anúncios (Google / Meta / Posts) ---------- */
function utmLink(src, medium){
  const u = new URL('index.html', location.href);
  u.search = '?utm_source=' + src + '&utm_medium=' + medium + '&utm_campaign=achadinhos_ofertas';
  return u.toString();
}

function buildMarketing(){
  const list = getProducts();
  const cfg = getConfig();
  const kitG = document.getElementById('kitGoogle');
  if(!list.length || !kitG) return;

  const barato = list.reduce((a,b)=> (b.price < a.price ? b : a), list[0]);
  const destaque = list.find(p=>p.featured) || list[0];
  const comDesconto = list.find(p=>discount(p) > 0) || destaque;
  const top = list.slice(0, 3);
  const urlG = utmLink('google', 'cpc');
  const urlF = utmLink('facebook', 'paid_social');
  const urlI = utmLink('instagram', 'social');
  const barra = '='.repeat(58);

  /* ----- GOOGLE ADS ----- */
  const palavras = ['air fryer barata','air fryer em oferta','air fryer comprar','fone bluetooth barato','fone tws com desconto','headphone com desconto','ofertas do dia','ofertas do mercadolivre','ofertas da shopee','promoção hoje online','cupom de desconto hoje','site de achadinhos','achados e achadinhos','melhores ofertas online','frete gratis brasil','comprar barato pela internet'];
  const negativas = ['gratis','usado','vender','vaga','emprego','tabela','manual','como fazer','segunda mao','reclamacao','cortesia'];
  const titulos = ['Achadinhos e Ofertas do Dia','Air Fryer a partir de R$419','Fone Bluetooth a R$35,90','Frete Gratis nas Ofertas','So Hoje: Desconto Imperdivel','Ofertas Mercado Livre','Ofertas da Shopee Agora','Ate 12x sem Juros','Preco Baixo Todo Dia','Links Verificados','Economize ate 30% Hoje','Entrega pra Todo Brasil','Confira as Ofertas Agora','Vitrine com ' + list.length + ' Ofertas','Compre pelo Celular Ja'];
  const descricoes = ['Air Fryer, fone e headphone com frete gratis. Ofertas atualizadas todo dia na vitrine.','Melhores promocoes do Mercado Livre e da Shopee em um so lugar. Clique e confira ja!','Ate 12x sem juros e entrega pra todo o Brasil. Estoque limitado nas ofertas do dia.','Ate 30% OFF em air fryer e fones. Preco baixo de verdade, so hoje. Clique agora!'];

  const g = [];
  g.push('CAMPANHA GOOGLE ADS - ' + cfg.name + ' | Rede de Pesquisa');
  g.push(barra);
  g.push('');
  g.push('1) CONFIGURACAO DA CAMPANHA');
  g.push('  Objetivo......: Trafego do site');
  g.push('  Tipo..........: Rede de Pesquisa (+ Display opcional)');
  g.push('  Pais / Idioma.: Brasil / Portugues');
  g.push('  URL final.....: ' + urlG);
  g.push('  Orcamento.....: R$ 15 a 20 por dia (comece com R$ 15)');
  g.push('  Lance.........: Maximizar cliques');
  g.push('  Cronograma....: Sempre ativa (24h)');
  g.push('');
  g.push('2) PALAVRAS-CHAVE (correspondencia de frase - cole uma por linha)');
  palavras.forEach(k => g.push('  "' + k + '"'));
  g.push('');
  g.push('3) PALAVRAS-CHAVE NEGATIVAS');
  g.push('  ' + negativas.join(', '));
  g.push('');
  g.push('4) ANUNCIO DE PESQUISA RESPONSIVO');
  g.push('  TITULOS (max 30 caracteres):');
  titulos.forEach(t => g.push('    ' + t + '   [' + t.length + ']'));
  g.push('');
  g.push('  DESCRICOES (max 90 caracteres):');
  descricoes.forEach(d => g.push('    ' + d + '   [' + d.length + ']'));
  g.push('');
  g.push('5) EXTENSOES (anexos)');
  g.push('  Link do site (4): "Ofertas do dia" | "Air Fryers" | "Fones e Headphones" | "Mercado Livre"');
  g.push('     -> todas apontando para: ' + urlG);
  g.push('  Chamada........: Frete gratis | Ate 12x sem juros | Confira ja');
  g.push('  Preco..........: A partir de ' + brl(barato.price));
  g.push('');
  g.push('6) METAS');
  g.push('  Conversao......: clique no botao "Ver oferta" da vitrine');
  g.push('  Meta diaria....: 5 a 10 cliques por dia');
  g.push('  Ajuste.........: apos 7 dias, desligue as palavras-chave que nao vendem');
  kitG.textContent = g.join('\n');

  /* ----- META ADS ----- */
  const listaTop = top.map(p => '  - ' + p.title + ' - ' + brl(p.price) + '\n    ' + p.link).join('\n');
  const m = [];
  m.push('ANUNCIOS META (Facebook + Instagram) - Gerenciador de Anuncios');
  m.push(barra);
  m.push('');
  m.push('1) CONFIGURACAO');
  m.push('  Objetivo......: Trafego (cliques no link)');
  m.push('  Link..........: ' + urlF);
  m.push('  Botao (CTA)...: Comprar agora');
  m.push('  Orcamento.....: R$ 20/dia, otimizacao = cliques no link');
  m.push('  Publico.......: Brasil, 21 a 55 anos, Portugues');
  m.push('  Interesses....: Compras online, Mercado Livre, Shopee, Cupom de desconto,');
  m.push('                  E-commerce, Promocao, Ofertas do dia');
  m.push('  Colocacoes....: Feed + Reels + Stories (Advantage+)');
  m.push('');
  m.push('2) VARIA A - MAIS VENDIDOS (prova social)');
  m.push('  TEXTO PRINCIPAL:');
  m.push('  Achados que estao vendendo demais hoje:\n');
  top.forEach(p => m.push('  * ' + p.title + ' - ' + brl(p.price)));
  m.push('');
  m.push('  Frete gratis e ate 12x sem juros. Compra 100% segura pelo ' + STORE_LABEL[top[0].store] + ' e demais lojas da vitrine.');
  m.push('  Confira antes que acabe: ' + urlF);
  m.push('  TITULO......: Ver ofertas do dia');
  m.push('  DESCRICAO...: Frete gratis | Ate 12x sem juros');
  m.push('');
  m.push('3) VARIA B - DESTAQUE COM DESCONTO');
  m.push('  TEXTO PRINCIPAL:');
  m.push('  ' + comDesconto.title);
  m.push('  De ' + brl(comDesconto.oldprice) + ' por ' + brl(comDesconto.price) + ' (' + discount(comDesconto) + '% OFF) - so enquanto durar o estoque.');
  m.push('');
  m.push('  Compre direto pelo link (funciona no celular e no PC):');
  m.push('  ' + comDesconto.link);
  m.push('  Vitrine completa com ' + list.length + ' ofertas: ' + urlF);
  m.push('  TITULO......: ' + comDesconto.title.slice(0, 40));
  m.push('  DESCRICAO...: ' + brl(comDesconto.price) + ' | Frete gratis');
  m.push('');
  m.push('4) VARIA C - MENOR PRECO (conversao rapida)');
  m.push('  TEXTO PRINCIPAL:');
  m.push('  Achei um achadinho de ' + brl(barato.price) + ' e nao podia nao compartilhar:\n');
  m.push('  ' + barato.title);
  m.push('  ' + barato.desc);
  m.push('');
  m.push('  Link direto: ' + barato.link);
  m.push('  ' + urlI);
  m.push('  TITULO......: A partir de ' + brl(barato.price));
  m.push('  DESCRICAO...: Estoque limitado | Frete gratis');
  m.push('');
  m.push('5) GESTAO');
  m.push('  Deixe os 3 rodando 7 dias com a mesma verba. Depois desligue os 2 piores');
  m.push('  e multiplique por 2 a verba do vencedor.');
  kitMeta.textContent = m.join('\n');

  /* ----- POSTS ORGANICOS ----- */
  const p = [];
  p.push('POSTS PRONTOS - Feed, Grupos, Reels e TikTok');
  p.push(barra);
  p.push('');
  p.push('1) FEED DO FACEBOOK / INSTAGRAM (carrossel com as ' + top.length + ' fotos)');
  p.push('  ---------------------------------------------------------');
  p.push('  ' + cfg.name + ' abriu a vitrine e tem ' + list.length + ' ofertas imperdiveis hoje:\n');
  top.forEach(x => p.push('  ' + x.title + '\n  ' + brl(x.price) + ' - ' + x.link + '\n'));
  p.push('  Frete gratis, ate 12x sem juros e compra garantida pelo Mercado Livre e Shopee.');
  p.push('  Toda a vitrine: ' + urlF);
  p.push('  Salva esse post, porque as ofertas trocam todo dia.');
  p.push('  #achadinhos #ofertas #promocao #desconto #airfryer #fonebluetooth #ofertasdodia');
  p.push('  ---------------------------------------------------------');
  p.push('');
  p.push('2) GRUPOS DO FACEBOOK (mensagem curta - poste 1x por grupo por dia)');
  p.push('  Pessoal, achei ' + barato.title.toLowerCase() + ' por ' + brl(barato.price) + ' com frete gratis:');
  p.push('  ' + barato.link);
  p.push('  Tem Air Fryer, headphone e mais ' + list.length + ' ofertas aqui: ' + urlF);
  p.push('  Alguem pegou? Comenta ai que eu te ajudo a escolher.');
  p.push('');
  p.push('3) REELS / TIKTOK - ROTEIRO15s');
  p.push('  0-3s  : "Para de rolar, olha o preco disso" (mostra a tela da vitrine)');
  p.push('  3-8s  : mostra ' + destaque.title + ' por ' + brl(destaque.price));
  p.push('  8-12s : mostra ' + barato.title + ' por ' + brl(barato.price));
  p.push('  12-15s: "Link na bio / na descricao, corre que acaba"');
  p.push('  LEGENDA: ' + cfg.name + ' - ' + destaque.title + ' por ' + brl(destaque.price) + '. Link na bio!');
  p.push('  HASHTAGS: #achadinhos #ofertas #achado #promocao #fyp #airfryer #fone #barato');
  p.push('');
  p.push('4) WHATSAPP (grupos e status)');
  p.push('  ' + captionFor(barato, cfg).replace(/\n{3,}/g, '\n\n'));
  kitPosts.textContent = p.join('\n');
}

function copiarKit(id, msg){
  const txt = document.getElementById(id).textContent;
  navigator.clipboard.writeText(txt).then(() => alert(msg)).catch(() => alert('Selecione o texto e pressione Ctrl+C'));
}
document.getElementById('btnCopyG').onclick = () => copiarKit('kitGoogle', 'Campanha do Google copiada! Cole no Google Ads.');
document.getElementById('btnCopyM').onclick = () => copiarKit('kitMeta', 'Anúncios Meta copiados! Cole no Gerenciador de Anúncios.');
document.getElementById('btnCopyP').onclick = () => copiarKit('kitPosts', 'Posts copiados! Cole no Feed, Grupos, Reels e TikTok.');

showApp(isLogged());
