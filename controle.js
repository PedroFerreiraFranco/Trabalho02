// Constantes para chaves de armazenamento local e elementos do DOM
const CHAVE_TRANSACOES_LS = "transacoes";
const formulario = document.getElementById("formulario");
const descricaoInput = document.getElementById("descricao");
const montanteInput = document.querySelector("#montante");
const saldoH1 = document.getElementById("saldo");
const receitaElemento = document.querySelector("#din-positivo");
const despesaElemento = document.querySelector("#din-negativo");
const transacoesLista = document.getElementById("transacoes");

let transacoesArmazenadas;
let idAtual;

// Tentar recuperar dados do localStorage
try {
  transacoesArmazenadas = JSON.parse(localStorage.getItem(CHAVE_TRANSACOES_LS));
  idAtual = parseInt(localStorage.getItem("idAtual")) || 0;
} catch (erro) {
  transacoesArmazenadas = [];
  idAtual = 0;
}

if (transacoesArmazenadas == null) {
  transacoesArmazenadas = [];
}

// Evento de envio do formulário
formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  const descricao = descricaoInput.value.trim();
  const montante = montanteInput.value.trim();
  const eDespesa = document.getElementById("despesa").checked;

  if (descricao === "") {
    alert("Informe a descrição da transação!");
    descricaoInput.focus();
    return;
  }
  if (montante === "") {
    alert("Informe o valor da transação!");
    montanteInput.focus();
    return;
  }

  const transacao = {
    id: idAtual,
    descricao,
    valor: parseFloat(eDespesa ? -montante : montante),
  };
  
  // Exibe o ID da transação
  alert(`ID da transação: ${transacao.id}`);

  idAtual += 1;
  localStorage.setItem("idAtual", idAtual);

  atualizarSaldo(transacao);
  atualizarReceitaDespesa(transacao);
  adicionarTransacaoDOM(transacao);

  transacoesArmazenadas.push(transacao);
  localStorage.setItem(CHAVE_TRANSACOES_LS, JSON.stringify(transacoesArmazenadas));

  descricaoInput.value = "";
  montanteInput.value = "";
});

// Função para atualizar o saldo
function atualizarSaldo(transacao) {
  let saldoAtual = saldoH1.innerHTML.trim();
  saldoAtual = saldoAtual.replace("R$", "");

  saldoAtual = parseFloat(saldoAtual);
  saldoAtual += transacao.valor;

  saldoH1.innerHTML = `R$${saldoAtual.toFixed(2)}`;
}

// Função para atualizar receitas e despesas
function atualizarReceitaDespesa(transacao) {
  const elemento = transacao.valor > 0 ? receitaElemento : despesaElemento;
  const prefixo = transacao.valor > 0 ? "+ R$" : "- R$";
  let valorAtual = elemento.innerHTML.replace(prefixo, "");
  valorAtual = parseFloat(valorAtual);
  valorAtual += Math.abs(transacao.valor);

  elemento.innerHTML = `${prefixo}${valorAtual.toFixed(2)}`;
}

// Função para adicionar a transação ao DOM
function adicionarTransacaoDOM(transacao) {
  const classeCSS = transacao.valor > 0 ? "positivo" : "negativo";
  const prefixo = transacao.valor > 0 ? "R$" : "-R$";

  const li = document.createElement("li");
  li.classList.add(classeCSS);
  li.setAttribute("data-id", transacao.id);
  li.innerHTML = `${transacao.descricao} <span>${prefixo}${Math.abs(transacao.valor)}</span><button class="delete-btn" onclick="removerTransacao(${transacao.id})">X</button>`;

  transacoesLista.append(li);
}

// Função para carregar dados ao inicializar
function carregarDados() {
  transacoesLista.innerHTML = "";
  saldoH1.innerHTML = "R$0.00";
  receitaElemento.innerHTML = "+ R$0.00";
  despesaElemento.innerHTML = "- R$0.00";

  for (let transacao of transacoesArmazenadas) {
    atualizarSaldo(transacao);
    atualizarReceitaDespesa(transacao);
    adicionarTransacaoDOM(transacao);
  }
}

// Função para remover uma transação
function removerTransacao(id) {
  const indiceTransacao = transacoesArmazenadas.findIndex((transacao) => transacao.id == id);
  const transacao = transacoesArmazenadas[indiceTransacao];
  transacoesArmazenadas.splice(indiceTransacao, 1);
  localStorage.setItem(CHAVE_TRANSACOES_LS, JSON.stringify(transacoesArmazenadas));

  // Atualiza saldo e receitas/despesas
  let saldoAtual = parseFloat(saldoH1.innerHTML.replace("R$", ""));
  saldoAtual -= transacao.valor;
  saldoH1.innerHTML = `R$${saldoAtual.toFixed(2)}`;

  const elemento = transacao.valor > 0 ? receitaElemento : despesaElemento;
  const prefixo = transacao.valor > 0 ? "+ R$" : "- R$";
  let valorAtual = parseFloat(elemento.innerHTML.replace(prefixo, ""));
  valorAtual -= Math.abs(transacao.valor);
  elemento.innerHTML = `${prefixo}${valorAtual.toFixed(2)}`;

  // Remove o elemento do DOM
  const li = document.querySelector(`li[data-id='${id}']`);
  li.remove();
}

// Carrega os dados ao inicializar a página
carregarDados();
