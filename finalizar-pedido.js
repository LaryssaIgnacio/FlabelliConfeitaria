const CHAVE_CARRINHO = 'flabelli_carrinho';
const NUMERO_WHATSAPP = '5513997550024';

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTelefone(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  input.value = v.replace(/-$/, '');
}

function carregarCarrinho() {
  try {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

function calcularTotal(carrinho) {
  return carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
}

// Baixa o estoque dos produtos comprados (não bloqueia o pedido se falhar)
async function baixarEstoque(carrinho) {
  for (const item of carrinho) {
    if (!item.id) continue;
    try {
      const { data: produto, error: erroBusca } = await supabaseClient
        .from('produtos')
        .select('estoque')
        .eq('id', item.id)
        .single();

      if (erroBusca || !produto) continue;

      const novoEstoque = Math.max(0, (Number(produto.estoque) || 0) - item.quantidade);
      const { error: erroUpdate } = await supabaseClient.from('produtos').update({ estoque: novoEstoque }).eq('id', item.id);
      if (erroUpdate) console.error(`Erro ao baixar estoque de ${item.nome}:`, erroUpdate.message);
    } catch (e) {
      console.error(`Erro ao baixar estoque de ${item.nome}:`, e);
    }
  }
}

function renderizarItens(carrinho) {
  const container = document.getElementById('fpItens');
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = '<p class="fp-carrinho-vazio">Nenhum item no carrinho.<br><a href="cardapio.html">Voltar ao cardápio</a></p>';
    return;
  }

  container.innerHTML = '';
  carrinho.forEach((item) => {
    const linha = document.createElement('div');
    linha.className = 'fp-item';

    const nome = document.createElement('span');
    nome.className = 'fp-item-nome';
    nome.textContent = item.quantidade > 1 ? `${item.quantidade}× ${item.nome}` : item.nome;

    const preco = document.createElement('span');
    preco.className = 'fp-item-preco';
    preco.textContent = formatarPreco(item.preco * item.quantidade);

    linha.append(nome, preco);
    container.appendChild(linha);
  });
}

async function enviarPedido(carrinho) {
  const nome = document.getElementById('fpNome').value.trim();
  const telefone = document.getElementById('fpTelefone').value.trim();
  const endereco = document.getElementById('fpEndereco').value.trim();
  const bairro = document.getElementById('fpBairro').value.trim();
  const complemento = document.getElementById('fpComplemento').value.trim();
  const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || 'Pix';
  const erroEl = document.getElementById('fpErro');
  const btnEnviar = document.getElementById('fpBtnEnviar');

  erroEl.hidden = true;

  if (!nome) {
    erroEl.textContent = 'Por favor, informe seu nome.';
    erroEl.hidden = false;
    document.getElementById('fpNome').focus();
    return;
  }
  if (!telefone || telefone.replace(/\D/g, '').length < 10) {
    erroEl.textContent = 'Por favor, informe um telefone válido.';
    erroEl.hidden = false;
    document.getElementById('fpTelefone').focus();
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';

  const total = calcularTotal(carrinho);

  // Salva pedido no Supabase
  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    try {
      const { data: pedido, error: erroPedido } = await supabaseClient
        .from('pedidos')
        .insert([{
          total,
          nome_cliente: nome,
          telefone_cliente: telefone,
          endereco,
          bairro,
          complemento,
        }])
        .select()
        .single();

      if (erroPedido) {
        console.error('Erro ao salvar pedido no Supabase:', erroPedido.message);
      } else if (pedido) {
        const itens = carrinho.map((item) => ({
          pedido_id: pedido.id,
          nome_produto: item.nome,
          preco_unitario: item.preco,
          quantidade: item.quantidade,
          subtotal: item.preco * item.quantidade,
        }));
        const { error: erroItens } = await supabaseClient.from('pedido_itens').insert(itens);
        if (erroItens) console.error('Erro ao salvar itens do pedido:', erroItens.message);

        await baixarEstoque(carrinho);
      }
    } catch (e) {
      console.error('Erro ao salvar pedido:', e);
    }
  }

  // Monta mensagem WhatsApp
  const sep = '─────────────────────';
  let msg = `Ola, Flabelli Confeitaria!\n`;
  msg += `Gostaria de realizar um pedido. Seguem os detalhes:\n\n`;
  msg += `${sep}\n`;
  msg += `*PEDIDO*\n\n`;
  carrinho.forEach((item) => {
    const subtotal = formatarPreco(item.preco * item.quantidade);
    if (item.quantidade > 1) {
      msg += `*${item.nome}*\n`;
      msg += `  ${item.quantidade} unidades x ${formatarPreco(item.preco)} = ${subtotal}\n\n`;
    } else {
      msg += `*${item.nome}*\n`;
      msg += `  ${subtotal}\n\n`;
    }
  });
  msg += `${sep}\n`;
  msg += `*TOTAL: ${formatarPreco(total)}*\n`;
  msg += `${sep}\n\n`;
  msg += `*PAGAMENTO*\n`;
  msg += `${pagamento}\n\n`;
  msg += `${sep}\n`;
  msg += `*DADOS DO CLIENTE*\n`;
  msg += `Nome: ${nome}\n`;
  msg += `Telefone: ${telefone}\n`;
  if (endereco) msg += `Endereco: ${endereco}\n`;
  if (bairro) msg += `Bairro: ${bairro}\n`;
  if (complemento) msg += `Complemento: ${complemento}\n`;
  msg += `${sep}`;

  if (typeof supabaseClient !== 'undefined' && supabaseClient) {
    supabaseClient.from('eventos_analytics').insert([{ tipo: 'clique_whatsapp' }]).then(() => {});
  }

  localStorage.removeItem(CHAVE_CARRINHO);
  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  window.location.href = 'cardapio.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const carrinho = carregarCarrinho();

  if (carrinho.length === 0) {
    // Carrinho vazio — redireciona de volta
    const fpItens = document.getElementById('fpItens');
    if (fpItens) {
      fpItens.innerHTML = '<p class="fp-carrinho-vazio">Seu carrinho está vazio.<br><a href="cardapio.html">Voltar ao cardápio →</a></p>';
    }
    const btn = document.getElementById('fpBtnEnviar');
    if (btn) btn.disabled = true;
    const totalEl = document.getElementById('fpTotal');
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    return;
  }

  renderizarItens(carrinho);
  document.getElementById('fpTotal').textContent = formatarPreco(calcularTotal(carrinho));

  // Máscara de telefone
  const telInput = document.getElementById('fpTelefone');
  telInput.addEventListener('input', () => formatarTelefone(telInput));

  // Destaque no radio selecionado
  document.querySelectorAll('input[name="pagamento"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.fp-pag-card').forEach((c) => c.classList.remove('ativo'));
      if (radio.checked) radio.closest('.fp-pag-opcao').querySelector('.fp-pag-card').classList.add('ativo');
    });
  });
  // Marca o primeiro como ativo no load
  const primeiroRadio = document.querySelector('input[name="pagamento"]:checked');
  if (primeiroRadio) primeiroRadio.closest('.fp-pag-opcao').querySelector('.fp-pag-card').classList.add('ativo');

  document.getElementById('fpBtnEnviar').addEventListener('click', () => enviarPedido(carrinho));
});
