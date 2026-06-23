// Categorias padrão exibidas no cardápio (na ordem desejada)
const CATEGORIAS_PADRAO = [
  { slug: 'combos',   nome: 'Combos',   emoji: '🛍️' },
  { slug: 'cookies',  nome: 'Cookies',  emoji: '🍪' },
  { slug: 'brownies', nome: 'Brownies', emoji: '🍫' },
  { slug: 'copos',    nome: 'Copos',    emoji: '🥤' },
  { slug: 'bolos',    nome: 'Bolos',    emoji: '🎂' },
  { slug: 'kits',     nome: 'Kits',     emoji: '🎁' },
];

const CHAVE_CATEGORIAS = 'flabelli_categorias';

function obterCategorias() {
  try {
    const salvo = localStorage.getItem(CHAVE_CATEGORIAS);
    return salvo ? JSON.parse(salvo) : CATEGORIAS_PADRAO;
  } catch {
    return CATEGORIAS_PADRAO;
  }
}

function obterEmojiCategoria(slug) {
  const cat = obterCategorias().find((c) => c.slug === slug);
  return cat ? cat.emoji : '🔍';
}

// Cores padrão por categoria (usadas quando o produto não define uma)
const CORES_CATEGORIA = {
  combos:   'cor-rosa',
  cookies:  'cor-amarelo',
  brownies: 'cor-laranja',
  copos:    'cor-menta',
  bolos:    'cor-amarelo',
  kits:     'cor-menta',
  tortas:   'cor-menta',
  doces:    'cor-rosa',
  salgados: 'cor-laranja',
};

const EMOJI_CATEGORIA = {
  combos:   '🛍️',
  cookies:  '🍪',
  brownies: '🍫',
  copos:    '🥤',
  bolos:    '🎂',
  kits:     '🎁',
  tortas:   '🥧',
  doces:    '🍬',
  salgados: '🥟',
};

// Cardápio padrão exibido quando o Supabase não está configurado
const PRODUTOS_PADRAO = [
  { nome: 'Copo Ferrero', descricao: 'Copo especial de chocolate com Ferrero Rocher.', preco: 29.90, categoria: 'copos', emoji: '🥤' },
  { nome: 'Cookie Duplo Chocolate', descricao: 'Cookie crocante por fora e cremoso por dentro.', preco: 12.00, categoria: 'cookies', emoji: '🍪' },
  { nome: 'Brownie Tradicional', descricao: 'Brownie fudgy de chocolate com casca crocante.', preco: 10.00, categoria: 'brownies', emoji: '🍫' },
  { nome: 'Bolo de Chocolate', descricao: 'Massa fofinha de chocolate com recheio cremoso.', preco: 45.00, categoria: 'bolos', emoji: '🎂' },
];

function formatarPreco(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

// Monta o carrossel de imagens de um produto (estilo Instagram)
function criarCarrossel(imagens, nomeAlternativo) {
  const viewport = document.createElement('div');
  viewport.className = 'carrossel-viewport';

  const track = document.createElement('div');
  track.className = 'carrossel-track';
  track.style.setProperty('--n', imagens.length);
  track.style.setProperty('--i', 0);

  imagens.forEach((imgObj, i) => {
    const slide = document.createElement('div');
    slide.className = 'carrossel-slide';
    const img = document.createElement('img');
    img.src = imgObj.url;
    img.alt = `${nomeAlternativo} — foto ${i + 1}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.style.objectPosition = `${imgObj.x ?? 50}% ${imgObj.y ?? 50}%`;
    slide.appendChild(img);
    track.appendChild(slide);
  });

  const btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.className = 'carrossel-btn carrossel-prev';
  btnPrev.innerHTML = '&#8249;';
  btnPrev.setAttribute('aria-label', 'Foto anterior');
  btnPrev.hidden = true;

  const btnNext = document.createElement('button');
  btnNext.type = 'button';
  btnNext.className = 'carrossel-btn carrossel-next';
  btnNext.innerHTML = '&#8250;';
  btnNext.setAttribute('aria-label', 'Próxima foto');
  if (imagens.length <= 1) btnNext.hidden = true;

  const dots = document.createElement('div');
  dots.className = 'carrossel-dots';
  imagens.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'carrossel-dot' + (i === 0 ? ' ativa' : '');
    dots.appendChild(dot);
  });

  viewport.append(track, btnPrev, btnNext, dots);

  let atual = 0;

  function irPara(index) {
    atual = Math.max(0, Math.min(imagens.length - 1, index));
    track.style.setProperty('--i', atual);
    btnPrev.hidden = atual === 0;
    btnNext.hidden = atual === imagens.length - 1;
    dots.querySelectorAll('.carrossel-dot').forEach((d, i) => d.classList.toggle('ativa', i === atual));
  }

  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); irPara(atual - 1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); irPara(atual + 1); });

  // Swipe para mobile
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) irPara(diff > 0 ? atual + 1 : atual - 1);
  });

  return viewport;
}

// Monta o card de um produto sem usar innerHTML (evita injeção de dados vindos do banco)
function criarCardProduto(produto) {
  const cor = CORES_CATEGORIA[produto.categoria] || 'cor-amarelo';
  const emoji = produto.emoji || EMOJI_CATEGORIA[produto.categoria] || '🍰';

  const article = document.createElement('article');
  article.className = 'produto';
  article.dataset.categoria = produto.categoria;

  if (produto.esgotado) {
    article.classList.add('produto-esgotado');
  }

  const imgDiv = document.createElement('div');
  imgDiv.className = `produto-img ${cor}`;

  // Resolução de imagens: prioriza array imagens[], capa sempre primeira, fallback para imagem_url
  const imagens = Array.isArray(produto.imagens) && produto.imagens.length > 0
    ? [...produto.imagens].sort((a, b) => (b.capa ? 1 : 0) - (a.capa ? 1 : 0))
    : produto.imagem_url
      ? [{ url: produto.imagem_url, x: 50, y: 50 }]
      : [];

  if (imagens.length > 1) {
    imgDiv.appendChild(criarCarrossel(imagens, produto.nome));
  } else if (imagens.length === 1) {
    const img = document.createElement('img');
    img.src = imagens[0].url;
    img.alt = produto.nome;
    img.style.objectPosition = `${imagens[0].x ?? 50}% ${imagens[0].y ?? 50}%`;
    imgDiv.appendChild(img);
  } else {
    const spanEmoji = document.createElement('span');
    spanEmoji.textContent = emoji;
    imgDiv.appendChild(spanEmoji);
  }

  if (produto.esgotado) {
    const faixa = document.createElement('span');
    faixa.className = 'faixa-esgotado';
    faixa.textContent = 'Esgotado';
    imgDiv.appendChild(faixa);
  }

  if (produto.desconto > 0) {
    const badge = document.createElement('span');
    badge.className = 'badge-desconto';
    badge.textContent = `-${produto.desconto}%`;
    imgDiv.appendChild(badge);
  }

  const corpo = document.createElement('div');
  corpo.className = 'produto-corpo';

  const nome = document.createElement('h3');
  nome.className = 'produto-nome';
  nome.textContent = produto.nome;

  const desc = document.createElement('p');
  desc.className = 'produto-desc';
  desc.textContent = produto.descricao || '';

  const rodape = document.createElement('div');
  rodape.className = 'produto-rodape';

  const precoWrapper = document.createElement('div');
  precoWrapper.className = 'produto-preco-wrapper';

  const desconto = Number(produto.desconto) || 0;
  const precoFinal = desconto > 0 ? produto.preco * (1 - desconto / 100) : produto.preco;

  if (desconto > 0) {
    const precoAntigo = document.createElement('span');
    precoAntigo.className = 'produto-preco-antigo';
    precoAntigo.textContent = formatarPreco(produto.preco);
    precoWrapper.appendChild(precoAntigo);
  }

  const preco = document.createElement('span');
  preco.className = 'produto-preco';
  preco.textContent = formatarPreco(precoFinal);
  precoWrapper.appendChild(preco);

  rodape.appendChild(precoWrapper);

  const botaoAdicionar = document.createElement('button');
  botaoAdicionar.type = 'button';
  botaoAdicionar.className = 'produto-adicionar';
  botaoAdicionar.textContent = '+';

  if (produto.esgotado) {
    botaoAdicionar.disabled = true;
    botaoAdicionar.classList.add('produto-adicionar-oculto');
    botaoAdicionar.setAttribute('aria-hidden', 'true');
    botaoAdicionar.tabIndex = -1;
  } else {
    botaoAdicionar.setAttribute('aria-label', `Adicionar ${produto.nome} ao carrinho`);
    botaoAdicionar.addEventListener('click', () => adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      preco: precoFinal,
      emoji,
    }));
  }
  rodape.appendChild(botaoAdicionar);

  corpo.append(nome, desc, rodape);
  article.append(imgDiv, corpo);

  return article;
}

// Aplica o filtro de categoria atualmente selecionado (agora combina com busca)
function aplicarFiltroAtivo() {
  aplicarFiltrosCombinados();
}

// Registra um evento de analytics (visita, visualização de produto, clique no WhatsApp)
function registrarEvento(tipo, produtoNome = null) {
  if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
  supabaseClient.from('eventos_analytics').insert([{ tipo, produto_nome: produtoNome }]).then(() => {});
}

// Busca os produtos no Supabase (se configurado) e renderiza no cardápio
async function carregarProdutos() {
  const container = document.getElementById('listaProdutos');
  let produtos = PRODUTOS_PADRAO;

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: true });

    if (!error && data) {
      produtos = data;
    }
  }

  registrarEvento('visita');
  if (produtos.length > 0) {
    produtos.forEach((produto) => registrarEvento('visualizacao_produto', produto.nome));
  }

  container.innerHTML = '';

  if (produtos.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'produtos-status';
    vazio.textContent = 'Nenhum produto cadastrado ainda.';
    container.appendChild(vazio);
    return;
  }

  produtos.forEach((produto) => container.appendChild(criarCardProduto(produto)));
  aplicarFiltroAtivo();
}

// Tela de boas-vindas: aparece ao abrir e some sozinha após alguns segundos
document.addEventListener('DOMContentLoaded', () => {
  const boasVindas = document.getElementById('boasVindas');

  if (boasVindas) {
    document.body.classList.add('sem-rolagem');

    setTimeout(() => {
      boasVindas.classList.add('escondido');
      document.body.classList.remove('sem-rolagem');
    }, 2200);

    boasVindas.addEventListener('click', () => {
      boasVindas.classList.add('escondido');
      document.body.classList.remove('sem-rolagem');
    });
  }
});

// ===== AUTENTICAÇÃO (cadastro / login / perfil) =====
document.addEventListener('DOMContentLoaded', () => {
  const botaoCadastro    = document.getElementById('botaoCadastro');
  const cadastroBackdrop = document.getElementById('cadastroBackdrop');

  // painéis
  const cadastroPainel = document.getElementById('cadastroPainel');
  const perfilPainel   = document.getElementById('perfilPainel');

  // abas dentro do painel de auth
  const abaRegistro   = document.getElementById('abaRegistro');
  const abaLogin      = document.getElementById('abaLogin');
  const painelRegistro = document.getElementById('painelRegistro');
  const painelLogin    = document.getElementById('painelLogin');

  // formulários
  const formCadastro    = document.getElementById('formCadastro');
  const formLogin       = document.getElementById('formLogin');
  const cadastroMensagem = document.getElementById('cadastroMensagem');
  const loginMensagem    = document.getElementById('loginMensagem');

  // perfil
  const perfilFechar = document.getElementById('perfilFechar');
  const perfilEmail  = document.getElementById('perfilEmail');
  const perfilAvatar = document.getElementById('perfilAvatar');
  const botaoSair    = document.getElementById('botaoSair');

  if (!botaoCadastro) return;

  // --- Estado da UI de autenticação ---

  function fecharTudo() {
    if (cadastroPainel) cadastroPainel.hidden = true;
    if (perfilPainel)   perfilPainel.hidden = true;
    if (cadastroBackdrop) cadastroBackdrop.hidden = true;
    document.body.classList.remove('sem-rolagem');
  }

  function abrirPainelAuth() {
    if (cadastroPainel) cadastroPainel.hidden = false;
    if (cadastroBackdrop) cadastroBackdrop.hidden = false;
    document.body.classList.add('sem-rolagem');
  }

  function abrirPainelPerfil() {
    if (perfilPainel) perfilPainel.hidden = false;
    if (cadastroBackdrop) cadastroBackdrop.hidden = false;
    document.body.classList.add('sem-rolagem');
  }

  // Atualiza o botão e decide qual painel abrir ao clicar
  function atualizarUIAuth(user) {
    if (user) {
      // Usuário logado — botão fica colorido/preenchido
      botaoCadastro.classList.add('logado');
      botaoCadastro.setAttribute('title', user.email);
      if (perfilEmail) perfilEmail.textContent = user.email;
      if (perfilAvatar) perfilAvatar.textContent = user.email[0].toUpperCase();
    } else {
      botaoCadastro.classList.remove('logado');
      botaoCadastro.setAttribute('title', 'Cadastre-se');
    }
  }

  // Verifica sessão existente ao carregar
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.auth.getSession().then(({ data }) => {
      atualizarUIAuth(data?.session?.user ?? null);
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      atualizarUIAuth(session?.user ?? null);
    });
  }

  // Clique no botão de perfil/cadastro
  botaoCadastro.addEventListener('click', async () => {
    const aberto = (!cadastroPainel?.hidden) || (!perfilPainel?.hidden);
    if (aberto) { fecharTudo(); return; }

    let logado = false;
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      logado = !!data?.session?.user;
    }

    if (logado) {
      abrirPainelPerfil();
    } else {
      abrirPainelAuth();
    }
  });

  cadastroBackdrop?.addEventListener('click', fecharTudo);
  document.getElementById('cadastroFechar')?.addEventListener('click', fecharTudo);
  perfilFechar?.addEventListener('click', fecharTudo);

  // --- Alternância de abas ---
  function ativarAba(aba) {
    const eRegistro = aba === 'registro';
    abaRegistro?.classList.toggle('ativa', eRegistro);
    abaLogin?.classList.toggle('ativa', !eRegistro);
    if (painelRegistro) painelRegistro.hidden = !eRegistro;
    if (painelLogin)    painelLogin.hidden = eRegistro;
  }

  abaRegistro?.addEventListener('click', () => ativarAba('registro'));
  abaLogin?.addEventListener('click', () => ativarAba('login'));

  // --- Criar conta ---
  formCadastro?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    cadastroMensagem.textContent = '';
    cadastroMensagem.classList.remove('erro', 'sucesso');

    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      cadastroMensagem.textContent = 'Cadastro indisponível no momento.';
      cadastroMensagem.classList.add('erro');
      return;
    }

    const email     = document.getElementById('cadastroEmail').value.trim();
    const senha     = document.getElementById('cadastroSenha').value;
    const nascimento = document.getElementById('cadastroNascimento').value;
    const genero    = document.getElementById('cadastroGenero').value;

    const botaoCriar = formCadastro.querySelector('button[type="submit"]');
    botaoCriar.disabled = true;
    botaoCriar.textContent = 'Criando conta...';

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password: senha,
      options: { data: { data_nascimento: nascimento, genero } },
    });

    botaoCriar.disabled = false;
    botaoCriar.textContent = 'Criar conta';

    if (error) {
      const status = error.status || 0;
      let msg = error.message || '';
      if (status === 429 || msg.toLowerCase().includes('rate limit')) {
        msg = 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
      } else if (status >= 500 || msg === '{}' || msg === '') {
        msg = 'Serviço indisponível no momento. Tente novamente mais tarde.';
      } else if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        msg = 'Este e-mail já possui cadastro. Use a aba "Entrar".';
      } else if (msg.toLowerCase().includes('password')) {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (msg.toLowerCase().includes('valid') && msg.toLowerCase().includes('email')) {
        msg = 'Informe um e-mail válido.';
      }
      cadastroMensagem.textContent = msg;
      cadastroMensagem.classList.add('erro');
      return;
    }

    const jaExiste = data?.user && data.user.identities && data.user.identities.length === 0;
    if (jaExiste) {
      cadastroMensagem.textContent = 'Este e-mail já possui cadastro. Use a aba "Entrar".';
      cadastroMensagem.classList.add('erro');
      return;
    }

    supabaseClient.from('clientes').upsert([{
      email,
      data_nascimento: nascimento || null,
      genero: genero || null,
    }], { onConflict: 'email' }).then(() => {});

    cadastroMensagem.textContent = 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.';
    cadastroMensagem.classList.add('sucesso');
    formCadastro.reset();
  });

  // --- Entrar ---
  formLogin?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    loginMensagem.textContent = '';
    loginMensagem.classList.remove('erro', 'sucesso');

    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      loginMensagem.textContent = 'Login indisponível no momento.';
      loginMensagem.classList.add('erro');
      return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    const botaoEntrar = formLogin.querySelector('button[type="submit"]');
    botaoEntrar.disabled = true;
    botaoEntrar.textContent = 'Entrando...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

    botaoEntrar.disabled = false;
    botaoEntrar.textContent = 'Entrar';

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      let texto = 'Não foi possível entrar. Tente novamente.';
      if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('credentials')) {
        texto = 'E-mail ou senha incorretos.';
      } else if (msg.includes('rate limit') || (error.status || 0) === 429) {
        texto = 'Muitas tentativas. Aguarde alguns minutos.';
      } else if (msg.includes('email not confirmed')) {
        texto = 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
      }
      loginMensagem.textContent = texto;
      loginMensagem.classList.add('erro');
      return;
    }

    // Login bem-sucedido: fecha painel e mostra perfil
    fecharTudo();
    const { data } = await supabaseClient.auth.getSession();
    atualizarUIAuth(data?.session?.user ?? null);
    formLogin.reset();
  });

  // --- Sair ---
  botaoSair?.addEventListener('click', async () => {
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    fecharTudo();
    atualizarUIAuth(null);
  });
});

// ===== CARRINHO DE PEDIDOS =====
const CHAVE_CARRINHO = 'flabelli_carrinho';
const NUMERO_WHATSAPP = '5513997550024';
let carrinho = [];

let carrinhoItensEl;
let carrinhoTotalEl;
let carrinhoContadorEl;
let carrinhoMensagemEl;
let botaoFinalizarPedidoEl;

function carregarCarrinho() {
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    carrinho = salvo ? JSON.parse(salvo) : [];
  } catch (erro) {
    carrinho = [];
  }
}

function salvarCarrinho() {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function calcularTotalCarrinho() {
  return carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

function criarItemCarrinho(item, indice) {
  const linha = document.createElement('div');
  linha.className = 'carrinho-item';

  const emoji = document.createElement('div');
  emoji.className = 'carrinho-item-emoji';
  emoji.textContent = item.emoji || '🍰';

  const info = document.createElement('div');
  info.className = 'carrinho-item-info';

  const nome = document.createElement('div');
  nome.className = 'carrinho-item-nome';
  nome.textContent = item.nome;

  const preco = document.createElement('div');
  preco.className = 'carrinho-item-preco';
  preco.textContent = `${formatarPreco(item.preco)} cada`;

  info.append(nome, preco);

  const acoes = document.createElement('div');
  acoes.className = 'carrinho-item-acoes';

  const botaoMenos = document.createElement('button');
  botaoMenos.type = 'button';
  botaoMenos.className = 'carrinho-qtd-botao';
  botaoMenos.textContent = '−';
  botaoMenos.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
  botaoMenos.addEventListener('click', () => alterarQuantidadeCarrinho(indice, -1));

  const quantidade = document.createElement('span');
  quantidade.className = 'carrinho-qtd-valor';
  quantidade.textContent = item.quantidade;

  const botaoMais = document.createElement('button');
  botaoMais.type = 'button';
  botaoMais.className = 'carrinho-qtd-botao';
  botaoMais.textContent = '+';
  botaoMais.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
  botaoMais.addEventListener('click', () => alterarQuantidadeCarrinho(indice, 1));

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'carrinho-item-remover';
  botaoRemover.textContent = '×';
  botaoRemover.setAttribute('aria-label', `Remover ${item.nome} do carrinho`);
  botaoRemover.addEventListener('click', () => removerItemCarrinho(indice));

  acoes.append(botaoMenos, quantidade, botaoMais, botaoRemover);
  linha.append(emoji, info, acoes);

  return linha;
}

function renderizarCarrinho() {
  carrinhoItensEl.innerHTML = '';

  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

  if (totalItens > 0) {
    carrinhoContadorEl.textContent = totalItens;
    carrinhoContadorEl.hidden = false;
  } else {
    carrinhoContadorEl.hidden = true;
  }

  if (carrinho.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'carrinho-vazio';
    vazio.textContent = 'Seu carrinho está vazio. Toque no "+" dos produtos para adicionar.';
    carrinhoItensEl.appendChild(vazio);
    botaoFinalizarPedidoEl.disabled = true;
  } else {
    carrinho.forEach((item, indice) => carrinhoItensEl.appendChild(criarItemCarrinho(item, indice)));
    botaoFinalizarPedidoEl.disabled = false;
  }

  carrinhoTotalEl.textContent = formatarPreco(calcularTotalCarrinho());
}

let toastCadastroMostrado = false;

function fecharToastCadastro() {
  const toast = document.getElementById('toastCadastro');
  if (!toast || toast.hidden) return;
  toast.classList.add('saindo');
  toast.addEventListener('animationend', () => {
    toast.hidden = true;
    toast.classList.remove('saindo');
  }, { once: true });
}

async function mostrarToastCadastro() {
  if (toastCadastroMostrado) return;

  // Não mostra se o usuário já está logado
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    if (data?.session?.user) return;
  }

  toastCadastroMostrado = true;

  const toast = document.getElementById('toastCadastro');
  if (!toast) return;

  toast.hidden = false;

  const timer = setTimeout(fecharToastCadastro, 7000);

  document.getElementById('toastFechar')?.addEventListener('click', () => {
    clearTimeout(timer);
    fecharToastCadastro();
  }, { once: true });

  document.getElementById('toastBotaoCadastro')?.addEventListener('click', () => {
    clearTimeout(timer);
    fecharToastCadastro();
    document.getElementById('botaoCadastro')?.click();
  }, { once: true });
}

function adicionarAoCarrinho(produto) {
  const existente = carrinho.find((item) => item.nome === produto.nome);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({ id: produto.id, nome: produto.nome, preco: produto.preco, emoji: produto.emoji, quantidade: 1 });
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQuantidadeCarrinho(indice, delta) {
  const item = carrinho[indice];
  if (!item) return;

  item.quantidade += delta;

  if (item.quantidade <= 0) {
    carrinho.splice(indice, 1);
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function removerItemCarrinho(indice) {
  carrinho.splice(indice, 1);
  salvarCarrinho();
  renderizarCarrinho();
}

function finalizarPedido() {
  if (carrinho.length === 0) return;
  window.location.href = 'finalizar-pedido.html';
}

// Painel do carrinho de pedidos
document.addEventListener('DOMContentLoaded', () => {
  const botaoCarrinho = document.getElementById('botaoCarrinho');
  const carrinhoPainel = document.getElementById('carrinhoPainel');
  const carrinhoBackdrop = document.getElementById('carrinhoBackdrop');
  const carrinhoFechar = document.getElementById('carrinhoFechar');

  carrinhoItensEl = document.getElementById('carrinhoItens');
  carrinhoTotalEl = document.getElementById('carrinhoTotal');
  carrinhoContadorEl = document.getElementById('carrinhoContador');
  carrinhoMensagemEl = document.getElementById('carrinhoMensagem');
  botaoFinalizarPedidoEl = document.getElementById('botaoFinalizarPedido');

  if (!botaoCarrinho || !carrinhoPainel) return;

  function abrirCarrinho() {
    carrinhoPainel.hidden = false;
    carrinhoBackdrop.hidden = false;
    document.body.classList.add('sem-rolagem');
  }

  function fecharCarrinho() {
    carrinhoPainel.hidden = true;
    carrinhoBackdrop.hidden = true;
    document.body.classList.remove('sem-rolagem');
  }

  botaoCarrinho.addEventListener('click', () => {
    if (carrinhoPainel.hidden) {
      abrirCarrinho();
      if (carrinho.length > 0) setTimeout(mostrarToastCadastro, 600);
    } else {
      fecharCarrinho();
    }
  });

  carrinhoFechar.addEventListener('click', fecharCarrinho);
  carrinhoBackdrop.addEventListener('click', fecharCarrinho);
  botaoFinalizarPedidoEl.addEventListener('click', finalizarPedido);

  carregarCarrinho();
  renderizarCarrinho();
});

// Constrói os botões de categoria dinamicamente a partir do localStorage
function construirNavCategorias() {
  const nav = document.getElementById('navCategorias');
  if (!nav) return;

  nav.innerHTML = '';

  const botaoTodos = document.createElement('button');
  botaoTodos.className = 'categoria ativa';
  botaoTodos.dataset.categoria = 'todos';
  botaoTodos.textContent = 'Todos';
  nav.appendChild(botaoTodos);

  obterCategorias().forEach((cat) => {
    const botao = document.createElement('button');
    botao.className = 'categoria';
    botao.dataset.categoria = cat.slug;
    botao.textContent = cat.nome;
    nav.appendChild(botao);
  });

  const botoes = nav.querySelectorAll('.categoria');

  botoes.forEach((botao) => {
    botao.addEventListener('click', (evento) => {
      botoes.forEach((b) => b.classList.remove('ativa'));
      botao.classList.add('ativa');
      aplicarFiltroAtivo();

      const rect = botao.getBoundingClientRect();
      const tamanho = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${tamanho}px`;
      ripple.style.height = `${tamanho}px`;
      ripple.style.left = `${evento.clientX - rect.left - tamanho / 2}px`;
      ripple.style.top = `${evento.clientY - rect.top - tamanho / 2}px`;
      botao.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

// Aplica filtro combinado: categoria ativa + texto de busca
function aplicarFiltrosCombinados() {
  const botaoLimpar = document.getElementById('botaoLimparBusca');
  const campoBusca = document.getElementById('campoBuscaProduto');
  const termoBusca = campoBusca ? campoBusca.value.trim().toLowerCase() : '';
  if (botaoLimpar) botaoLimpar.hidden = !termoBusca;

  const botaoAtivo = document.querySelector('.categoria.ativa');
  const categoria = botaoAtivo ? botaoAtivo.dataset.categoria : 'todos';

  const container = document.getElementById('listaProdutos');
  const vazioAnterior = container.querySelector('.categoria-vazia');
  if (vazioAnterior) vazioAnterior.remove();

  const produtos = Array.from(container.querySelectorAll('.produto'));
  let algumVisivel = false;

  produtos.forEach((card) => {
    const bateCategoria = categoria === 'todos' || card.dataset.categoria === categoria;
    const nome = card.querySelector('.produto-nome')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.produto-desc')?.textContent.toLowerCase() || '';
    const bateBusca = !termoBusca || nome.includes(termoBusca) || desc.includes(termoBusca);
    const mostrar = bateCategoria && bateBusca;
    card.style.display = mostrar ? '' : 'none';
    if (mostrar) algumVisivel = true;
  });

  if (produtos.length > 0 && !algumVisivel) {
    const vazio = document.createElement('div');
    vazio.className = 'categoria-vazia';
    const icone = document.createElement('div');
    icone.className = 'categoria-vazia-icone';
    icone.textContent = termoBusca ? '🔍' : '📦';
    const titulo = document.createElement('h3');
    titulo.textContent = termoBusca
      ? `Nenhum resultado para "${termoBusca}"`
      : 'Nenhum produto nesta categoria';
    const descEl = document.createElement('p');
    descEl.textContent = termoBusca
      ? 'Tente outro nome ou explore as categorias acima.'
      : 'Em breve novidades por aqui!';
    vazio.append(icone, titulo, descEl);
    container.appendChild(vazio);
  }
}

// Carrega o cardápio e configura o filtro de categorias
document.addEventListener('DOMContentLoaded', () => {
  construirNavCategorias();
  carregarProdutos();

  // Busca de produtos
  const campoBusca = document.getElementById('campoBuscaProduto');
  const botaoLimpar = document.getElementById('botaoLimparBusca');

  campoBusca?.addEventListener('input', () => {
    aplicarFiltrosCombinados();
  });

  botaoLimpar?.addEventListener('click', () => {
    campoBusca.value = '';
    botaoLimpar.hidden = true;
    campoBusca.focus();
    aplicarFiltrosCombinados();
  });

  // Efeito de "ripple" (onda) ao clicar nos botões (exceto .categoria, que tem ripple próprio)
  const elementosRipple = document.querySelectorAll('.cta-whatsapp, .voltar, .admin-btn, .cadastro-btn, .botao-cadastro, .carrinho-flutuante, .botao-finalizar');

  elementosRipple.forEach((el) => {
    el.addEventListener('click', (evento) => {
      const rect = el.getBoundingClientRect();
      const tamanho = Math.max(rect.width, rect.height);

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${tamanho}px`;
      ripple.style.height = `${tamanho}px`;
      ripple.style.left = `${evento.clientX - rect.left - tamanho / 2}px`;
      ripple.style.top = `${evento.clientY - rect.top - tamanho / 2}px`;

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
});
