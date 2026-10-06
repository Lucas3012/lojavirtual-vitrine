# 🛍️ Achadinhos & Ofertas — Loja Virtual + Admin

Vitrine para clientes + painel admin para publicar links de afiliado do **Mercado Livre, Shopee e TikTok Shop**, com kit de compartilhamento para **Facebook (feed + grupos) e Reels**.

## Como usar (sem instalar nada)

1. Abra a pasta `projeto_lojavirtual`
2. Dê duplo clique em `index.html` → é a **vitrine dos clientes**
3. Abra `admin.html` → é o **painel admin**
   - Usuário: `admin`
   - Senha: `admin123` (troque em Configurações)

> Funciona 100% offline com `localStorage`. Não precisa de servidor nem banco.

## Fluxo de trabalho

1. No admin, aba **Novo** → cole título, preço, categoria, loja e **seu link de afiliado**.
2. Marque ⭐ para ir aos Destaques.
3. Vá em **Divulgar** → escolha o produto → **Copiar legenda** → poste:
   - **Feed da página:** botão `Postar no Facebook`
   - **Grupos:** abra cada grupo (lista em Configurações) e cole a legenda + link
   - **Reels:** use a foto do produto no vídeo, cole a legenda. Link vai nos stories/bio (Reels não permite link clicável na legenda).
   - **WhatsApp:** botão enviar.

## Publicar na internet (grátis)

- Arraste esta pasta para **netlify.com/drop** ou suba no **Vercel**.
- Você ganha um link tipo `https://sualoja.netlify.app` para colocar na bio, nos grupos e nos Reels.

## Estrutura

- `index.html` — vitrine
- `admin.html` — login + painel
- `css/` — estilos
- `js/store.js` — dados, links, legenda pronta
- `js/vitrine.js` — busca, filtros, modal, compartilhar
- `js/admin.js` — CRUD, config, backup
