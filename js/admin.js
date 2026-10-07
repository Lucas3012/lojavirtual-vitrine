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

showApp(isLogged());
