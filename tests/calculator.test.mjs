import test from 'node:test';
import assert from 'node:assert/strict';
import {
  criarEstado, digitar, adicionarDecimal, selecionarOperacao, calcularResultado,
  aplicarPorcentagem, alternarSinal, apagarUltimo, limparTudo,
  memoriaMais, memoriaMenos, memoriaRecuperar, memoriaLimpar, temMemoria,
  parseDisplay, formatarNumero, calcular, DivisionByZeroError, InvalidInputError,
} from '../web/calculator.js';

const t = () => criarEstado();
const calc = (a, op, b) => {
  const e = t();
  digitar(e, String(a).replace('.', ','));
  selecionarOperacao(e, op);
  digitar(e, String(b).replace('.', ','));
  calcularResultado(e);
  return e.display;
};

// ---- operações básicas ----
test('soma', () => assert.equal(calc(2, '+', 3), '5'));
test('subtração', () => assert.equal(calc(10, '\u2212', 4), '6'));
test('multiplicação', () => assert.equal(calc(6, '\u00d7', 7), '42'));
test('divisão', () => assert.equal(calc(10, '\u00f7', 4), '2,5'));
test('divisão exata', () => assert.equal(calc(10, '\u00f7', 2), '5'));
test('números negativos no resultado', () => assert.equal(calc(2, '\u2212', 5), '-3'));
test('decimais na soma', () => assert.equal(calc('1,5', '+', '2,25'), '3,75'));

// ---- encadeamento (semântica da versão Tkinter) ----
test('encadeia operações ao trocar operador', () => {
  const e = t();
  digitar(e, '2');
  selecionarOperacao(e, '+');
  digitar(e, '3');
  selecionarOperacao(e, '\u00d7');
  // 2+3 resolvido ao selecionar ×
  assert.equal(e.display, '5');
  digitar(e, '4');
  calcularResultado(e);
  assert.equal(e.display, '20');
});
test('trocar operador sem segundo número reusa o primeiro', () => {
  const e = t();
  digitar(e, '5');
  selecionarOperacao(e, '+');
  selecionarOperacao(e, '\u00d7');
  digitar(e, '3');
  calcularResultado(e);
  assert.equal(e.display, '15');
});
test('= repetido mantém o resultado', () => {
  const e = t();
  digitar(e, '5');
  selecionarOperacao(e, '+');
  digitar(e, '3');
  calcularResultado(e);
  calcularResultado(e);
  assert.equal(e.display, '8');
});

// ---- porcentagem ----
test('porcentagem simples', () => {
  const e = t();
  digitar(e, '50');
  aplicarPorcentagem(e);
  assert.equal(e.display, '0,5');
});
test('porcentagem de decimal', () => {
  const e = t();
  digitar(e, '1,5');
  aplicarPorcentagem(e);
  assert.equal(e.display, '0,015');
});
test('porcentagem registra no histórico', () => {
  const e = t();
  digitar(e, '25');
  aplicarPorcentagem(e);
  assert.equal(e.historico.length, 1);
  assert.match(e.historico[0].expressao, /25% = 0,25/);
});

// ---- casas decimais e vírgula ----
test('vírgula não duplica', () => {
  const e = t();
  digitar(e, '1');
  adicionarDecimal(e);
  adicionarDecimal(e);
  digitar(e, '5');
  assert.equal(e.display, '1,5');
});
test('vírgula após novo número começa com 0,', () => {
  const e = t();
  adicionarDecimal(e);
  assert.equal(e.display, '0,');
});
test('soma de decimais próximos não quebra', () => {
  const e = t();
  digitar(e, '0,1');
  selecionarOperacao(e, '+');
  digitar(e, '0,2');
  calcularResultado(e);
  assert.equal(e.display, '0,3'); // 12 dígitos significativos arredondam o float
});
test('formatarNumero limita precisão', () => {
  assert.equal(formatarNumero(1 / 3), '0,333333333333');
});

// ---- divisão por zero e entradas inválidas ----
test('divisão por zero lança erro específico', () => {
  assert.throws(() => calcular(5, '\u00f7', 0), DivisionByZeroError);
});
test('calculadora não exibe Infinity em divisão por zero', () => {
  const e = t();
  digitar(e, '5');
  selecionarOperacao(e, '\u00f7');
  digitar(e, '0');
  assert.throws(() => calcularResultado(e), DivisionByZeroError);
});
test('parseDisplay rejeita texto inválido', () => {
  assert.throws(() => parseDisplay('abc'), InvalidInputError);
});
test('operador inválido lança erro', () => {
  assert.throws(() => calcular(1, '^', 2), InvalidInputError);
});

// ---- limpeza e backspace ----
test('C limpa tudo', () => {
  const e = t();
  digitar(e, '9');
  selecionarOperacao(e, '+');
  limparTudo(e);
  assert.equal(e.display, '0');
  assert.equal(e.expressao, '');
  assert.equal(e.valorAnterior, null);
});
test('backspace apaga último dígito', () => {
  const e = t();
  digitar(e, '1');
  digitar(e, '2');
  apagarUltimo(e);
  assert.equal(e.display, '1');
});
test('backspace até vazio vira 0', () => {
  const e = t();
  digitar(e, '7');
  apagarUltimo(e);
  apagarUltimo(e);
  assert.equal(e.display, '0');
});
test('backspace de número negativo de 1 dígito vira 0', () => {
  const e = t();
  digitar(e, '5');
  alternarSinal(e);
  apagarUltimo(e);
  assert.equal(e.display, '0');
});

// ---- sinal ----
test('± alterna sinal', () => {
  const e = t();
  digitar(e, '5');
  alternarSinal(e);
  assert.equal(e.display, '-5');
  alternarSinal(e);
  assert.equal(e.display, '5');
});
test('± em zero não adiciona travessão', () => {
  const e = t();
  alternarSinal(e);
  assert.equal(e.display, '0');
});

// ---- memória ----
test('M+ soma à memória', () => {
  const e = t();
  digitar(e, '10');
  memoriaMais(e);
  assert.equal(temMemoria(e), true);
  digitar(e, '5');
  memoriaMais(e);
  memoriaRecuperar(e);
  assert.equal(e.display, '15');
});
test('M- subtrai da memória', () => {
  const e = t();
  digitar(e, '10');
  memoriaMais(e);
  digitar(e, '3');
  memoriaMenos(e);
  memoriaRecuperar(e);
  assert.equal(e.display, '7');
});
test('MC limpa a memória', () => {
  const e = t();
  digitar(e, '10');
  memoriaMais(e);
  memoriaLimpar(e);
  assert.equal(temMemoria(e), false);
  memoriaRecuperar(e);
  assert.equal(e.display, '0');
});
test('MR com memória vazia exibe 0', () => {
  const e = t();
  memoriaRecuperar(e);
  assert.equal(e.display, '0');
});
test('M+ com decimal', () => {
  const e = t();
  digitar(e, '1,5');
  memoriaMais(e);
  memoriaRecuperar(e);
  assert.equal(e.display, '1,5');
});

// ---- histórico ----
test('histórico registra cálculos na ordem inversa', () => {
  const e = t();
  digitar(e, '1');
  selecionarOperacao(e, '+');
  digitar(e, '1');
  calcularResultado(e);
  digitar(e, '2');
  selecionarOperacao(e, '\u00d7');
  digitar(e, '2');
  calcularResultado(e);
  assert.equal(e.historico.length, 2);
  assert.match(e.historico[0].expressao, /^2 × 2/);
  assert.match(e.historico[1].expressao, /^1 \+ 1/);
});
test('sem operação pendente, = não faz nada nem registra histórico', () => {
  const e = t();
  digitar(e, '5');
  calcularResultado(e);
  assert.equal(e.historico.length, 0);
  assert.equal(e.display, '5');
});

// ---- helpers ----
test('parseDisplay aceita ponto e vírgula', () => {
  assert.equal(parseDisplay('1,5'), 1.5);
  assert.equal(parseDisplay('1.5'), 1.5);
});
test('formatarNumero lida com -0', () => {
  assert.equal(formatarNumero(-0), '0');
});
