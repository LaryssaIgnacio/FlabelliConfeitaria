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
    return salvo ? JSON.parse(salvo) : [...CATEGORIAS_PADRAO];
  } catch {
    return [...CATEGORIAS_PADRAO];
  }
}

function salvarCategorias(categorias) {
  localStorage.setItem(CHAVE_CATEGORIAS, JSON.stringify(categorias));
}

// Fallback para categorias antigas que possam existir no banco
const NOME_CATEGORIA_FIXO = {
  bolos: 'Bolos', tortas: 'Tortas', doces: 'Doces', salgados: 'Salgados',
  kits: 'Kits', combos: 'Combos', cookies: 'Cookies', brownies: 'Brownies', copos: 'Copos',
};

function obterNomeCategoria(slug) {
  const cat = obterCategorias().find((c) => c.slug === slug);
  return cat ? cat.nome : (NOME_CATEGORIA_FIXO[slug] || slug);
}

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

// Elementos das telas
const avisoConfig = document.getElementById('avisoConfig');
const loginTela = document.getElementById('loginTela');
const painelHome = document.getElementById('painelHome');
const painelSistema = document.getElementById('painelSistema');
const painelProdutos = document.getElementById('painelProdutos');
const painelDashboard = document.getElementById('painelDashboard');
const painelEstoque = document.getElementById('painelEstoque');
const painelInsights = document.getElementById('painelInsights');

const TELAS = {
  aviso: avisoConfig,
  login: loginTela,
  painelHome,
  painelSistema,
  painelProdutos,
  painelDashboard,
  painelEstoque,
  painelInsights,
};

// Elementos do login
const formLogin = document.getElementById('formLogin');
const loginErro = document.getElementById('loginErro');

// Elementos do painel
const botaoSair = document.getElementById('botaoSair');
const formProduto = document.getElementById('formProduto');
const formTitulo = document.getElementById('formTitulo');
const formErro = document.getElementById('formErro');
const produtoId = document.getElementById('produtoId');
const campoNome = document.getElementById('campoNome');
const campoCategoria = document.getElementById('campoCategoria');
const campoPreco = document.getElementById('campoPreco');
const campoDesconto = document.getElementById('campoDesconto');
const descontoPreview = document.getElementById('descontoPreview');
const campoDescricao = document.getElementById('campoDescricao');
const campoNovoIngrediente = document.getElementById('campoNovoIngrediente');
const listaTagsIngredientes = document.getElementById('listaTagsIngredientes');
const campoNovaInfo = document.getElementById('campoNovaInfo');
const listaTagsInfo = document.getElementById('listaTagsInfo');
const campoEstoque = document.getElementById('campoEstoque');
const campoEsgotado = document.getElementById('campoEsgotado');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoCancelar = document.getElementById('botaoCancelar');
const listaAdminProdutos = document.getElementById('listaAdminProdutos');
const contagemProdutos = document.getElementById('contagemProdutos');
const campoBuscaProduto = document.getElementById('campoBuscaProduto');

let produtosCache = [];

// ===== FOTOS DO PRODUTO (multi-imagem estilo Instagram) =====
const campoImagemArquivo = document.getElementById('campoImagemArquivo');
const uploadStatus = document.getElementById('uploadStatus');
const fotoFrame = document.getElementById('fotoFrame');
const fotoFrameVazio = document.getElementById('fotoFrameVazio');
const fotoRepo = document.getElementById('fotoRepo');
const fotoEditorImg = document.getElementById('fotoEditorImg');
const fotoBarra = document.getElementById('fotoBarra');
const fotoContador = document.getElementById('fotoContador');
const fotoBtnEsq = document.getElementById('fotoBtnEsq');
const fotoBtnDir = document.getElementById('fotoBtnDir');
const fotoBtnCapa = document.getElementById('fotoBtnCapa');
const fotoBtnCapaLabel = document.getElementById('fotoBtnCapaLabel');
const fotoBtnRemover = document.getElementById('fotoBtnRemover');
const fotoStrip = document.getElementById('fotoStrip');
const fotoBtnRecortar = document.getElementById('fotoBtnRecortar');

const BUCKET_IMAGENS = 'produtos';

// Cada item: { arquivo: File|null, url: string, x: number, y: number, capa: boolean }
let fotosAdmin = [];
let fotoAtual = 0;

// Tags do produto (ingredientes / informações importantes)
let _tagsIngredientes = [];
let _tagsInfo = [];

function _criarTagChip(texto, onRemover) {
  const chip = document.createElement('span');
  chip.className = 'tag-chip';

  const label = document.createElement('span');
  label.textContent = texto;

  const btnRemover = document.createElement('button');
  btnRemover.type = 'button';
  btnRemover.className = 'tag-chip-remover';
  btnRemover.textContent = '×';
  btnRemover.setAttribute('aria-label', `Remover ${texto}`);
  btnRemover.addEventListener('click', onRemover);

  chip.append(label, btnRemover);
  return chip;
}

function renderizarTagsIngredientes() {
  if (!listaTagsIngredientes) return;
  listaTagsIngredientes.innerHTML = '';
  if (_tagsIngredientes.length === 0) {
    listaTagsIngredientes.innerHTML = '<p class="tags-vazio">Nenhum ingrediente adicionado ainda.</p>';
    return;
  }
  _tagsIngredientes.forEach((texto, i) => {
    listaTagsIngredientes.appendChild(_criarTagChip(texto, () => {
      _tagsIngredientes.splice(i, 1);
      renderizarTagsIngredientes();
    }));
  });
}

function renderizarTagsInfo() {
  if (!listaTagsInfo) return;
  listaTagsInfo.innerHTML = '';
  if (_tagsInfo.length === 0) {
    listaTagsInfo.innerHTML = '<p class="tags-vazio">Nenhuma informação adicionada ainda.</p>';
    return;
  }
  _tagsInfo.forEach((texto, i) => {
    listaTagsInfo.appendChild(_criarTagChip(texto, () => {
      _tagsInfo.splice(i, 1);
      renderizarTagsInfo();
    }));
  });
}

function adicionarTagIngrediente() {
  const texto = campoNovoIngrediente.value.trim();
  if (!texto) return;
  _tagsIngredientes.push(texto);
  campoNovoIngrediente.value = '';
  renderizarTagsIngredientes();
  campoNovoIngrediente.focus();
}

function adicionarTagInfo() {
  const texto = campoNovaInfo.value.trim();
  if (!texto) return;
  _tagsInfo.push(texto);
  campoNovaInfo.value = '';
  renderizarTagsInfo();
  campoNovaInfo.focus();
}

// Estado do crop modal
let cropperInstance = null;
let filaCorte = [];
let indexFilaCorte = 0;
let modoRecultura = false;
let indexRecorte = -1;

// Elementos do dashboard
const statTotalPedidos = document.getElementById('statTotalPedidos');
const statVendasHoje = document.getElementById('statVendasHoje');
const statVendasMes = document.getElementById('statVendasMes');
const graficoVendas = document.getElementById('graficoVendas');
const rankingProdutos = document.getElementById('rankingProdutos');

// Elementos do estoque de ingredientes
const formIngrediente = document.getElementById('formIngrediente');
const formEstoqueTitulo = document.getElementById('formEstoqueTitulo');
const formEstoqueErro = document.getElementById('formEstoqueErro');
const ingredienteId = document.getElementById('ingredienteId');
const campoIngredienteNome = document.getElementById('campoIngredienteNome');
const campoIngredienteQuantidade = document.getElementById('campoIngredienteQuantidade');
const campoIngredienteUnidade = document.getElementById('campoIngredienteUnidade');
const campoIngredienteMinimo = document.getElementById('campoIngredienteMinimo');
const botaoSalvarIngrediente = document.getElementById('botaoSalvarIngrediente');
const botaoCancelarIngrediente = document.getElementById('botaoCancelarIngrediente');
const listaIngredientes = document.getElementById('listaIngredientes');
const filtroEstoqueBaixo = document.getElementById('filtroEstoqueBaixo');
const listaProdutosEstoque = document.getElementById('listaProdutosEstoque');

// Elementos do modal de movimentação de estoque
const movimentacaoBackdrop = document.getElementById('movimentacaoBackdrop');
const movimentacaoPainel = document.getElementById('movimentacaoPainel');
const movimentacaoFechar = document.getElementById('movimentacaoFechar');
const movimentacaoTitulo = document.getElementById('movimentacaoTitulo');
const movimentacaoLabelTipo = document.getElementById('movimentacaoLabelTipo');
const movimentacaoNomeIngrediente = document.getElementById('movimentacaoNomeIngrediente');
const movimentacaoEstoqueAtual = document.getElementById('movimentacaoEstoqueAtual');
const formMovimentacao = document.getElementById('formMovimentacao');
const campoMovimentacaoQuantidade = document.getElementById('campoMovimentacaoQuantidade');
const movimentacaoErro = document.getElementById('movimentacaoErro');
const botaoConfirmarMovimentacao = document.getElementById('botaoConfirmarMovimentacao');

const EMOJI_UNIDADE = {
  kg: '⚖️',
  g: '⚖️',
  l: '🥛',
  unidades: '📦',
};

const UNIDADE_LABEL = {
  kg: 'kg',
  g: 'g',
  l: 'L',
  unidades: 'un',
};

let ingredientesCache = [];
let produtosEstoqueCache = [];
let movimentacaoAtual = null;

function formatarPreco(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function formatarQuantidade(valor) {
  const numero = Number(valor) || 0;
  return numero % 1 === 0 ? numero.toString() : numero.toFixed(2).replace('.', ',');
}

function mostrarTela(nome) {
  Object.entries(TELAS).forEach(([chave, elemento]) => {
    elemento.hidden = chave !== nome;
  });
}

function atualizarPreviewDesconto() {
  const pct = Number(campoDesconto?.value) || 0;
  const preco = Number(campoPreco?.value) || 0;
  if (!descontoPreview) return;
  if (pct > 0 && preco > 0) {
    const precoFinal = preco * (1 - pct / 100);
    descontoPreview.textContent = `De ${formatarPreco(preco)} por ${formatarPreco(precoFinal)}`;
    descontoPreview.hidden = false;
  } else {
    descontoPreview.hidden = true;
  }
}

function limparFormulario() {
  formProduto.reset();
  produtoId.value = '';
  formTitulo.textContent = 'Novo produto';
  botaoSalvar.textContent = 'Adicionar produto';
  botaoCancelar.hidden = true;
  formErro.textContent = '';
  if (descontoPreview) descontoPreview.hidden = true;

  _tagsIngredientes = [];
  _tagsInfo = [];
  renderizarTagsIngredientes();
  renderizarTagsInfo();

  fotosAdmin = [];
  fotoAtual = 0;
  campoImagemArquivo.value = '';
  uploadStatus.textContent = '';
  renderFotoStrip();
  atualizarEditor();
}

// ---- Renderização da faixa de miniaturas ----

function renderFotoStrip() {
  // Remove thumbnails antigos (mantém o botão "+" ao final)
  const btnAdd = document.getElementById('fotoBtnAdicionar');
  fotoStrip.innerHTML = '';

  fotosAdmin.forEach((foto, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'foto-thumb' + (index === fotoAtual ? ' ativa' : '');

    const img = document.createElement('img');
    img.src = foto.url;
    img.alt = `Foto ${index + 1}`;
    img.style.objectPosition = `${foto.x ?? 50}% ${foto.y ?? 50}%`;

    if (foto.capa) {
      const badge = document.createElement('span');
      badge.className = 'foto-thumb-capa';
      badge.textContent = '⭐';
      thumb.appendChild(badge);
    }

    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      fotoAtual = index;
      renderFotoStrip();
      atualizarEditor();
    });

    fotoStrip.appendChild(thumb);
  });

  // Botão adicionar (re-criado ou movido para o final)
  const novoBtn = btnAdd || (() => {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'fotoBtnAdicionar';
    b.className = 'foto-strip-add';
    b.title = 'Adicionar foto';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>';
    b.addEventListener('click', () => { campoImagemArquivo.value = ''; campoImagemArquivo.click(); });
    return b;
  })();
  novoBtn.className = 'foto-strip-add';
  fotoStrip.appendChild(novoBtn);
}

// ---- Editor principal (frame grande + reposicionamento) ----

function atualizarEditor() {
  const foto = fotosAdmin[fotoAtual];

  if (!foto) {
    fotoFrameVazio.hidden = false;
    fotoRepo.hidden = true;
    fotoBarra.hidden = true;
    return;
  }

  fotoFrameVazio.hidden = true;
  fotoRepo.hidden = false;
  fotoBarra.hidden = false;

  fotoContador.textContent = `${fotoAtual + 1} / ${fotosAdmin.length}`;
  fotoBtnEsq.disabled = fotoAtual === 0;
  fotoBtnDir.disabled = fotoAtual === fotosAdmin.length - 1;
  const isCapa = foto.capa;
  fotoBtnCapa.classList.toggle('capa-ativa', isCapa);
  fotoBtnCapaLabel.textContent = isCapa ? 'Capa atual' : 'Definir como capa';

  fotoEditorImg.src = foto.url;
}


// ---- Ações das fotos ----

function setCapa(index) {
  fotosAdmin.forEach((f, i) => { f.capa = i === index; });
  renderFotoStrip();
  atualizarEditor();
}

function removerFoto(index) {
  const eraACapa = fotosAdmin[index].capa;
  fotosAdmin.splice(index, 1);
  if (eraACapa && fotosAdmin.length > 0) fotosAdmin[0].capa = true;
  fotoAtual = Math.min(fotoAtual, Math.max(0, fotosAdmin.length - 1));
  renderFotoStrip();
  atualizarEditor();
}

function adicionarFotos(arquivos) {
  processarArquivos(arquivos);
}

// ===== CROP MODAL (Cropper.js) =====

function abrirModalCorte() {
  document.getElementById('corteBackdrop').hidden = false;
  document.getElementById('corteModal').hidden = false;
  document.body.classList.add('sem-rolagem');
}

function fecharModalCorte() {
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  const corteImg = document.getElementById('corteImg');
  if (corteImg.src.startsWith('blob:')) URL.revokeObjectURL(corteImg.src);
  corteImg.src = '';
  document.getElementById('corteBackdrop').hidden = true;
  document.getElementById('corteModal').hidden = true;
  document.body.classList.remove('sem-rolagem');
}

function setAspecto(ratio, btn) {
  if (!cropperInstance) return;
  document.querySelectorAll('.corte-aspecto').forEach((b) => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  cropperInstance.setAspectRatio(isNaN(ratio) ? NaN : ratio);
}

function _iniciarCropper(url) {
  const corteImg = document.getElementById('corteImg');
  if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
  corteImg.onload = () => {
    cropperInstance = new Cropper(corteImg, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
      responsive: true,
    });
    document.querySelectorAll('.corte-aspecto').forEach((b) => b.classList.remove('ativo'));
    document.querySelector('.corte-aspecto[data-ratio="1"]')?.classList.add('ativo');
  };
  corteImg.src = url;
}

function mostrarProximoCorte() {
  if (indexFilaCorte >= filaCorte.length) {
    fecharModalCorte();
    fotoAtual = Math.max(0, fotosAdmin.length - 1);
    renderFotoStrip();
    atualizarEditor();
    return;
  }
  const corteTitulo = document.getElementById('corteTitulo');
  corteTitulo.textContent = filaCorte.length > 1
    ? `Ajustar foto ${indexFilaCorte + 1} de ${filaCorte.length}`
    : 'Ajustar foto';
  _iniciarCropper(URL.createObjectURL(filaCorte[indexFilaCorte]));
  abrirModalCorte();
}

function mostrarRecorte(index) {
  modoRecultura = true;
  indexRecorte = index;
  document.getElementById('corteTitulo').textContent = 'Recortar foto';
  _iniciarCropper(fotosAdmin[index].url);
  abrirModalCorte();
}

function confirmarCorte() {
  if (!cropperInstance) return;
  const btn = document.getElementById('corteBtnConfirmar');
  btn.disabled = true;
  btn.textContent = 'Processando...';
  const canvas = cropperInstance.getCroppedCanvas({ width: 1080, height: 1080 });
  canvas.toBlob((blob) => {
    const arquivo = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
    const url = URL.createObjectURL(arquivo);
    if (modoRecultura) {
      const idx = indexRecorte;
      fotosAdmin[idx].arquivo = arquivo;
      fotosAdmin[idx].url = url;
      modoRecultura = false;
      indexRecorte = -1;
      fecharModalCorte();
      fotoAtual = idx;
      renderFotoStrip();
      atualizarEditor();
    } else {
      fotosAdmin.push({ arquivo, url, x: 50, y: 50, capa: fotosAdmin.length === 0 });
      indexFilaCorte++;
      btn.disabled = false;
      btn.textContent = 'Confirmar';
      mostrarProximoCorte();
    }
  }, 'image/jpeg', 0.92);
}

function pularCorte() {
  if (modoRecultura) {
    modoRecultura = false;
    indexRecorte = -1;
    fecharModalCorte();
    return;
  }
  const arquivo = filaCorte[indexFilaCorte];
  fotosAdmin.push({ arquivo, url: URL.createObjectURL(arquivo), x: 50, y: 50, capa: fotosAdmin.length === 0 });
  indexFilaCorte++;
  mostrarProximoCorte();
}

function processarArquivos(arquivos) {
  filaCorte = Array.from(arquivos).filter((f) => f.type.startsWith('image/'));
  indexFilaCorte = 0;
  modoRecultura = false;
  if (filaCorte.length === 0) return;
  mostrarProximoCorte();
}

// Listeners dos controles do editor
fotoBtnEsq.addEventListener('click', () => {
  if (fotoAtual > 0) { fotoAtual--; renderFotoStrip(); atualizarEditor(); }
});
fotoBtnDir.addEventListener('click', () => {
  if (fotoAtual < fotosAdmin.length - 1) { fotoAtual++; renderFotoStrip(); atualizarEditor(); }
});
fotoBtnCapa.addEventListener('click', () => setCapa(fotoAtual));
fotoBtnRemover.addEventListener('click', () => removerFoto(fotoAtual));
fotoBtnRecortar.addEventListener('click', () => mostrarRecorte(fotoAtual));

function criarBotaoIcone(classe, tituloTexto, caminhoSvg) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = classe;
  botao.title = tituloTexto;
  botao.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${caminhoSvg}</svg>`;
  return botao;
}

async function alternarEsgotado(produto, esgotado, item) {
  const { error } = await supabaseClient.from('produtos').update({ esgotado }).eq('id', produto.id);

  if (error) {
    alert(`Erro ao atualizar produto: ${error.message}`);
    return;
  }

  produto.esgotado = esgotado;
  item.classList.toggle('item-esgotado', esgotado);
}

function criarItemProduto(produto) {
  const cor = CORES_CATEGORIA[produto.categoria] || 'cor-amarelo';
  const emoji = produto.emoji || EMOJI_CATEGORIA[produto.categoria] || '🍰';
  const quantidadeEstoque = Number(produto.estoque) || 0;

  const item = document.createElement('div');
  item.className = 'item-produto';
  if (produto.esgotado) item.classList.add('item-esgotado');

  const icone = document.createElement('div');
  icone.className = `item-emoji ${cor}`;

  if (produto.imagem_url) {
    const img = document.createElement('img');
    img.src = produto.imagem_url;
    img.alt = produto.nome;
    icone.appendChild(img);
  } else {
    icone.textContent = emoji;
  }

  const info = document.createElement('div');
  info.className = 'item-info';

  const nome = document.createElement('div');
  nome.className = 'item-nome';
  nome.textContent = produto.nome;

  const desc = document.createElement('div');
  desc.className = 'item-desc';
  desc.textContent = produto.descricao || '';

  const meta = document.createElement('div');
  meta.className = 'item-meta';

  const categoria = document.createElement('span');
  categoria.className = 'item-categoria';
  categoria.textContent = obterNomeCategoria(produto.categoria);

  const preco = document.createElement('span');
  preco.className = 'item-preco';
  if (produto.desconto > 0) {
    const precoFinal = produto.preco * (1 - produto.desconto / 100);
    preco.innerHTML = `<s class="item-preco-antigo">${formatarPreco(produto.preco)}</s> ${formatarPreco(precoFinal)}`;
  } else {
    preco.textContent = formatarPreco(produto.preco);
  }

  const estoque = document.createElement('span');
  estoque.className = quantidadeEstoque > 0 ? 'item-estoque' : 'item-estoque item-estoque-vazio';
  estoque.textContent = quantidadeEstoque > 0 ? `Estoque: ${quantidadeEstoque}` : 'Sem estoque';

  const metaEsquerda = [categoria, preco, estoque];
  if (produto.desconto > 0) {
    const badgeDesc = document.createElement('span');
    badgeDesc.className = 'item-badge-desconto';
    badgeDesc.textContent = `-${produto.desconto}%`;
    metaEsquerda.splice(1, 0, badgeDesc);
  }
  meta.append(...metaEsquerda);
  info.append(nome, desc, meta);

  const lateral = document.createElement('div');
  lateral.className = 'item-lateral';

  const switchEsgotado = document.createElement('label');
  switchEsgotado.className = 'campo-switch campo-switch-lista';

  const switchVisual = document.createElement('span');
  switchVisual.className = 'switch';

  const inputEsgotado = document.createElement('input');
  inputEsgotado.type = 'checkbox';
  inputEsgotado.checked = !!produto.esgotado;
  inputEsgotado.addEventListener('change', () => alternarEsgotado(produto, inputEsgotado.checked, item));

  const trilho = document.createElement('span');
  trilho.className = 'switch-trilho';

  switchVisual.append(inputEsgotado, trilho);

  const textoEsgotado = document.createElement('span');
  textoEsgotado.textContent = 'Esgotado';

  switchEsgotado.append(switchVisual, textoEsgotado);

  const acoes = document.createElement('div');
  acoes.className = 'item-acoes';

  const botaoEditar = criarBotaoIcone('botao-editar', 'Editar', '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>');
  botaoEditar.addEventListener('click', () => preencherFormularioEdicao(produto));

  const botaoRemover = criarBotaoIcone('botao-remover', 'Remover', '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
  botaoRemover.addEventListener('click', () => removerProduto(produto.id));

  acoes.append(botaoEditar, botaoRemover);
  lateral.append(switchEsgotado, acoes);
  item.append(icone, info, lateral);

  return item;
}

function preencherFormularioEdicao(produto) {
  produtoId.value = produto.id;
  campoNome.value = produto.nome;
  campoCategoria.value = produto.categoria;
  campoPreco.value = produto.preco;
  campoDescricao.value = produto.descricao || '';
  campoEstoque.value = Number(produto.estoque) || 0;
  campoEsgotado.checked = !!produto.esgotado;
  campoDesconto.value = produto.desconto || 0;
  atualizarPreviewDesconto();

  _tagsIngredientes = Array.isArray(produto.ingredientes) ? [...produto.ingredientes] : [];
  _tagsInfo = Array.isArray(produto.informacoes_importantes) ? [...produto.informacoes_importantes] : [];
  renderizarTagsIngredientes();
  renderizarTagsInfo();

  campoImagemArquivo.value = '';
  uploadStatus.textContent = '';

  // Carrega as fotos existentes
  if (Array.isArray(produto.imagens) && produto.imagens.length > 0) {
    fotosAdmin = produto.imagens.map((img) => ({
      arquivo: null, url: img.url, x: img.x ?? 50, y: img.y ?? 50, capa: !!img.capa,
    }));
    if (!fotosAdmin.some((f) => f.capa)) fotosAdmin[0].capa = true;
  } else if (produto.imagem_url) {
    fotosAdmin = [{ arquivo: null, url: produto.imagem_url, x: 50, y: 50, capa: true }];
  } else {
    fotosAdmin = [];
  }
  fotoAtual = 0;
  renderFotoStrip();
  atualizarEditor();

  formTitulo.textContent = 'Editar produto';
  botaoSalvar.textContent = 'Salvar alterações';
  botaoCancelar.hidden = false;
  formErro.textContent = '';

  formProduto.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function carregarProdutosAdmin() {
  listaAdminProdutos.innerHTML = '<p class="mensagem-status">Carregando produtos...</p>';

  const { data, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('criado_em', { ascending: true });

  if (error) {
    listaAdminProdutos.innerHTML = '';
    const erro = document.createElement('p');
    erro.className = 'mensagem-erro';
    erro.textContent = `Erro ao carregar produtos: ${error.message}`;
    listaAdminProdutos.appendChild(erro);
    return;
  }

  produtosCache = data || [];
  contagemProdutos.textContent = produtosCache.length;
  renderizarListaProdutos(campoBuscaProduto.value);
}

function renderizarListaProdutos(termoBusca = '') {
  listaAdminProdutos.innerHTML = '';

  if (produtosCache.length === 0) {
    listaAdminProdutos.innerHTML = `
      <div class="estado-vazio">
        <span class="estado-vazio-icone">🧁</span>
        <p>Nenhum produto cadastrado ainda.</p>
      </div>
    `;
    return;
  }

  const termo = termoBusca.trim().toLowerCase();
  const produtosFiltrados = termo
    ? produtosCache.filter((produto) => produto.nome.toLowerCase().includes(termo))
    : produtosCache;

  if (produtosFiltrados.length === 0) {
    const vazio = document.createElement('div');
    vazio.className = 'estado-vazio';

    const icone = document.createElement('span');
    icone.className = 'estado-vazio-icone';
    icone.textContent = '🔍';

    const texto = document.createElement('p');
    texto.textContent = `Nenhum produto encontrado para "${termoBusca.trim()}".`;

    vazio.append(icone, texto);
    listaAdminProdutos.appendChild(vazio);
    return;
  }

  produtosFiltrados.forEach((produto) => listaAdminProdutos.appendChild(criarItemProduto(produto)));
}

async function removerProduto(id) {
  if (!confirm('Tem certeza que deseja remover este produto?')) return;

  const { data, error } = await supabaseClient.from('produtos').delete().eq('id', id).select();

  if (error) {
    alert(`Erro ao remover produto: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    alert('Não foi possível remover o produto. Verifique as permissões (RLS) de exclusão na tabela "produtos" do Supabase.');
    return;
  }

  carregarProdutosAdmin();
}

let avaliacoesCache = [];

function criarItemAvaliacaoAdmin(avaliacao) {
  const item = document.createElement('div');
  item.className = 'item-avaliacao-admin';

  const linhaTopo = document.createElement('div');
  linhaTopo.className = 'item-avaliacao-linha-topo';

  const info = document.createElement('div');
  info.className = 'avaliacao-admin-info';

  const topo = document.createElement('div');
  topo.className = 'avaliacao-admin-topo';

  const produtoNome = document.createElement('span');
  produtoNome.className = 'avaliacao-admin-produto';
  produtoNome.textContent = avaliacao.produtos?.nome || 'Produto removido';

  const estrelas = document.createElement('span');
  estrelas.className = 'avaliacao-admin-estrelas';
  estrelas.textContent = '★'.repeat(Number(avaliacao.nota) || 0) + '☆'.repeat(5 - (Number(avaliacao.nota) || 0));

  topo.append(produtoNome, estrelas);

  const meta = document.createElement('div');
  meta.className = 'avaliacao-admin-meta';
  const nomeOuEmail = avaliacao.cliente_nome ? `${avaliacao.cliente_nome} (${avaliacao.cliente_email})` : avaliacao.cliente_email;
  meta.textContent = `${nomeOuEmail} · ${new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}`;

  const comentario = document.createElement('p');
  comentario.className = 'avaliacao-admin-comentario';
  comentario.textContent = avaliacao.comentario;

  info.append(topo, meta, comentario);

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'botao-remover';
  botaoRemover.title = 'Excluir avaliação';
  botaoRemover.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  botaoRemover.addEventListener('click', () => removerAvaliacao(avaliacao.id));

  linhaTopo.append(info, botaoRemover);
  item.appendChild(linhaTopo);

  // Resposta da loja
  const respostaWrap = document.createElement('div');
  respostaWrap.className = 'resposta-loja-wrap';

  function renderizarRespostaSalva() {
    respostaWrap.innerHTML = '';
    if (avaliacao.resposta_loja) {
      const bloco = document.createElement('div');
      bloco.className = 'resposta-loja-bloco';

      const titulo = document.createElement('strong');
      titulo.textContent = '💬 Resposta da Flabelli';

      const texto = document.createElement('p');
      texto.textContent = avaliacao.resposta_loja;

      const botaoEditar = document.createElement('button');
      botaoEditar.type = 'button';
      botaoEditar.className = 'botao-link-editar-resposta';
      botaoEditar.textContent = 'Editar resposta';
      botaoEditar.addEventListener('click', () => mostrarFormResposta());

      bloco.append(titulo, texto, botaoEditar);
      respostaWrap.appendChild(bloco);
    } else {
      const botaoResponder = document.createElement('button');
      botaoResponder.type = 'button';
      botaoResponder.className = 'botao-responder';
      botaoResponder.textContent = '💬 Responder';
      botaoResponder.addEventListener('click', () => mostrarFormResposta());
      respostaWrap.appendChild(botaoResponder);
    }
  }

  function mostrarFormResposta() {
    respostaWrap.innerHTML = '';
    const form = document.createElement('div');
    form.className = 'resposta-loja-form';

    const campoWrap = document.createElement('div');
    campoWrap.className = 'resposta-loja-campo-wrap';

    const textarea = document.createElement('textarea');
    textarea.rows = 2;
    textarea.placeholder = 'Escreva uma resposta pública para este cliente...';
    textarea.value = avaliacao.resposta_loja || '';

    const emojiWrap = document.createElement('div');
    emojiWrap.className = 'emoji-picker-wrapper-resposta';

    const emojiTrigger = document.createElement('button');
    emojiTrigger.type = 'button';
    emojiTrigger.className = 'emoji-trigger-resposta';
    emojiTrigger.title = 'Adicionar emoji';
    emojiTrigger.textContent = '😊';

    const emojiPopup = document.createElement('div');
    emojiPopup.className = 'emoji-picker-popup-resposta';
    emojiPopup.hidden = true;

    const emojiPicker = document.createElement('emoji-picker');
    emojiPopup.appendChild(emojiPicker);

    emojiTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPopup.hidden = !emojiPopup.hidden;
    });

    emojiPicker.addEventListener('emoji-click', (e) => {
      const emoji = e.detail.unicode;
      const inicio = textarea.selectionStart ?? textarea.value.length;
      const fim = textarea.selectionEnd ?? textarea.value.length;
      textarea.value = textarea.value.slice(0, inicio) + emoji + textarea.value.slice(fim);
      const novaPos = inicio + emoji.length;
      textarea.focus();
      textarea.setSelectionRange(novaPos, novaPos);
      emojiPopup.hidden = true;
    });

    document.addEventListener('click', (e) => {
      if (!emojiPopup.hidden && !emojiPopup.contains(e.target) && e.target !== emojiTrigger) {
        emojiPopup.hidden = true;
      }
    });

    emojiWrap.append(emojiTrigger, emojiPopup);
    campoWrap.append(textarea, emojiWrap);

    const acoes = document.createElement('div');
    acoes.className = 'resposta-loja-acoes';

    const botaoSalvar = document.createElement('button');
    botaoSalvar.type = 'button';
    botaoSalvar.className = 'botao-primario botao-resposta-salvar';
    botaoSalvar.textContent = 'Salvar resposta';
    botaoSalvar.addEventListener('click', async () => {
      const texto = textarea.value.trim();
      botaoSalvar.disabled = true;
      botaoSalvar.textContent = 'Salvando...';
      const { error } = await supabaseClient.from('avaliacoes').update({ resposta_loja: texto || null }).eq('id', avaliacao.id);
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = 'Salvar resposta';
      if (error) { alert(`Erro ao salvar resposta: ${error.message}`); return; }
      avaliacao.resposta_loja = texto || null;
      renderizarRespostaSalva();
    });

    const botaoCancelar = document.createElement('button');
    botaoCancelar.type = 'button';
    botaoCancelar.className = 'botao-secundario';
    botaoCancelar.textContent = 'Cancelar';
    botaoCancelar.addEventListener('click', renderizarRespostaSalva);

    acoes.append(botaoSalvar, botaoCancelar);
    form.append(campoWrap, acoes);
    respostaWrap.appendChild(form);
    textarea.focus();
  }

  renderizarRespostaSalva();
  item.appendChild(respostaWrap);

  return item;
}

async function removerAvaliacao(id) {
  if (!confirm('Excluir esta avaliação? Essa ação não pode ser desfeita.')) return;

  const { error } = await supabaseClient.from('avaliacoes').delete().eq('id', id);

  if (error) {
    alert(`Erro ao excluir avaliação: ${error.message}`);
    return;
  }

  carregarAvaliacoesAdmin();
}

function renderizarAvaliacoesAdmin() {
  const lista = document.getElementById('listaAvaliacoesAdmin');
  if (!lista) return;

  const filtro = document.getElementById('filtroNotaAvaliacao')?.value || 'todas';
  let filtradas = avaliacoesCache;
  if (filtro === 'negativas') {
    filtradas = avaliacoesCache.filter((a) => Number(a.nota) <= 2);
  } else if (filtro !== 'todas') {
    filtradas = avaliacoesCache.filter((a) => Number(a.nota) === Number(filtro));
  }

  const badge = document.getElementById('contagemAvaliacoes');
  if (badge) badge.textContent = avaliacoesCache.length;

  lista.innerHTML = '';
  if (filtradas.length === 0) {
    lista.innerHTML = avaliacoesCache.length === 0
      ? '<div class="estado-vazio"><span class="estado-vazio-icone">⭐</span><p>Nenhuma avaliação ainda.</p></div>'
      : '<p class="mensagem-status">Nenhuma avaliação encontrada para esse filtro.</p>';
    return;
  }

  filtradas.forEach((avaliacao) => lista.appendChild(criarItemAvaliacaoAdmin(avaliacao)));
}

async function carregarAvaliacoesAdmin() {
  const lista = document.getElementById('listaAvaliacoesAdmin');
  if (!lista) return;
  lista.innerHTML = '<p class="mensagem-status">Carregando avaliações...</p>';

  const { data, error } = await supabaseClient
    .from('avaliacoes')
    .select('*, produtos(nome)')
    .order('criado_em', { ascending: false });

  if (error) {
    lista.innerHTML = `<p class="mensagem-erro">Erro ao carregar avaliações: ${error.message}</p>`;
    return;
  }

  avaliacoesCache = data || [];
  renderizarAvaliacoesAdmin();

}

async function salvarProduto(evento) {
  evento.preventDefault();
  formErro.textContent = '';
  uploadStatus.textContent = '';

  const dadosProduto = {
    nome: campoNome.value.trim(),
    categoria: campoCategoria.value,
    preco: Number(campoPreco.value),
    desconto: Number(campoDesconto.value) || 0,
    descricao: campoDescricao.value.trim(),
    estoque: Number(campoEstoque.value) || 0,
    esgotado: campoEsgotado.checked,
    ingredientes: _tagsIngredientes,
    informacoes_importantes: _tagsInfo,
  };

  // Upload das fotos novas e montagem do array imagens
  if (fotosAdmin.length > 0) {
    const novasComArquivo = fotosAdmin.filter((f) => f.arquivo);
    if (novasComArquivo.length > 0) {
      botaoSalvar.disabled = true;
      uploadStatus.textContent = `Enviando ${novasComArquivo.length} foto(s)...`;
    }

    for (const foto of fotosAdmin) {
      if (!foto.arquivo) continue;
      const ext = foto.arquivo.name.split('.').pop();
      const nome = `produto-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: erroUpload } = await supabaseClient.storage
        .from(BUCKET_IMAGENS)
        .upload(nome, foto.arquivo);
      if (erroUpload) {
        formErro.textContent = `Erro ao enviar imagem: ${erroUpload.message}`;
        uploadStatus.textContent = '';
        botaoSalvar.disabled = false;
        return;
      }
      const { data: urlData } = supabaseClient.storage.from(BUCKET_IMAGENS).getPublicUrl(nome);
      foto.url = urlData.publicUrl;
      foto.arquivo = null;
    }

    uploadStatus.textContent = '';
    botaoSalvar.disabled = false;

    // Capa sempre primeiro no array (para o carrossel começar por ela)
    const ordenado = [
      ...fotosAdmin.filter((f) => f.capa),
      ...fotosAdmin.filter((f) => !f.capa),
    ];
    const imagensJson = ordenado.map(({ url, x, y, capa }) => ({ url, x, y, capa }));
    dadosProduto.imagens = imagensJson;
    const capa = ordenado[0];
    dadosProduto.imagem_url = capa.url;
  } else {
    dadosProduto.imagens = [];
    dadosProduto.imagem_url = null;
  }

  async function executarSave(dados) {
    if (produtoId.value) {
      return supabaseClient.from('produtos').update(dados).eq('id', produtoId.value);
    }
    return supabaseClient.from('produtos').insert([dados]);
  }

  let resposta = await executarSave(dadosProduto);

  // Fallback: coluna imagens não existe
  if (resposta.error && resposta.error.message.includes('imagens')) {
    const dadosSemImagens = { ...dadosProduto };
    delete dadosSemImagens.imagens;
    resposta = await executarSave(dadosSemImagens);

    if (!resposta.error) {
      formErro.textContent = '⚠️ Foto salva, mas carrossel desativado. Execute no Supabase SQL Editor: ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagens jsonb DEFAULT \'[]\'::jsonb;';
    }
  }

  // Fallback: coluna desconto não existe
  if (resposta.error && resposta.error.message.includes('desconto')) {
    const dadosSemDesconto = { ...dadosProduto };
    delete dadosSemDesconto.desconto;
    resposta = await executarSave(dadosSemDesconto);

    if (!resposta.error) {
      formErro.textContent = '⚠️ Salvo, mas desconto não aplicado. Execute no Supabase SQL Editor: ALTER TABLE produtos ADD COLUMN IF NOT EXISTS desconto integer DEFAULT 0;';
    }
  }

  // Fallback: colunas ingredientes/informacoes_importantes não existem
  if (resposta.error && (resposta.error.message.includes('ingredientes') || resposta.error.message.includes('informacoes_importantes'))) {
    const dadosSemTags = { ...dadosProduto };
    delete dadosSemTags.ingredientes;
    delete dadosSemTags.informacoes_importantes;
    resposta = await executarSave(dadosSemTags);

    if (!resposta.error) {
      formErro.textContent = '⚠️ Salvo, mas ingredientes/informações não aplicados. Execute no Supabase SQL Editor: ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ingredientes jsonb DEFAULT \'[]\'::jsonb; ALTER TABLE produtos ADD COLUMN IF NOT EXISTS informacoes_importantes jsonb DEFAULT \'[]\'::jsonb;';
    }
  }

  if (resposta.error) {
    formErro.textContent = `Erro ao salvar: ${resposta.error.message}`;
    return;
  }

  limparFormulario();
  carregarProdutosAdmin();
}

function criarItemIngrediente(ingrediente) {
  const emoji = EMOJI_UNIDADE[ingrediente.unidade] || '📦';
  const unidadeLabel = UNIDADE_LABEL[ingrediente.unidade] || ingrediente.unidade;
  const quantidade = Number(ingrediente.quantidade) || 0;
  const minimo = Number(ingrediente.quantidade_minima) || 0;
  const estoqueBaixo = quantidade <= minimo;

  const item = document.createElement('div');
  item.className = 'item-ingrediente';
  if (estoqueBaixo) item.classList.add('ingrediente-baixo');

  const icone = document.createElement('div');
  icone.className = 'ingrediente-emoji';
  icone.textContent = emoji;

  const info = document.createElement('div');
  info.className = 'ingrediente-info';

  const nome = document.createElement('div');
  nome.className = 'ingrediente-nome';
  nome.textContent = ingrediente.nome;

  const meta = document.createElement('div');
  meta.className = 'ingrediente-meta';

  const qtd = document.createElement('span');
  qtd.className = 'ingrediente-quantidade';
  qtd.textContent = `${formatarQuantidade(quantidade)} ${unidadeLabel}`;

  const minimoEl = document.createElement('span');
  minimoEl.className = 'ingrediente-minimo';
  minimoEl.textContent = `Mínimo: ${formatarQuantidade(minimo)} ${unidadeLabel}`;

  meta.append(qtd, minimoEl);

  if (estoqueBaixo) {
    const badge = document.createElement('span');
    badge.className = 'ingrediente-badge-baixo';
    badge.textContent = 'Estoque baixo';
    meta.appendChild(badge);
  }

  info.append(nome, meta);

  const acoes = document.createElement('div');
  acoes.className = 'ingrediente-acoes';

  const botaoEntrada = criarBotaoIcone('botao-entrada', 'Registrar entrada', '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>');
  botaoEntrada.addEventListener('click', () => abrirMovimentacao(ingrediente, 'entrada'));

  const botaoSaida = criarBotaoIcone('botao-saida', 'Registrar saída', '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>');
  botaoSaida.addEventListener('click', () => abrirMovimentacao(ingrediente, 'saida'));

  const botaoEditar = criarBotaoIcone('botao-editar', 'Editar', '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>');
  botaoEditar.addEventListener('click', () => preencherFormularioEdicaoIngrediente(ingrediente));

  const botaoRemover = criarBotaoIcone('botao-remover', 'Remover', '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
  botaoRemover.addEventListener('click', () => removerIngrediente(ingrediente.id));

  acoes.append(botaoEntrada, botaoSaida, botaoEditar, botaoRemover);
  item.append(icone, info, acoes);

  return item;
}

function renderizarIngredientes() {
  listaIngredientes.innerHTML = '';

  let lista = ingredientesCache;
  if (filtroEstoqueBaixo.checked) {
    lista = lista.filter((ingrediente) => (Number(ingrediente.quantidade) || 0) <= (Number(ingrediente.quantidade_minima) || 0));
  }

  if (lista.length === 0) {
    const mensagem = filtroEstoqueBaixo.checked
      ? 'Nenhum item com estoque baixo.'
      : 'Nenhum ingrediente cadastrado ainda.';
    listaIngredientes.innerHTML = `<p class="mensagem-status">${mensagem}</p>`;
    return;
  }

  lista.forEach((ingrediente) => listaIngredientes.appendChild(criarItemIngrediente(ingrediente)));
}

async function carregarIngredientes() {
  listaIngredientes.innerHTML = '<p class="mensagem-status">Carregando ingredientes...</p>';

  const { data, error } = await supabaseClient
    .from('ingredientes')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    listaIngredientes.innerHTML = '';
    const erro = document.createElement('p');
    erro.className = 'mensagem-erro';
    erro.textContent = `Erro ao carregar ingredientes: ${error.message}`;
    listaIngredientes.appendChild(erro);
    return;
  }

  ingredientesCache = data || [];
  renderizarIngredientes();
}

const LIMITE_ESTOQUE_BAIXO_PRODUTO = 1;

function criarItemProdutoEstoque(produto) {
  const quantidade = Number(produto.estoque) || 0;
  const semEstoque = quantidade <= 0;
  const estoqueBaixo = quantidade > 0 && quantidade <= LIMITE_ESTOQUE_BAIXO_PRODUTO;

  const item = document.createElement('div');
  item.className = 'item-ingrediente';
  if (semEstoque || estoqueBaixo) item.classList.add('ingrediente-baixo');

  const icone = document.createElement('div');
  icone.className = 'ingrediente-emoji';

  const imagens = Array.isArray(produto.imagens) && produto.imagens.length > 0
    ? [...produto.imagens].sort((a, b) => (b.capa ? 1 : 0) - (a.capa ? 1 : 0))
    : produto.imagem_url
      ? [{ url: produto.imagem_url, x: 50, y: 50 }]
      : [];

  if (imagens.length > 0) {
    icone.classList.add('ingrediente-emoji-foto');
    const img = document.createElement('img');
    img.src = imagens[0].url;
    img.alt = produto.nome;
    img.style.objectPosition = `${imagens[0].x ?? 50}% ${imagens[0].y ?? 50}%`;
    icone.appendChild(img);
  } else {
    icone.textContent = produto.emoji || '📦';
  }

  const info = document.createElement('div');
  info.className = 'ingrediente-info';

  const nome = document.createElement('div');
  nome.className = 'ingrediente-nome';
  nome.textContent = produto.nome;

  const meta = document.createElement('div');
  meta.className = 'ingrediente-meta';

  const qtd = document.createElement('span');
  qtd.className = 'ingrediente-quantidade';
  qtd.textContent = `${formatarQuantidade(quantidade)} un`;
  meta.appendChild(qtd);

  if (semEstoque || estoqueBaixo) {
    const badge = document.createElement('span');
    badge.className = 'ingrediente-badge-baixo';
    badge.textContent = semEstoque ? 'Sem estoque' : 'Estoque baixo';
    meta.appendChild(badge);
  }

  const switchEsgotado = document.createElement('label');
  switchEsgotado.className = 'campo-switch campo-switch-lista';

  const switchVisual = document.createElement('span');
  switchVisual.className = 'switch';

  const inputEsgotado = document.createElement('input');
  inputEsgotado.type = 'checkbox';
  inputEsgotado.checked = !!produto.esgotado;
  inputEsgotado.addEventListener('change', () => alternarEsgotado(produto, inputEsgotado.checked, item));

  const trilho = document.createElement('span');
  trilho.className = 'switch-trilho';

  switchVisual.append(inputEsgotado, trilho);

  const textoEsgotado = document.createElement('span');
  textoEsgotado.textContent = 'Esgotado';

  switchEsgotado.append(switchVisual, textoEsgotado);
  meta.appendChild(switchEsgotado);

  info.append(nome, meta);

  const acoes = document.createElement('div');
  acoes.className = 'ingrediente-acoes';

  const botaoEntrada = criarBotaoIcone('botao-entrada', 'Registrar entrada', '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>');
  botaoEntrada.addEventListener('click', () => abrirMovimentacao(produto, 'entrada', 'produto'));

  const botaoSaida = criarBotaoIcone('botao-saida', 'Registrar saída', '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>');
  botaoSaida.addEventListener('click', () => abrirMovimentacao(produto, 'saida', 'produto'));

  acoes.append(botaoEntrada, botaoSaida);
  item.append(icone, info, acoes);

  return item;
}

function renderizarProdutosEstoque() {
  if (!listaProdutosEstoque) return;
  listaProdutosEstoque.innerHTML = '';

  if (produtosEstoqueCache.length === 0) {
    listaProdutosEstoque.innerHTML = '<p class="mensagem-status">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  produtosEstoqueCache.forEach((produto) => listaProdutosEstoque.appendChild(criarItemProdutoEstoque(produto)));
}

async function carregarProdutosEstoque() {
  if (!listaProdutosEstoque) return;
  listaProdutosEstoque.innerHTML = '<p class="mensagem-status">Carregando produtos...</p>';

  const { data, error } = await supabaseClient
    .from('produtos')
    .select('id, nome, estoque, emoji, imagens, imagem_url, esgotado')
    .order('nome', { ascending: true });

  if (error) {
    listaProdutosEstoque.innerHTML = `<p class="mensagem-erro">Erro ao carregar produtos: ${error.message}</p>`;
    return;
  }

  produtosEstoqueCache = data || [];
  renderizarProdutosEstoque();
}

function preencherFormularioEdicaoIngrediente(ingrediente) {
  ingredienteId.value = ingrediente.id;
  campoIngredienteNome.value = ingrediente.nome;
  campoIngredienteQuantidade.value = ingrediente.quantidade;
  campoIngredienteUnidade.value = ingrediente.unidade;
  campoIngredienteMinimo.value = ingrediente.quantidade_minima;

  formEstoqueTitulo.textContent = 'Editar ingrediente';
  botaoSalvarIngrediente.textContent = 'Salvar alterações';
  botaoCancelarIngrediente.hidden = false;
  formEstoqueErro.textContent = '';

  formIngrediente.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function limparFormularioIngrediente() {
  formIngrediente.reset();
  ingredienteId.value = '';
  formEstoqueTitulo.textContent = 'Novo ingrediente';
  botaoSalvarIngrediente.textContent = 'Adicionar ingrediente';
  botaoCancelarIngrediente.hidden = true;
  formEstoqueErro.textContent = '';
}

async function salvarIngrediente(evento) {
  evento.preventDefault();
  formEstoqueErro.textContent = '';

  const dadosIngrediente = {
    nome: campoIngredienteNome.value.trim(),
    quantidade: Number(campoIngredienteQuantidade.value) || 0,
    unidade: campoIngredienteUnidade.value,
    quantidade_minima: Number(campoIngredienteMinimo.value) || 0,
  };

  let resposta;

  if (ingredienteId.value) {
    resposta = await supabaseClient.from('ingredientes').update(dadosIngrediente).eq('id', ingredienteId.value);
  } else {
    resposta = await supabaseClient.from('ingredientes').insert([dadosIngrediente]);
  }

  if (resposta.error) {
    formEstoqueErro.textContent = `Erro ao salvar: ${resposta.error.message}`;
    return;
  }

  limparFormularioIngrediente();
  carregarIngredientes();
}

async function removerIngrediente(id) {
  if (!confirm('Tem certeza que deseja remover este ingrediente?')) return;

  const { data, error } = await supabaseClient.from('ingredientes').delete().eq('id', id).select();

  if (error) {
    alert(`Erro ao remover ingrediente: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    alert('Não foi possível remover o ingrediente. Verifique as permissões (RLS) de exclusão na tabela "ingredientes" do Supabase.');
    return;
  }

  carregarIngredientes();
}

function abrirMovimentacao(item, tipo, alvo = 'ingrediente') {
  movimentacaoAtual = { item, tipo, alvo };

  const unidadeLabel = alvo === 'produto' ? 'un' : (UNIDADE_LABEL[item.unidade] || item.unidade);
  const quantidadeAtual = alvo === 'produto' ? Number(item.estoque) || 0 : Number(item.quantidade) || 0;

  movimentacaoLabelTipo.textContent = alvo === 'produto' ? 'Produto' : 'Ingrediente';
  movimentacaoTitulo.textContent = tipo === 'entrada' ? 'Registrar entrada' : 'Registrar saída';
  movimentacaoNomeIngrediente.textContent = item.nome;
  movimentacaoEstoqueAtual.textContent = `${formatarQuantidade(quantidadeAtual)} ${unidadeLabel}`;
  botaoConfirmarMovimentacao.textContent = tipo === 'entrada' ? 'Confirmar entrada' : 'Confirmar saída';
  campoMovimentacaoQuantidade.step = alvo === 'produto' ? '1' : '0.01';
  campoMovimentacaoQuantidade.min = alvo === 'produto' ? '1' : '0.01';
  campoMovimentacaoQuantidade.value = '';
  movimentacaoErro.textContent = '';

  movimentacaoBackdrop.hidden = false;
  movimentacaoPainel.hidden = false;
  document.body.classList.add('sem-rolagem');
  campoMovimentacaoQuantidade.focus();
}

function fecharMovimentacao() {
  movimentacaoBackdrop.hidden = true;
  movimentacaoPainel.hidden = true;
  document.body.classList.remove('sem-rolagem');
  movimentacaoAtual = null;
}

async function confirmarMovimentacao(evento) {
  evento.preventDefault();
  movimentacaoErro.textContent = '';

  if (!movimentacaoAtual) return;

  const { item, tipo, alvo } = movimentacaoAtual;
  const quantidadeMovimentada = Number(campoMovimentacaoQuantidade.value);

  if (!quantidadeMovimentada || quantidadeMovimentada <= 0) {
    movimentacaoErro.textContent = 'Informe uma quantidade válida.';
    return;
  }

  const campoQuantidade = alvo === 'produto' ? 'estoque' : 'quantidade';
  const quantidadeAtual = Number(item[campoQuantidade]) || 0;
  let novaQuantidade;

  if (tipo === 'entrada') {
    novaQuantidade = quantidadeAtual + quantidadeMovimentada;
  } else {
    novaQuantidade = quantidadeAtual - quantidadeMovimentada;
    if (novaQuantidade < 0) {
      movimentacaoErro.textContent = 'Quantidade insuficiente em estoque.';
      return;
    }
  }

  const tabela = alvo === 'produto' ? 'produtos' : 'ingredientes';
  const { error } = await supabaseClient.from(tabela).update({ [campoQuantidade]: novaQuantidade }).eq('id', item.id);

  if (error) {
    movimentacaoErro.textContent = `Erro: ${error.message}`;
    return;
  }

  fecharMovimentacao();
  if (alvo === 'produto') {
    carregarProdutosEstoque();
  } else {
    carregarIngredientes();
  }
}

function renderizarGraficoVendas(pedidos) {
  graficoVendas.innerHTML = '';

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    data.setDate(data.getDate() - i);
    dias.push({ data, total: 0 });
  }

  pedidos.forEach((pedido) => {
    const dataPedido = new Date(pedido.criado_em);
    dataPedido.setHours(0, 0, 0, 0);
    const dia = dias.find((d) => d.data.getTime() === dataPedido.getTime());
    if (dia) dia.total += Number(pedido.total);
  });

  const maiorValor = Math.max(...dias.map((d) => d.total), 1);

  dias.forEach((dia) => {
    const coluna = document.createElement('div');
    coluna.className = 'grafico-coluna';

    const valor = document.createElement('span');
    valor.className = 'grafico-valor';
    valor.textContent = dia.total > 0 ? formatarPreco(dia.total) : '';

    const barra = document.createElement('div');
    barra.className = 'grafico-barra';
    const altura = dia.total > 0 ? Math.max((dia.total / maiorValor) * 100, 6) : 2;
    barra.style.height = `${altura}%`;

    const legenda = document.createElement('span');
    legenda.className = 'grafico-legenda';
    legenda.textContent = diasSemana[dia.data.getDay()];

    coluna.append(valor, barra, legenda);
    graficoVendas.appendChild(coluna);
  });
}

function renderizarRankingProdutos(itens) {
  rankingProdutos.innerHTML = '';

  if (!itens || itens.length === 0) {
    rankingProdutos.innerHTML = '<p class="mensagem-status">Nenhuma venda registrada ainda.</p>';
    return;
  }

  const totais = {};
  itens.forEach((item) => {
    totais[item.nome_produto] = (totais[item.nome_produto] || 0) + Number(item.quantidade);
  });

  const ranking = Object.entries(totais)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  ranking.forEach(([nome, quantidade], indice) => {
    const linha = document.createElement('div');
    linha.className = 'ranking-item';

    const posicao = document.createElement('span');
    posicao.className = 'ranking-posicao';
    posicao.textContent = `${indice + 1}º`;

    const nomeEl = document.createElement('span');
    nomeEl.className = 'ranking-nome';
    nomeEl.textContent = nome;

    const qtdEl = document.createElement('span');
    qtdEl.className = 'ranking-qtd';
    qtdEl.textContent = `${quantidade} vendidos`;

    linha.append(posicao, nomeEl, qtdEl);
    rankingProdutos.appendChild(linha);
  });
}

async function resetarDashboard() {
  if (!confirm('Apagar TODOS os pedidos e itens do dashboard? Isso não pode ser desfeito.')) return;

  const botao = document.getElementById('botaoResetDashboard');
  botao.disabled = true;
  botao.textContent = 'Apagando...';

  const { error } = await supabaseClient.rpc('resetar_pedidos');

  botao.disabled = false;
  botao.innerHTML = '🗑️ Resetar dados';

  if (error) {
    alert(`Erro ao resetar: ${error.message}`);
    return;
  }

  carregarDashboard();
}

// ===== CALENDÁRIO E EXTRATO =====

let _calMes = new Date().getMonth();
let _calAno = new Date().getFullYear();
let _pedidosCompletos = [];

const MESES_CAL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderizarCalendario(pedidos) {
  const grade = document.getElementById('calGrade');
  const label = document.getElementById('calMesLabel');
  if (!grade || !label) return;

  label.textContent = `${MESES_CAL[_calMes]} ${_calAno}`;

  const totalPorDia = {};
  pedidos.forEach((p) => {
    const d = new Date(p.criado_em);
    if (d.getFullYear() === _calAno && d.getMonth() === _calMes) {
      const dia = d.getDate();
      totalPorDia[dia] = (totalPorDia[dia] || 0) + Number(p.total);
    }
  });

  grade.innerHTML = '';
  const primeiroDia = new Date(_calAno, _calMes, 1).getDay();
  const diasNoMes = new Date(_calAno, _calMes + 1, 0).getDate();
  const hoje = new Date();

  for (let i = 0; i < primeiroDia; i++) {
    const cel = document.createElement('div');
    cel.className = 'cal-dia cal-dia-vazio';
    grade.appendChild(cel);
  }

  for (let d = 1; d <= diasNoMes; d++) {
    const cel = document.createElement('div');
    cel.className = 'cal-dia';
    const isHoje = d === hoje.getDate() && _calMes === hoje.getMonth() && _calAno === hoje.getFullYear();
    if (isHoje) cel.classList.add('cal-hoje');
    const total = totalPorDia[d];
    if (total) cel.classList.add('cal-tem-venda');

    const numEl = document.createElement('span');
    numEl.className = 'cal-dia-num';
    numEl.textContent = d;
    cel.appendChild(numEl);

    if (total) {
      const valEl = document.createElement('span');
      valEl.className = 'cal-dia-valor';
      valEl.textContent = formatarPreco(total);
      cel.appendChild(valEl);
    }

    grade.appendChild(cel);
  }
}

function renderizarExtrato(pedidos) {
  const lista = document.getElementById('extratoLista');
  const badge = document.getElementById('extratoBadge');
  if (!lista) return;
  if (badge) badge.textContent = pedidos.length;

  if (pedidos.length === 0) {
    lista.innerHTML = '<div class="estado-vazio"><span class="estado-vazio-icone">🧾</span><p>Nenhum pedido registrado ainda.</p></div>';
    return;
  }

  lista.innerHTML = '';
  const ordenados = [...pedidos].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));

  ordenados.forEach((pedido, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'extrato-item';

    const header = document.createElement('div');
    header.className = 'extrato-header';

    const meta = document.createElement('div');
    meta.className = 'extrato-meta';

    const num = document.createElement('span');
    num.className = 'extrato-num';
    num.textContent = `#${String(ordenados.length - i).padStart(3, '0')}`;

    const dataEl = document.createElement('span');
    dataEl.className = 'extrato-data';
    dataEl.textContent = new Date(pedido.criado_em).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    meta.append(num, dataEl);

    const direita = document.createElement('div');
    direita.className = 'extrato-direita';

    const totalEl = document.createElement('span');
    totalEl.className = 'extrato-total-val';
    totalEl.textContent = formatarPreco(pedido.total);

    const chevron = document.createElement('span');
    chevron.className = 'extrato-chevron';
    chevron.textContent = '▾';

    direita.append(totalEl, chevron);
    header.append(meta, direita);

    const detalhes = document.createElement('div');
    detalhes.className = 'extrato-detalhes';
    detalhes.hidden = true;

    (pedido.itens || []).forEach((it) => {
      const linha = document.createElement('div');
      linha.className = 'extrato-linha';

      const nome = document.createElement('span');
      nome.className = 'extrato-linha-nome';
      nome.textContent = `${it.quantidade}× ${it.nome_produto}`;

      const sub = document.createElement('span');
      sub.className = 'extrato-linha-sub';
      sub.textContent = formatarPreco(it.subtotal ?? (it.preco_unitario * it.quantidade));

      linha.append(nome, sub);
      detalhes.appendChild(linha);
    });

    if (!pedido.itens || pedido.itens.length === 0) {
      const sem = document.createElement('p');
      sem.className = 'mensagem-status';
      sem.style.padding = '12px 0';
      sem.textContent = 'Itens não disponíveis.';
      detalhes.appendChild(sem);
    }

    header.addEventListener('click', () => {
      detalhes.hidden = !detalhes.hidden;
      chevron.textContent = detalhes.hidden ? '▾' : '▴';
      wrap.classList.toggle('extrato-aberto', !detalhes.hidden);
    });

    wrap.append(header, detalhes);
    lista.appendChild(wrap);
  });
}

async function carregarDashboard() {
  statTotalPedidos.textContent = '...';
  statVendasHoje.textContent = '...';
  statVendasMes.textContent = '...';
  graficoVendas.innerHTML = '<p class="mensagem-status">Carregando...</p>';
  rankingProdutos.innerHTML = '<p class="mensagem-status">Carregando...</p>';
  const extratoLista = document.getElementById('extratoLista');
  if (extratoLista) extratoLista.innerHTML = '<p class="mensagem-status">Carregando...</p>';

  const { data: pedidos, error: erroPedidos } = await supabaseClient
    .from('pedidos')
    .select('id, criado_em, total')
    .order('criado_em', { ascending: true });

  if (erroPedidos) {
    statTotalPedidos.textContent = '–';
    statVendasHoje.textContent = '–';
    statVendasMes.textContent = '–';
    graficoVendas.innerHTML = `<p class="mensagem-erro">Erro ao carregar dados: ${erroPedidos.message}</p>`;
    rankingProdutos.innerHTML = '';
    return;
  }

  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  let vendasHoje = 0, vendasMes = 0;
  pedidos.forEach((pedido) => {
    const data = new Date(pedido.criado_em);
    if (data >= inicioMes) vendasMes += Number(pedido.total);
    if (data >= inicioHoje) vendasHoje += Number(pedido.total);
  });

  statTotalPedidos.textContent = pedidos.length;
  statVendasHoje.textContent = formatarPreco(vendasHoje);
  statVendasMes.textContent = formatarPreco(vendasMes);

  renderizarGraficoVendas(pedidos);
  renderizarCalendario(pedidos);
  _pedidosCompletos = pedidos;

  const { data: itens, error: erroItens } = await supabaseClient
    .from('pedido_itens')
    .select('pedido_id, nome_produto, quantidade, preco_unitario, subtotal');

  if (erroItens) {
    rankingProdutos.innerHTML = `<p class="mensagem-erro">Erro ao carregar produtos: ${erroItens.message}</p>`;
    return;
  }

  renderizarRankingProdutos(itens);

  // Junta itens aos pedidos para o extrato
  const itensPorPedido = {};
  itens.forEach((it) => {
    if (!itensPorPedido[it.pedido_id]) itensPorPedido[it.pedido_id] = [];
    itensPorPedido[it.pedido_id].push(it);
  });
  const pedidosComItens = pedidos.map((p) => ({ ...p, itens: itensPorPedido[p.id] || [] }));
  renderizarExtrato(pedidosComItens);
}

// ===== GERENCIAR CATEGORIAS =====

function atualizarSelectCategoria() {
  const categorias = obterCategorias();
  const valorAtual = campoCategoria.value;
  campoCategoria.innerHTML = '';
  categorias.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.slug;
    option.textContent = cat.nome;
    campoCategoria.appendChild(option);
  });
  if (valorAtual && categorias.some((c) => c.slug === valorAtual)) {
    campoCategoria.value = valorAtual;
  }
}

function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function renderizarListaCategorias() {
  const lista = document.getElementById('listaCategorias');
  if (!lista) return;

  lista.innerHTML = '';
  const categorias = obterCategorias();

  if (categorias.length === 0) {
    lista.innerHTML = '<p class="mensagem-status" style="padding:10px 0">Nenhuma categoria cadastrada.</p>';
    return;
  }

  categorias.forEach((cat, index) => {
    const item = document.createElement('div');
    item.className = 'item-categoria-admin';

    const botaoMoverEsq = document.createElement('button');
    botaoMoverEsq.type = 'button';
    botaoMoverEsq.className = 'botao-mover-categoria';
    botaoMoverEsq.title = 'Mover para a esquerda';
    botaoMoverEsq.innerHTML = '‹';
    botaoMoverEsq.disabled = index === 0;
    botaoMoverEsq.addEventListener('click', () => moverCategoria(index, -1));

    const emoji = document.createElement('span');
    emoji.className = 'categoria-emoji';
    emoji.textContent = cat.emoji || '🏷️';

    const nome = document.createElement('span');
    nome.textContent = cat.nome;

    const botaoMoverDir = document.createElement('button');
    botaoMoverDir.type = 'button';
    botaoMoverDir.className = 'botao-mover-categoria';
    botaoMoverDir.title = 'Mover para a direita';
    botaoMoverDir.innerHTML = '›';
    botaoMoverDir.disabled = index === categorias.length - 1;
    botaoMoverDir.addEventListener('click', () => moverCategoria(index, 1));

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'botao-remover-categoria';
    botaoRemover.title = 'Remover categoria';
    botaoRemover.textContent = '×';
    botaoRemover.addEventListener('click', () => removerCategoria(index));

    item.append(botaoMoverEsq, emoji, nome, botaoMoverDir, botaoRemover);
    lista.appendChild(item);
  });
}

function moverCategoria(index, delta) {
  const categorias = obterCategorias();
  const novoIndex = index + delta;
  if (novoIndex < 0 || novoIndex >= categorias.length) return;

  [categorias[index], categorias[novoIndex]] = [categorias[novoIndex], categorias[index]];
  salvarCategorias(categorias);
  renderizarListaCategorias();
  atualizarSelectCategoria();
}

function removerCategoria(index) {
  const categorias = obterCategorias();
  const cat = categorias[index];

  if (!confirm(`Remover a categoria "${cat.nome}"?\nProdutos nessa categoria continuarão existindo, mas não aparecerão em nenhum filtro.`)) return;

  categorias.splice(index, 1);
  salvarCategorias(categorias);
  renderizarListaCategorias();
  atualizarSelectCategoria();
}

function criarEmojiPicker(idTrigger, idPopup, idPicker, idCampo, aoEscolher) {
  const trigger = document.getElementById(idTrigger);
  const popup = document.getElementById(idPopup);
  const picker = document.getElementById(idPicker);
  const campoEmoji = document.getElementById(idCampo);

  if (!trigger || !popup || !picker) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.hidden = !popup.hidden;
  });

  picker.addEventListener('emoji-click', (e) => {
    const emoji = e.detail.unicode;
    trigger.textContent = emoji;
    if (campoEmoji) campoEmoji.value = emoji;
    popup.hidden = true;
    if (aoEscolher) aoEscolher(emoji);
  });

  document.addEventListener('click', (e) => {
    if (!popup.hidden && !popup.contains(e.target) && e.target !== trigger) {
      popup.hidden = true;
    }
  });
}

function iniciarEmojiPicker() {
  criarEmojiPicker('emojiTrigger', 'emojiPickerPopup', 'emojiPicker', 'campoCategoriaEmoji');
}

// ===== FRASE DO CARDÁPIO =====
const LEGENDA_PADRAO_TEXTO = 'Muito recheio, sabor inesquecível e carinho em cada detalhe!';
const LEGENDA_PADRAO_EMOJI = '🎂';

function atualizarPreviewLegenda() {
  const emoji = document.getElementById('campoLegendaEmoji')?.value.trim() || '';
  const texto = document.getElementById('campoLegendaTexto')?.value.trim() || '';
  const preview = document.getElementById('legendaPreview');
  if (!preview) return;
  preview.textContent = `${emoji} ${texto}`.trim() || 'Pré-visualização aparece aqui...';
}

async function carregarLegendaCardapio() {
  const { data, error } = await supabaseClient
    .from('configuracoes')
    .select('chave, valor')
    .in('chave', ['legenda_texto', 'legenda_emoji']);

  let texto = LEGENDA_PADRAO_TEXTO;
  let emoji = LEGENDA_PADRAO_EMOJI;

  if (!error && data) {
    const linhaTexto = data.find((d) => d.chave === 'legenda_texto');
    const linhaEmoji = data.find((d) => d.chave === 'legenda_emoji');
    if (linhaTexto?.valor) texto = linhaTexto.valor;
    if (linhaEmoji?.valor) emoji = linhaEmoji.valor;
  }

  const campoTexto = document.getElementById('campoLegendaTexto');
  const campoEmoji = document.getElementById('campoLegendaEmoji');
  const trigger = document.getElementById('emojiTriggerLegenda');
  if (campoTexto) campoTexto.value = texto;
  if (campoEmoji) campoEmoji.value = emoji;
  if (trigger) trigger.textContent = emoji;
  atualizarPreviewLegenda();
}

async function salvarLegendaCardapio() {
  const botao = document.getElementById('botaoSalvarLegenda');
  const texto = document.getElementById('campoLegendaTexto').value.trim() || LEGENDA_PADRAO_TEXTO;
  const emoji = document.getElementById('campoLegendaEmoji').value.trim() || LEGENDA_PADRAO_EMOJI;

  botao.disabled = true;
  botao.textContent = 'Salvando...';

  const { error } = await supabaseClient.from('configuracoes').upsert([
    { chave: 'legenda_texto', valor: texto },
    { chave: 'legenda_emoji', valor: emoji },
  ]);

  botao.disabled = false;
  botao.textContent = 'Salvar frase';

  if (error) {
    alert(`Erro ao salvar: ${error.message}`);
    return;
  }

  const msg = document.getElementById('legendaSalvoMsg');
  if (msg) { msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 2500); }
}

function adicionarCategoria(evento) {
  evento.preventDefault();

  const erroCat = document.getElementById('categoriaErro');
  erroCat.textContent = '';

  const nome = document.getElementById('campoCategoriaNome').value.trim();
  const emoji = document.getElementById('campoCategoriaEmoji').value.trim();

  if (!nome) return;

  const slug = gerarSlug(nome);
  if (!slug) {
    erroCat.textContent = 'Nome de categoria inválido.';
    return;
  }

  const categorias = obterCategorias();

  if (categorias.some((c) => c.slug === slug || c.nome.toLowerCase() === nome.toLowerCase())) {
    erroCat.textContent = 'Essa categoria já existe.';
    return;
  }

  categorias.push({ slug, nome, emoji: emoji || '🏷️' });
  salvarCategorias(categorias);
  renderizarListaCategorias();
  atualizarSelectCategoria();
  document.getElementById('formCategoria').reset();
  const trigger = document.getElementById('emojiTrigger');
  const campo = document.getElementById('campoCategoriaEmoji');
  if (trigger) trigger.textContent = '🥧';
  if (campo) campo.value = '🥧';
}

// ===== INSIGHTS =====

let clientesCache = [];

const LABEL_GENERO = { feminino: 'Feminino', masculino: 'Masculino', outro: 'Outro' };

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario = (hoje.getMonth() < nascimento.getMonth()) ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade >= 0 && idade < 120 ? idade : null;
}

async function carregarClientes() {
  const { data, error } = await supabaseClient
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false });

  clientesCache = error ? [] : (data || []);
}

function renderizarPerfilResumo() {
  const container = document.getElementById('perfilResumo');
  if (!container) return;

  if (clientesCache.length === 0) {
    container.innerHTML = '<p class="mensagem-status">Nenhum cliente cadastrado ainda.</p>';
    return;
  }

  const generos = { feminino: 0, masculino: 0, outro: 0, naoInformado: 0 };
  clientesCache.forEach((cliente) => {
    const chave = cliente.genero && generos.hasOwnProperty(cliente.genero) ? cliente.genero : 'naoInformado';
    generos[chave]++;
  });

  container.innerHTML = '';

  [['feminino', 'Feminino'], ['masculino', 'Masculino'], ['outro', 'Outro'], ['naoInformado', 'Não informado']].forEach(([chave, label]) => {
    if (generos[chave] === 0) return;
    const linha = document.createElement('div');
    linha.className = 'ranking-item';
    const nomeEl = document.createElement('span');
    nomeEl.className = 'ranking-nome';
    nomeEl.textContent = label;
    const qtdEl = document.createElement('span');
    qtdEl.className = 'ranking-qtd';
    qtdEl.textContent = `${generos[chave]} cliente(s)`;
    linha.append(nomeEl, qtdEl);
    container.appendChild(linha);
  });
}

const FAIXAS_ETARIAS = [
  { label: 'Até 17 anos', min: 0, max: 17, cor: '#FDBA74' },
  { label: '18 a 24 anos', min: 18, max: 24, cor: '#FEF08A' },
  { label: '25 a 34 anos', min: 25, max: 34, cor: '#A7F3D0' },
  { label: '35 a 44 anos', min: 35, max: 44, cor: '#FBCFE8' },
  { label: '45 a 59 anos', min: 45, max: 59, cor: '#93C5FD' },
  { label: '60 anos ou mais', min: 60, max: 999, cor: '#FCA5A5' },
];
const COR_SEM_INFORMACAO = '#D1D5DB';

function renderizarGraficoFaixaEtaria() {
  const graficoEl = document.getElementById('graficoFaixaEtaria');
  const legendaEl = document.getElementById('legendaFaixaEtaria');
  if (!graficoEl || !legendaEl) return;

  const contagens = FAIXAS_ETARIAS.map(() => 0);
  let semInformacao = 0;

  clientesCache.forEach((cliente) => {
    const idade = calcularIdade(cliente.data_nascimento);
    if (idade === null) { semInformacao++; return; }
    const indice = FAIXAS_ETARIAS.findIndex((f) => idade >= f.min && idade <= f.max);
    if (indice >= 0) contagens[indice]++;
    else semInformacao++;
  });

  const partes = FAIXAS_ETARIAS
    .map((faixa, i) => ({ label: faixa.label, valor: contagens[i], cor: faixa.cor }))
    .filter((p) => p.valor > 0);
  if (semInformacao > 0) partes.push({ label: 'Não informado', valor: semInformacao, cor: COR_SEM_INFORMACAO });

  const total = partes.reduce((soma, p) => soma + p.valor, 0);

  legendaEl.innerHTML = '';

  if (total === 0) {
    graficoEl.style.background = 'var(--amarelo-claro)';
    legendaEl.innerHTML = '<p class="mensagem-status">Sem dados suficientes.</p>';
    return;
  }

  let acumulado = 0;
  const segmentos = partes.map((parte) => {
    const inicio = (acumulado / total) * 360;
    acumulado += parte.valor;
    const fim = (acumulado / total) * 360;
    return `${parte.cor} ${inicio}deg ${fim}deg`;
  });
  graficoEl.style.background = `conic-gradient(${segmentos.join(', ')})`;

  partes.forEach((parte) => {
    const linha = document.createElement('div');
    linha.className = 'legenda-item';

    const cor = document.createElement('span');
    cor.className = 'legenda-cor';
    cor.style.background = parte.cor;

    const texto = document.createElement('span');
    const pct = Math.round((parte.valor / total) * 100);
    texto.textContent = `${parte.label} — ${parte.valor} (${pct}%)`;

    linha.append(cor, texto);
    legendaEl.appendChild(linha);
  });
}

function renderizarListaClientesInsights(termoBusca) {
  const lista = document.getElementById('listaClientesInsights');
  const badge = document.getElementById('contagemClientesInsights');
  if (!lista) return;
  if (badge) badge.textContent = clientesCache.length;
  lista.innerHTML = '';

  if (clientesCache.length === 0) {
    lista.innerHTML = '<div class="estado-vazio"><span class="estado-vazio-icone">👥</span><p>Nenhum cliente cadastrado ainda.</p></div>';
    return;
  }

  const termo = termoBusca.trim().toLowerCase();
  const filtrados = termo
    ? clientesCache.filter((c) => c.email.toLowerCase().includes(termo))
    : clientesCache;

  if (filtrados.length === 0) {
    lista.innerHTML = `<p class="mensagem-status">Nenhum resultado para "${termoBusca}".</p>`;
    return;
  }

  filtrados.forEach((cliente) => {
    const item = document.createElement('div');
    item.className = 'item-cliente';

    const icone = document.createElement('div');
    icone.className = 'cliente-icone';
    icone.textContent = '👤';

    const info = document.createElement('div');
    info.className = 'cliente-info';

    const email = document.createElement('div');
    email.className = 'cliente-email';
    email.textContent = cliente.email;

    const detalhes = [];
    if (cliente.genero && LABEL_GENERO[cliente.genero]) detalhes.push(LABEL_GENERO[cliente.genero]);
    if (cliente.data_nascimento) {
      const idade = calcularIdade(cliente.data_nascimento);
      const dataFmt = new Date(`${cliente.data_nascimento}T00:00:00`).toLocaleDateString('pt-BR');
      detalhes.push(idade !== null ? `${dataFmt} (${idade} anos)` : dataFmt);
    }

    const data = document.createElement('div');
    data.className = 'cliente-data';
    data.textContent = detalhes.length > 0
      ? detalhes.join(' · ')
      : `Cadastrado em ${new Date(cliente.criado_em).toLocaleDateString('pt-BR')}`;

    info.append(email, data);
    item.append(icone, info);
    lista.appendChild(item);
  });
}

function renderizarRankingVisualizados(eventos) {
  const container = document.getElementById('rankingVisualizados');
  if (!container) return;
  container.innerHTML = '';

  const visualizacoes = eventos.filter((e) => e.tipo === 'visualizacao_produto' && e.produto_nome);

  if (visualizacoes.length === 0) {
    container.innerHTML = '<p class="mensagem-status">Nenhuma visualização registrada ainda.</p>';
    return;
  }

  const totais = {};
  visualizacoes.forEach((e) => {
    totais[e.produto_nome] = (totais[e.produto_nome] || 0) + 1;
  });

  const ranking = Object.entries(totais).sort((a, b) => b[1] - a[1]).slice(0, 5);

  ranking.forEach(([nome, total], indice) => {
    const linha = document.createElement('div');
    linha.className = 'ranking-item';

    const posicao = document.createElement('span');
    posicao.className = 'ranking-posicao';
    posicao.textContent = `${indice + 1}º`;

    const nomeEl = document.createElement('span');
    nomeEl.className = 'ranking-nome';
    nomeEl.textContent = nome;

    const qtdEl = document.createElement('span');
    qtdEl.className = 'ranking-qtd';
    qtdEl.textContent = `${total} visualizações`;

    linha.append(posicao, nomeEl, qtdEl);
    container.appendChild(linha);
  });
}

async function carregarInsights() {
  document.getElementById('statVisitas').textContent = '...';
  document.getElementById('statCliquesWhatsapp').textContent = '...';
  document.getElementById('statConversao').textContent = '...';
  document.getElementById('rankingVisualizados').innerHTML = '<p class="mensagem-status">Carregando...</p>';
  document.getElementById('perfilResumo').innerHTML = '<p class="mensagem-status">Carregando...</p>';
  document.getElementById('listaClientesInsights').innerHTML = '<p class="mensagem-status">Carregando...</p>';

  await carregarClientes();
  renderizarPerfilResumo();
  renderizarGraficoFaixaEtaria();
  renderizarListaClientesInsights('');

  const { data: eventos, error: erroEventos } = await supabaseClient
    .from('eventos_analytics')
    .select('tipo, produto_nome');

  if (erroEventos) {
    document.getElementById('statVisitas').textContent = '–';
    document.getElementById('statCliquesWhatsapp').textContent = '–';
    document.getElementById('statConversao').textContent = '–';
    document.getElementById('rankingVisualizados').innerHTML = `<p class="mensagem-erro">Erro ao carregar dados: ${erroEventos.message}</p>`;
    return;
  }

  const { count: totalPedidos } = await supabaseClient
    .from('pedidos')
    .select('id', { count: 'exact', head: true });

  const visitas = eventos.filter((e) => e.tipo === 'visita').length;
  const cliquesWhatsapp = eventos.filter((e) => e.tipo === 'clique_whatsapp').length;
  const conversao = visitas > 0 ? ((totalPedidos || 0) / visitas) * 100 : 0;

  document.getElementById('statVisitas').textContent = visitas;
  document.getElementById('statCliquesWhatsapp').textContent = cliquesWhatsapp;
  document.getElementById('statConversao').textContent = `${conversao.toFixed(1)}%`;

  renderizarRankingVisualizados(eventos);
}

async function resetarInsights() {
  if (!confirm('Apagar TODOS os dados de visitas, visualizações e cliques registrados? Isso não pode ser desfeito.')) return;

  const botao = document.getElementById('botaoResetInsights');
  botao.disabled = true;
  botao.textContent = 'Apagando...';

  const { error } = await supabaseClient.from('eventos_analytics').delete().not('id', 'is', null);

  botao.disabled = false;
  botao.innerHTML = '🗑️ Resetar dados';

  if (error) {
    alert(`Erro ao resetar: ${error.message}`);
    return;
  }

  carregarInsights();
}

async function entrarPainel() {
  mostrarTela('painelHome');
}

async function fazerLogin(evento) {
  evento.preventDefault();
  loginErro.textContent = '';

  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

  if (error) {
    loginErro.textContent = 'E-mail ou senha inválidos.';
    return;
  }

  entrarPainel();
}

async function fazerLogout() {
  await supabaseClient.auth.signOut();
  limparFormulario();
  mostrarTela('login');
}

// ===== PLANILHA DE PRECIFICAÇÃO =====
const PREC_KEY = 'flabelli_precificacoes';
let _precReceitas = [];
let _precAtual = null;

function _precId() {
  return `p${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

function _precFmt(val) {
  return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function _precCarregar() {
  try { _precReceitas = JSON.parse(localStorage.getItem(PREC_KEY) || '[]'); } catch { _precReceitas = []; }
}

function _precSalvarStorage() {
  localStorage.setItem(PREC_KEY, JSON.stringify(_precReceitas));
}

function _precNovaReceita() {
  return { id: _precId(), nome: '', ingredientes: [], receita: [], rendimento: 1, margem: 40 };
}

function _precAtualizarSeletor() {
  const sel = document.getElementById('precSeletorReceita');
  if (!sel) return;
  const atual = sel.value;
  sel.innerHTML = '<option value="">— Selecionar receita —</option>';
  _precReceitas.forEach((r) => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.nome || 'Sem nome';
    if (r.id === (_precAtual?.id)) opt.selected = true;
    sel.appendChild(opt);
  });
  if (!_precAtual) sel.value = '';
}

const _UNIDADES = ['g', 'kg', 'mL', 'L', 'un', 'cx', 'pct', 'fatia'];

function _precRenderizarIngredientes() {
  const tbody = document.getElementById('precBodyIng');
  if (!tbody || !_precAtual) return;
  tbody.innerHTML = '';

  if (_precAtual.ingredientes.length === 0) {
    tbody.innerHTML = '<tr class="prec-linha-vazia"><td colspan="7">Nenhum ingrediente ainda. Clique em "+ Adicionar" para começar.</td></tr>';
    return;
  }

  _precAtual.ingredientes.forEach((ing) => {
    const tr = document.createElement('tr');
    tr.dataset.id = ing.id;

    const optsUn = _UNIDADES.map((u) => `<option${ing.unidade === u ? ' selected' : ''}>${u}</option>`).join('');
    const custoUn = (ing.custo > 0 && ing.qtdCompra > 0) ? ing.custo / ing.qtdCompra : 0;
    const custoUnStr = custoUn > 0
      ? `R$ ${custoUn.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/${ing.unidade || 'un'}`
      : '—';

    tr.innerHTML = `
      <td><input class="prec-cell" type="text" placeholder="Ex: Farinha de trigo" value="${ing.nome || ''}" data-f="nome"></td>
      <td><input class="prec-cell prec-cell--num" type="number" placeholder="0,00" step="0.01" min="0" value="${ing.custo > 0 ? ing.custo : ''}" data-f="custo"></td>
      <td><input class="prec-cell prec-cell--num" type="number" placeholder="Ex: 1000" step="0.001" min="0" value="${ing.qtdCompra > 0 ? ing.qtdCompra : ''}" data-f="qtdCompra"></td>
      <td><select class="prec-cell prec-cell--sel" data-f="unidade">${optsUn}</select></td>
      <td class="prec-cell-custon">${custoUnStr}</td>
      <td><button type="button" class="prec-btn-del" data-del-ing="${ing.id}">×</button></td>
    `;

    const atualizarCustoUn = () => {
      const cu = (ing.custo > 0 && ing.qtdCompra > 0) ? ing.custo / ing.qtdCompra : 0;
      const s = cu > 0
        ? `R$ ${cu.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}/${ing.unidade || 'un'}`
        : '—';
      tr.querySelector('.prec-cell-custon').textContent = s;
    };

    tr.querySelectorAll('[data-f]').forEach((el) => {
      const ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, () => {
        const f = el.dataset.f;
        ing[f] = (f === 'nome' || f === 'unidade') ? el.value : (Number(el.value) || 0);
        if (f !== 'nome') { atualizarCustoUn(); _precAtualizarCustosRec(); _precCalcular(); }
        if (f === 'unidade') atualizarCustoUn();
      });
    });

    tr.querySelector('[data-del-ing]').addEventListener('click', () => {
      _precAtual.ingredientes = _precAtual.ingredientes.filter((i) => i.id !== ing.id);
      _precAtual.receita = _precAtual.receita.filter((r) => r.ingredienteId !== ing.id);
      _precRenderizarIngredientes();
      _precRenderizarReceita();
      _precCalcular();
    });

    tbody.appendChild(tr);
  });
}

function _precRenderizarReceita() {
  const tbody = document.getElementById('precBodyRec');
  if (!tbody || !_precAtual) return;
  tbody.innerHTML = '';

  if (_precAtual.receita.length === 0) {
    tbody.innerHTML = '<tr class="prec-linha-vazia"><td colspan="4">Adicione ingredientes na seção 1 e monte sua receita aqui.</td></tr>';
    return;
  }

  _precAtual.receita.forEach((item) => {
    const ing = _precAtual.ingredientes.find((i) => i.id === item.ingredienteId);
    const custo = ing ? (ing.qtdCompra > 0 ? ing.custo / ing.qtdCompra : 0) * (item.quantidade || 0) : 0;

    const tr = document.createElement('tr');
    tr.dataset.id = item.id;

    const opts = _precAtual.ingredientes.map((i) =>
      `<option value="${i.id}"${item.ingredienteId === i.id ? ' selected' : ''}>${i.nome || '(sem nome)'}</option>`
    ).join('');

    tr.innerHTML = `
      <td>
        <select class="prec-cell prec-cell--sel prec-cell--sel-ing">
          <option value="">— Selecionar —</option>
          ${opts}
        </select>
      </td>
      <td>
        <div class="prec-qtd-wrap">
          <input class="prec-cell prec-cell--num" type="number" placeholder="0" step="0.001" min="0" value="${item.quantidade > 0 ? item.quantidade : ''}">
          <span class="prec-qtd-un">${ing ? ing.unidade : ''}</span>
        </div>
      </td>
      <td class="prec-cell-custo">${_precFmt(custo)}</td>
      <td><button type="button" class="prec-btn-del" data-del-rec="${item.id}">×</button></td>
    `;

    tr.querySelector('.prec-cell--sel-ing').addEventListener('change', (e) => {
      item.ingredienteId = e.target.value;
      _precRenderizarReceita();
      _precCalcular();
    });

    tr.querySelector('.prec-cell--num').addEventListener('input', (e) => {
      item.quantidade = Number(e.target.value) || 0;
      const i = _precAtual.ingredientes.find((x) => x.id === item.ingredienteId);
      const c = i ? (i.qtdCompra > 0 ? i.custo / i.qtdCompra : 0) * item.quantidade : 0;
      tr.querySelector('.prec-cell-custo').textContent = _precFmt(c);
      _precCalcular();
    });

    tr.querySelector('[data-del-rec]').addEventListener('click', () => {
      _precAtual.receita = _precAtual.receita.filter((r) => r.id !== item.id);
      _precRenderizarReceita();
      _precCalcular();
    });

    tbody.appendChild(tr);
  });
}

function _precAtualizarCustosRec() {
  const tbody = document.getElementById('precBodyRec');
  if (!tbody || !_precAtual) return;
  _precAtual.receita.forEach((item) => {
    const ing = _precAtual.ingredientes.find((i) => i.id === item.ingredienteId);
    const custo = ing ? (ing.qtdCompra > 0 ? ing.custo / ing.qtdCompra : 0) * (item.quantidade || 0) : 0;
    const tr = tbody.querySelector(`[data-id="${item.id}"]`);
    if (tr) tr.querySelector('.prec-cell-custo').textContent = _precFmt(custo);
  });
}

function _precCalcular() {
  if (!_precAtual) return;
  const custoTotal = _precAtual.receita.reduce((acc, item) => {
    const ing = _precAtual.ingredientes.find((i) => i.id === item.ingredienteId);
    return acc + (ing ? (ing.qtdCompra > 0 ? ing.custo / ing.qtdCompra : 0) * (item.quantidade || 0) : 0);
  }, 0);
  const rend = Number(document.getElementById('precRendimento')?.value) || 1;
  const margem = Number(document.getElementById('precMargem')?.value) || 0;
  const custoPorUn = custoTotal / rend;
  const precoFinal = custoPorUn * (1 + margem / 100);
  const lucroUn = precoFinal - custoPorUn;

  const el = (id) => document.getElementById(id);
  if (el('precCustoTotal')) el('precCustoTotal').textContent = _precFmt(custoTotal);
  if (el('precCustoUnidade')) el('precCustoUnidade').textContent = _precFmt(custoPorUn);
  if (el('precPrecoFinal')) el('precPrecoFinal').textContent = _precFmt(precoFinal);
  if (el('precLucroUnidade')) {
    el('precLucroUnidade').textContent = _precFmt(lucroUn);
    el('precLucroUnidade').className = `prec-resultado-val${lucroUn >= 0 ? ' prec-lucro-val' : ' prec-prejuizo-val'}`;
  }
  if (_precAtual) { _precAtual.rendimento = rend; _precAtual.margem = margem; }
}

function _precCarregarNoForm(receita) {
  _precAtual = receita;
  const el = (id) => document.getElementById(id);
  if (el('precNomeReceita')) el('precNomeReceita').value = receita.nome || '';
  if (el('precRendimento')) el('precRendimento').value = receita.rendimento || 1;
  if (el('precMargem')) el('precMargem').value = receita.margem ?? 40;
  _precRenderizarIngredientes();
  _precRenderizarReceita();
  _precCalcular();
  if (el('precBtnExcluir')) el('precBtnExcluir').hidden = false;
}

function _precIniciarNova() {
  _precAtual = _precNovaReceita();
  const el = (id) => document.getElementById(id);
  if (el('precNomeReceita')) el('precNomeReceita').value = '';
  if (el('precRendimento')) el('precRendimento').value = 1;
  if (el('precMargem')) el('precMargem').value = 40;
  _precRenderizarIngredientes();
  _precRenderizarReceita();
  _precCalcular();
  if (el('precBtnExcluir')) el('precBtnExcluir').hidden = true;
  if (el('precSeletorReceita')) el('precSeletorReceita').value = '';
}

function _precSalvar() {
  if (!_precAtual) return;
  _precAtual.nome = document.getElementById('precNomeReceita')?.value.trim() || 'Sem nome';
  _precAtual.rendimento = Number(document.getElementById('precRendimento')?.value) || 1;
  _precAtual.margem = Number(document.getElementById('precMargem')?.value) || 0;
  const idx = _precReceitas.findIndex((r) => r.id === _precAtual.id);
  if (idx >= 0) _precReceitas[idx] = _precAtual; else _precReceitas.push(_precAtual);
  _precSalvarStorage();
  _precAtualizarSeletor();
  const msg = document.getElementById('precSalvoMsg');
  if (msg) { msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 2500); }
}

function _precExcluir() {
  if (!_precAtual) return;
  if (!confirm(`Excluir a receita "${_precAtual.nome || 'sem nome'}"? Esta ação não pode ser desfeita.`)) return;
  _precReceitas = _precReceitas.filter((r) => r.id !== _precAtual.id);
  _precSalvarStorage();
  _precIniciarNova();
  _precAtualizarSeletor();
}

function inicializarPrecificacao() {
  _precCarregar();
  _precAtualizarSeletor();
  _precIniciarNova();

  document.getElementById('precSeletorReceita')?.addEventListener('change', (e) => {
    const r = _precReceitas.find((x) => x.id === e.target.value);
    if (r) _precCarregarNoForm(r); else _precIniciarNova();
  });
  document.getElementById('precBtnNova')?.addEventListener('click', () => { _precIniciarNova(); _precAtualizarSeletor(); });
  document.getElementById('precNomeReceita')?.addEventListener('input', (e) => { if (_precAtual) _precAtual.nome = e.target.value; });
  document.getElementById('precBtnAddIng')?.addEventListener('click', () => {
    if (!_precAtual) return;
    _precAtual.ingredientes.push({ id: _precId(), nome: '', custo: 0, qtdCompra: 0, unidade: 'g' });
    _precRenderizarIngredientes();
  });
  document.getElementById('precBtnAddItem')?.addEventListener('click', () => {
    if (!_precAtual) return;
    _precAtual.receita.push({ id: _precId(), ingredienteId: '', quantidade: 0 });
    _precRenderizarReceita();
    _precCalcular();
  });
  document.getElementById('precRendimento')?.addEventListener('input', _precCalcular);
  document.getElementById('precMargem')?.addEventListener('input', _precCalcular);
  document.getElementById('precBtnSalvar')?.addEventListener('click', _precSalvar);
  document.getElementById('precBtnExcluir')?.addEventListener('click', _precExcluir);
}

// ===== PLANILHA MANUAL =====
const PLANM_KEY = 'flabelli_planilha_manual';
let _planmSheets = [];
let _planmAtual = null;

function _planmId() {
  return `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

function _planmConteudoPadrao() {
  return {
    headers: ['Produto', 'Ingrediente', 'Quantidade', 'Custo (R$)', 'Observação'],
    rows: Array.from({ length: 6 }, () => Array(5).fill('')),
  };
}

function _planmNovaObj() {
  return { id: _planmId(), nome: '', ..._planmConteudoPadrao() };
}

function _planmCarregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(PLANM_KEY) || 'null');
    if (Array.isArray(dados)) {
      _planmSheets = dados;
    } else if (dados && dados.headers) {
      // migração do formato antigo (planilha única, sem nome)
      _planmSheets = [{ id: _planmId(), nome: 'Minha planilha', headers: dados.headers, rows: dados.rows }];
      localStorage.setItem(PLANM_KEY, JSON.stringify(_planmSheets));
    } else {
      _planmSheets = [];
    }
  } catch { _planmSheets = []; }
}

function _planmSalvarStorage() {
  localStorage.setItem(PLANM_KEY, JSON.stringify(_planmSheets));
}

function _planmAtualizarSeletor() {
  const sel = document.getElementById('planmSeletor');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Selecionar planilha —</option>';
  _planmSheets.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome || 'Sem nome';
    if (p.id === _planmAtual?.id) opt.selected = true;
    sel.appendChild(opt);
  });
  if (!_planmAtual) sel.value = '';
}

function _planmCarregarNoForm(planilha) {
  _planmAtual = planilha;
  const nomeEl = document.getElementById('planmNome');
  if (nomeEl) nomeEl.value = planilha.nome || '';
  _planmRenderizar();
  const btnExcluir = document.getElementById('planmBtnExcluir');
  if (btnExcluir) btnExcluir.hidden = false;
}

function _planmIniciarNova() {
  _planmAtual = _planmNovaObj();
  const nomeEl = document.getElementById('planmNome');
  if (nomeEl) nomeEl.value = '';
  _planmRenderizar();
  const btnExcluir = document.getElementById('planmBtnExcluir');
  if (btnExcluir) btnExcluir.hidden = true;
  const sel = document.getElementById('planmSeletor');
  if (sel) sel.value = '';
}

function _planmSalvar() {
  if (!_planmAtual) return;
  _planmAtual.nome = document.getElementById('planmNome')?.value.trim() || 'Sem nome';
  const idx = _planmSheets.findIndex((p) => p.id === _planmAtual.id);
  if (idx >= 0) _planmSheets[idx] = _planmAtual; else _planmSheets.push(_planmAtual);
  _planmSalvarStorage();
  _planmAtualizarSeletor();
  const btnExcluir = document.getElementById('planmBtnExcluir');
  if (btnExcluir) btnExcluir.hidden = false;
  const msg = document.getElementById('planmSalvoMsg');
  if (msg) { msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 2500); }
}

function _planmExcluir() {
  if (!_planmAtual) return;
  if (!confirm(`Excluir a planilha "${_planmAtual.nome || 'sem nome'}"? Esta ação não pode ser desfeita.`)) return;
  _planmSheets = _planmSheets.filter((p) => p.id !== _planmAtual.id);
  _planmSalvarStorage();
  _planmIniciarNova();
  _planmAtualizarSeletor();
}

function _planmFocarCelula(linha, col) {
  const tabela = document.getElementById('planmTabela');
  if (!tabela) return;
  const el = linha === -1
    ? tabela.querySelectorAll('.planm-header-input')[col]
    : tabela.querySelector(`[data-pl="${linha}-${col}"]`);
  if (el) { el.focus(); el.select(); }
}

function _planmNavegar(e, linha, col) {
  const nCols = _planmAtual.headers.length;
  const nLinhas = _planmAtual.rows.length;

  if (e.key === 'Tab') {
    e.preventDefault();
    if (col + 1 < nCols) {
      _planmFocarCelula(linha, col + 1);
    } else if (linha + 1 < nLinhas) {
      _planmFocarCelula(linha + 1, 0);
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (linha === -1) { _planmFocarCelula(0, col); return; }
    if (linha + 1 < nLinhas) {
      _planmFocarCelula(linha + 1, col);
    } else {
      _planmAddLinha();
      setTimeout(() => _planmFocarCelula(linha + 1, col), 30);
    }
  } else if (e.key === 'ArrowDown' && !e.shiftKey) {
    if (linha + 1 < nLinhas) { e.preventDefault(); _planmFocarCelula(linha + 1, col); }
  } else if (e.key === 'ArrowUp') {
    if (linha > 0) { e.preventDefault(); _planmFocarCelula(linha - 1, col); }
    else if (linha === 0) { e.preventDefault(); _planmFocarCelula(-1, col); }
  }
}

function _planmRenderizar() {
  const tabela = document.getElementById('planmTabela');
  if (!tabela || !_planmAtual) return;
  tabela.innerHTML = '';

  // ── CABEÇALHO ──
  const thead = tabela.createTHead();
  const trH = thead.insertRow();

  // célula de número de linha (vazia)
  const thCorner = document.createElement('th');
  thCorner.className = 'planm-th-corner';
  trH.appendChild(thCorner);

  _planmAtual.headers.forEach((h, j) => {
    const th = document.createElement('th');
    th.className = 'planm-th';

    const inp = document.createElement('input');
    inp.className = 'planm-header-input';
    inp.type = 'text';
    inp.value = h;
    inp.placeholder = `Coluna ${j + 1}`;
    inp.addEventListener('input', () => { _planmAtual.headers[j] = inp.value; });
    inp.addEventListener('keydown', (e) => _planmNavegar(e, -1, j));

    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'planm-btn-del-col';
    btnDel.textContent = '×';
    btnDel.title = 'Remover coluna';
    btnDel.addEventListener('click', () => {
      if (_planmAtual.headers.length <= 1) return;
      _planmAtual.headers.splice(j, 1);
      _planmAtual.rows.forEach((r) => r.splice(j, 1));
      _planmRenderizar();
    });

    th.append(inp, btnDel);
    trH.appendChild(th);
  });

  // coluna do botão excluir linha (header vazio)
  const thDel = document.createElement('th');
  thDel.className = 'planm-th-del';
  trH.appendChild(thDel);

  // ── CORPO ──
  const tbody = tabela.createTBody();

  _planmAtual.rows.forEach((row, i) => {
    const tr = tbody.insertRow();
    tr.className = i % 2 === 0 ? 'planm-row-par' : 'planm-row-impar';

    // número da linha
    const tdNum = tr.insertCell();
    tdNum.className = 'planm-td-num';
    tdNum.textContent = i + 1;

    row.forEach((val, j) => {
      const td = tr.insertCell();
      td.className = 'planm-td';

      const inp = document.createElement('input');
      inp.className = 'planm-cell-input';
      inp.type = 'text';
      inp.value = val;
      inp.dataset.pl = `${i}-${j}`;
      inp.addEventListener('input', () => { _planmAtual.rows[i][j] = inp.value; });
      inp.addEventListener('keydown', (e) => _planmNavegar(e, i, j));
      inp.addEventListener('focus', () => tr.classList.add('planm-row-focus'));
      inp.addEventListener('blur', () => tr.classList.remove('planm-row-focus'));

      td.appendChild(inp);
    });

    // botão excluir linha
    const tdDel = tr.insertCell();
    tdDel.className = 'planm-td-del';
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'planm-btn-del-row';
    btnDel.textContent = '×';
    btnDel.title = 'Remover linha';
    btnDel.addEventListener('click', () => {
      if (_planmAtual.rows.length <= 1) return;
      _planmAtual.rows.splice(i, 1);
      _planmRenderizar();
    });
    tdDel.appendChild(btnDel);
  });
}

function _planmAddLinha() {
  if (!_planmAtual) return;
  _planmAtual.rows.push(Array(_planmAtual.headers.length).fill(''));
  _planmRenderizar();
}

function _planmAddColuna() {
  if (!_planmAtual) return;
  _planmAtual.headers.push(`Coluna ${_planmAtual.headers.length + 1}`);
  _planmAtual.rows.forEach((r) => r.push(''));
  _planmRenderizar();
}

function inicializarPlanilhaManual() {
  _planmCarregar();
  _planmAtualizarSeletor();
  _planmIniciarNova();

  document.getElementById('planmSeletor')?.addEventListener('change', (e) => {
    const p = _planmSheets.find((x) => x.id === e.target.value);
    if (p) _planmCarregarNoForm(p); else _planmIniciarNova();
  });
  document.getElementById('planmBtnNova')?.addEventListener('click', () => { _planmIniciarNova(); _planmAtualizarSeletor(); });
  document.getElementById('planmBtnSalvar')?.addEventListener('click', _planmSalvar);
  document.getElementById('planmBtnExcluir')?.addEventListener('click', _planmExcluir);
  document.getElementById('planmBtnAddLinha')?.addEventListener('click', _planmAddLinha);
  document.getElementById('planmBtnAddColuna')?.addEventListener('click', _planmAddColuna);
  document.getElementById('planmBtnLimpar')?.addEventListener('click', () => {
    if (!confirm('Limpar toda a planilha? Os dados serão apagados.')) return;
    const id = _planmAtual.id;
    const nome = _planmAtual.nome;
    _planmAtual = { id, nome, ..._planmConteudoPadrao() };
    _planmRenderizar();
  });
}

// ===== MINI CALCULADORA =====
(function () {
  let _val = '0';
  let _primeiro = null;
  let _op = null;
  let _aguardando = false;

  function _arred(n) { return Math.round(n * 1e10) / 1e10; }

  function _fmt(str) {
    if (str === 'Erro') return 'Erro';
    const n = parseFloat(str);
    if (isNaN(n)) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e13) return n.toExponential(4);
    // Mantém casas decimais digitadas
    return str;
  }

  function _atualizar() {
    const elVal = document.getElementById('calcValor');
    const elHist = document.getElementById('calcHistorico');
    if (!elVal) return;
    const txt = _fmt(_val);
    elVal.textContent = txt;
    elVal.style.fontSize = txt.length > 11 ? '18px' : txt.length > 8 ? '24px' : txt.length > 5 ? '30px' : '38px';
    if (elHist) elHist.textContent = _op && _primeiro !== null ? `${_arred(_primeiro)} ${_op}` : '';
  }

  function _digitarNum(n) {
    const elAC = document.getElementById('calcBtnAC');
    if (elAC) elAC.textContent = 'C';
    if (_aguardando) {
      _val = n === '.' ? '0.' : String(n);
      _aguardando = false;
    } else {
      if (n === '.' && _val.includes('.')) return;
      if (_val === '0' && n !== '.') _val = String(n);
      else _val = _val + String(n);
    }
    _atualizar();
  }

  function _calcular(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Erro';
      default: return b;
    }
  }

  function _operador(op) {
    const atual = parseFloat(_val);
    if (_primeiro !== null && !_aguardando) {
      const res = _calcular(_primeiro, atual, _op);
      _val = res === 'Erro' ? 'Erro' : String(_arred(res));
      _primeiro = res === 'Erro' ? null : res;
    } else {
      _primeiro = atual;
    }
    _op = op;
    _aguardando = true;
    _atualizar();
  }

  function _igual() {
    if (_primeiro === null || _op === null || _aguardando) return;
    const b = parseFloat(_val);
    const elHist = document.getElementById('calcHistorico');
    if (elHist) elHist.textContent = `${_arred(_primeiro)} ${_op} ${b} =`;
    const res = _calcular(_primeiro, b, _op);
    _val = res === 'Erro' ? 'Erro' : String(_arred(res));
    _primeiro = null;
    _op = null;
    _aguardando = true;
    _atualizar();
  }

  function _limpar(tudo) {
    if (tudo) {
      _val = '0'; _primeiro = null; _op = null; _aguardando = false;
      const elAC = document.getElementById('calcBtnAC');
      if (elAC) elAC.textContent = 'AC';
    } else {
      _val = '0'; _aguardando = false;
    }
    _atualizar();
  }

  window.inicializarCalculadora = function () {
    const card = document.getElementById('calcCard');
    if (!card) return;
    _atualizar();

    card.querySelectorAll('[data-num]').forEach((btn) => {
      btn.addEventListener('click', () => _digitarNum(btn.dataset.num));
    });

    card.querySelectorAll('[data-op]').forEach((btn) => {
      btn.addEventListener('click', () => _operador(btn.dataset.op));
    });

    document.getElementById('calcBtnIgual')?.addEventListener('click', _igual);

    document.getElementById('calcBtnAC')?.addEventListener('click', function () {
      _limpar(this.textContent === 'AC');
      this.textContent = 'AC';
    });

    document.getElementById('calcBtnPct')?.addEventListener('click', () => {
      const n = parseFloat(_val);
      _val = String(_arred(_primeiro !== null && _op ? _primeiro * n / 100 : n / 100));
      _aguardando = false;
      _atualizar();
    });

    document.getElementById('calcBtnNeg')?.addEventListener('click', () => {
      if (_val === '0' || _val === 'Erro') return;
      _val = _val.startsWith('-') ? _val.slice(1) : '-' + _val;
      _atualizar();
    });

    // Teclado numérico quando nenhum input da planilha está focado
    document.addEventListener('keydown', (e) => {
      if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (document.activeElement?.closest('.corte-modal')) return;
      const mapa = { 'Enter': _igual, 'Escape': () => _limpar(true), 'Backspace': () => { _val = _val.length > 1 ? _val.slice(0, -1) : '0'; _atualizar(); } };
      if (mapa[e.key]) { e.preventDefault(); mapa[e.key](); return; }
      if (/^[0-9.]$/.test(e.key)) { _digitarNum(e.key); return; }
      const opMapa = { '+': '+', '-': '−', '*': '×', '/': '÷' };
      if (opMapa[e.key]) { _operador(opMapa[e.key]); }
    });
  };
})();

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseConfigurado === 'undefined' || !supabaseConfigurado || !supabaseClient) {
    mostrarTela('aviso');
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data && data.session) {
      await entrarPainel();
    } else {
      mostrarTela('login');
    }
  } catch (erro) {
    console.error('Erro ao iniciar painel administrativo:', erro);
    mostrarTela('aviso');
    return;
  }

  atualizarSelectCategoria();

  formLogin.addEventListener('submit', fazerLogin);
  botaoSair.addEventListener('click', fazerLogout);
  formProduto.addEventListener('submit', salvarProduto);
  botaoCancelar.addEventListener('click', limparFormulario);

  campoDesconto?.addEventListener('input', atualizarPreviewDesconto);
  campoPreco?.addEventListener('input', atualizarPreviewDesconto);

  document.getElementById('botaoAddIngrediente')?.addEventListener('click', adicionarTagIngrediente);
  campoNovoIngrediente?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarTagIngrediente(); }
  });
  document.getElementById('botaoAddInfo')?.addEventListener('click', adicionarTagInfo);
  campoNovaInfo?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarTagInfo(); }
  });
  renderizarTagsIngredientes();
  renderizarTagsInfo();

  const formCategoria = document.getElementById('formCategoria');
  if (formCategoria) formCategoria.addEventListener('submit', adicionarCategoria);
  iniciarEmojiPicker();
  criarEmojiPicker('emojiTriggerLegenda', 'emojiPickerPopupLegenda', 'emojiPickerLegenda', 'campoLegendaEmoji', atualizarPreviewLegenda);
  document.getElementById('campoLegendaTexto')?.addEventListener('input', atualizarPreviewLegenda);
  document.getElementById('botaoSalvarLegenda')?.addEventListener('click', salvarLegendaCardapio);
  inicializarPrecificacao();
  inicializarPlanilhaManual();
  inicializarCalculadora();

  // Insights
  document.getElementById('campoBuscaClienteInsights')?.addEventListener('input', (e) => renderizarListaClientesInsights(e.target.value));

  campoBuscaProduto.addEventListener('input', () => renderizarListaProdutos(campoBuscaProduto.value));

  // Dashboard reset
  document.getElementById('botaoResetDashboard')?.addEventListener('click', resetarDashboard);
  document.getElementById('botaoResetInsights')?.addEventListener('click', resetarInsights);
  document.getElementById('filtroNotaAvaliacao')?.addEventListener('change', renderizarAvaliacoesAdmin);

  // Calendário nav
  document.getElementById('calBtnAnterior')?.addEventListener('click', () => {
    _calMes--;
    if (_calMes < 0) { _calMes = 11; _calAno--; }
    renderizarCalendario(_pedidosCompletos);
  });
  document.getElementById('calBtnProximo')?.addEventListener('click', () => {
    _calMes++;
    if (_calMes > 11) { _calMes = 0; _calAno++; }
    renderizarCalendario(_pedidosCompletos);
  });

  // Crop modal
  document.getElementById('corteBtnConfirmar')?.addEventListener('click', confirmarCorte);
  document.getElementById('corteBtnFechar')?.addEventListener('click', pularCorte);
  document.getElementById('corteBackdrop')?.addEventListener('click', pularCorte);
  document.querySelectorAll('.corte-aspecto').forEach((btn) => {
    btn.addEventListener('click', () => setAspecto(parseFloat(btn.dataset.ratio), btn));
  });

  // Upload de fotos do produto
  document.getElementById('fotoBtnAdicionar').addEventListener('click', () => {
    campoImagemArquivo.value = '';
    campoImagemArquivo.click();
  });

  campoImagemArquivo.addEventListener('change', () => {
    if (campoImagemArquivo.files.length > 0) adicionarFotos(campoImagemArquivo.files);
  });

  // Drag-and-drop no frame grande
  fotoFrame.addEventListener('dragover', (e) => { e.preventDefault(); fotoFrame.classList.add('drag-over'); });
  fotoFrame.addEventListener('dragleave', () => fotoFrame.classList.remove('drag-over'));
  fotoFrame.addEventListener('drop', (e) => {
    e.preventDefault();
    fotoFrame.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) adicionarFotos(files);
  });
  formIngrediente.addEventListener('submit', salvarIngrediente);
  botaoCancelarIngrediente.addEventListener('click', limparFormularioIngrediente);
  filtroEstoqueBaixo.addEventListener('change', renderizarIngredientes);
  formMovimentacao.addEventListener('submit', confirmarMovimentacao);
  movimentacaoFechar.addEventListener('click', fecharMovimentacao);
  movimentacaoBackdrop.addEventListener('click', fecharMovimentacao);

  // Navegação entre telas do painel
  document.querySelectorAll('[data-ir-para]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const destino = botao.dataset.irPara;
      mostrarTela(destino);
      if (destino === 'painelProdutos') {
        carregarProdutosAdmin();
        renderizarListaCategorias();
        atualizarSelectCategoria();
        carregarAvaliacoesAdmin();
        carregarLegendaCardapio();
      } else if (destino === 'painelDashboard') {
        carregarDashboard();
      } else if (destino === 'painelEstoque') {
        carregarIngredientes();
        carregarProdutosEstoque();
      } else if (destino === 'painelInsights') {
        carregarInsights();
      }
    });
  });

  // Efeito de "ripple" (onda) ao clicar nos botões
  document.querySelectorAll('.botao-primario, .botao-secundario').forEach((el) => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';

    el.addEventListener('click', (evt) => {
      const rect = el.getBoundingClientRect();
      const tamanho = Math.max(rect.width, rect.height);

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = `${tamanho}px`;
      ripple.style.height = `${tamanho}px`;
      ripple.style.left = `${evt.clientX - rect.left - tamanho / 2}px`;
      ripple.style.top = `${evt.clientY - rect.top - tamanho / 2}px`;

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
});
