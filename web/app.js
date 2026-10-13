import {
  criarEstado, digitar, adicionarDecimal, selecionarOperacao, calcularResultado,
  aplicarPorcentagem, alternarSinal, apagarUltimo, limparTudo,
  memoriaMais, memoriaMenos, memoriaRecuperar, memoriaLimpar, temMemoria,
  DivisionByZeroError, InvalidInputError,
} from './calculator.js';

const el = {
  expressao: document.getElementById('expressao'),
  resultado: document.getElementById('resultado'),
  erro: document.getElementById('erro'),
  historico: document.getElementById('historico'),
  historicoVazio: document.getElementById('historico-vazio'),
  limparHistorico: document.getElementById('limpar-historico'),
  badgeMemoria: document.getElementById('memoria-badge'),
};

const estado = criarEstado();

function render() {
  el.expressao.textContent = estado.expressao || '\u00a0';
  el.resultado.textContent = estado.display;
  el.erro.hidden = true;

  // operador ativo: realce enquanto aguarda o segundo número
  document.querySelectorAll('.tecla.operador').forEach((b) => {
    b.classList.toggle('ativo', estado.novoNumero && estado.operacaoPendente === b.dataset.valor);
  });

  el.badgeMemoria.hidden = !temMemoria(estado);

  el.historicoVazio.hidden = estado.historico.length > 0;
  el.limparHistorico.hidden = estado.historico.length === 0;
  el.historico.querySelectorAll('li:not(.historico-vazio)').forEach((li) => li.remove());
  for (const item of estado.historico) {
    const li = document.createElement('li');
    const expr = document.createElement('span');
    expr.textContent = item.expressao.split('=')[0].trim();
    const res = document.createElement('span');
    res.className = 'res';
    res.textContent = '= ' + item.resultado;
    li.append(expr, res);
    el.historico.appendChild(li);
  }
}

function mostrarErro(mensagem) {
  el.erro.textContent = mensagem;
  el.erro.hidden = false;
}

function despachar(acao, valor) {
  try {
    if (valor !== undefined) {
      if (/^\d$/.test(valor)) { digitar(estado, valor); render(); return; }
      if (valor === ',') { adicionarDecimal(estado); render(); return; }
      // operador
      selecionarOperacao(estado, valor);
      render();
      return;
    }
    switch (acao) {
      case 'limpar': limparTudo(estado); break;
      case 'apagar': apagarUltimo(estado); break;
      case 'porcentagem': aplicarPorcentagem(estado); break;
      case 'sinal': alternarSinal(estado); break;
      case 'decimal': adicionarDecimal(estado); break;
      case 'igual': calcularResultado(estado); break;
      case 'm-mais': memoriaMais(estado); break;
      case 'm-menos': memoriaMenos(estado); break;
      case 'm-recuperar': memoriaRecuperar(estado); break;
      case 'm-limpar': memoriaLimpar(estado); break;
    }
    render();
  } catch (e) {
    if (e instanceof DivisionByZeroError || e instanceof InvalidInputError) {
      limparTudo(estado);
      mostrarErro(e.message);
      render();
    } else {
      throw e;
    }
  }
}

// cliques
document.querySelectorAll('.tecla').forEach((botao) => {
  botao.addEventListener('click', () => {
    const { acao, valor } = botao.dataset;
    despachar(acao, valor !== undefined ? valor : undefined);
  });
});

// teclado — mesmo mapa da versão Tkinter
const OPERACOES_TECLA = { '+': '+', '-': '\u2212', '*': '\u00d7', '/': '\u00f7' };

document.addEventListener('keydown', (evento) => {
  if (evento.ctrlKey || evento.metaKey || evento.altKey) return;
  const alvo = evento.target;
  if (alvo instanceof HTMLAnchorElement) return;

  const tecla = evento.key;
  if (/^\d$/.test(tecla)) { despachar(undefined, tecla); }
  else if (tecla === ',' || tecla === '.') { despachar('decimal'); }
  else if (tecla in OPERACOES_TECLA) { despachar(undefined, OPERACOES_TECLA[tecla]); }
  else if (tecla === 'Enter') { despachar('igual'); }
  else if (tecla === 'Backspace') { despachar('apagar'); }
  else if (tecla === 'Escape' || tecla === 'Delete') { despachar('limpar'); }
  else if (tecla === '%') { despachar('porcentagem'); }
  else { return; }
  evento.preventDefault();
});

el.limparHistorico.addEventListener('click', () => {
  estado.historico.length = 0;
  render();
});

render();
