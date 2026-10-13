/**
 * Motor de cálculo da Calculadora — portado da classe Calculadora (Python/Tkinter).
 * Sem dependências; puramente lógico para facilitar testes.
 *
 * Preserva a semântica da versão acadêmica:
 * - avaliação encadeada ao trocar de operador (valor_anterior / operacao_pendente / novo_numero)
 * - divisão por zero é erro explícito, não Infinity
 * - vírgula como separador decimal exibido (o motor trabalha com ponto)
 */

export const OPERADORES = {
  '+': (a, b) => a + b,
  '\u2212': (a, b) => a - b, // −
  '\u00d7': (a, b) => a * b, // ×
  '\u00f7': (a, b) => {
    if (b === 0) throw new DivisionByZeroError();
    return a / b;
  },
};

export class DivisionByZeroError extends Error {
  constructor() {
    super('Não é possível dividir por zero.');
    this.name = 'DivisionByZeroError';
  }
}

export class InvalidInputError extends Error {
  constructor() {
    super('Valor inválido.');
    this.name = 'InvalidInputError';
  }
}

/** Converte o texto do display ("1,5" ou "1.5") para número. Lança InvalidInputError. */
export function parseDisplay(texto) {
  const valor = Number(String(texto).trim().replace(',', '.'));
  if (!Number.isFinite(valor)) throw new InvalidInputError();
  return valor;
}

/** Formata um número para o display: até 12 dígitos significativos, vírgula decimal. */
export function formatarNumero(numero) {
  if (!Number.isFinite(numero)) throw new InvalidInputError();
  if (Object.is(numero, -0)) numero = 0;
  if (Number.isInteger(numero) && Math.abs(numero) < 1e15) {
    return String(numero).replace('.', ',');
  }
  let texto = numero.toPrecision(12).replace(/0+$/, '').replace(/\.$/, '');
  if (texto.includes('e')) {
    // números muito grandes/pequenos: notação científica com vírgula
    const [mant, exp] = texto.split('e');
    return mant.replace('.', ',') + 'e' + exp;
  }
  return texto.replace('.', ',');
}

/** Aplica um operador a dois números. Lança DivisionByZeroError quando aplicável. */
export function calcular(numero1, operacao, numero2) {
  const fn = OPERADORES[operacao];
  if (!fn) throw new InvalidInputError();
  const resultado = fn(numero1, numero2);
  if (!Number.isFinite(resultado)) throw new InvalidInputError();
  return resultado;
}

/** Porcentagem da original: n / 100. */
export function porcentagem(numero) {
  return numero / 100;
}

/**
 * Estado da calculadora (mesma máquina de estados da versão Tkinter).
 * Entradas: ações da UI; saída: { display, expressao, erro? }.
 */
export function criarEstado() {
  return {
    display: '0',            // texto exibido (com vírgula)
    expressao: '',           // linha de cima
    valorAnterior: null,
    operacaoPendente: null,
    novoNumero: true,
    historico: [],           // [{ expressao, resultado }]
    memoria: 0,              // M+, M-, MR, MC
  };
}

function numDoDisplay(estado) {
  return parseDisplay(estado.display);
}

function definirDisplay(estado, texto) {
  if (texto.replace('-', '').length <= 15) estado.display = texto;
}

export function digitar(estado, numero) {
  if (estado.novoNumero || estado.display === '0') {
    estado.display = numero;
    estado.novoNumero = false;
  } else {
    definirDisplay(estado, estado.display + numero);
  }
}

export function adicionarDecimal(estado) {
  if (estado.novoNumero) {
    estado.display = '0,';
    estado.novoNumero = false;
  } else if (!estado.display.includes(',')) {
    estado.display += ',';
  }
}

/** Seleciona operador; se houver operação pendente, resolve antes (encadeamento). */
export function selecionarOperacao(estado, operacao) {
  let atual = numDoDisplay(estado);
  if (
    estado.valorAnterior !== null &&
    estado.operacaoPendente !== null &&
    !estado.novoNumero
  ) {
    atual = calcular(estado.valorAnterior, estado.operacaoPendente, atual);
    estado.display = formatarNumero(atual);
  }
  estado.valorAnterior = atual;
  estado.operacaoPendente = operacao;
  estado.expressao = `${formatarNumero(atual)} ${operacao}`;
  estado.novoNumero = true;
}

/** Calcula o resultado pendente; registra no histórico. Sem pendência: não faz nada. */
export function calcularResultado(estado) {
  if (estado.valorAnterior === null || estado.operacaoPendente === null) return;

  const atual = numDoDisplay(estado);
  const resultado = calcular(estado.valorAnterior, estado.operacaoPendente, atual);

  const primeiro = formatarNumero(estado.valorAnterior);
  const segundo = formatarNumero(atual);
  const resultadoFmt = formatarNumero(resultado);
  const expressao = `${primeiro} ${estado.operacaoPendente} ${segundo} = ${resultadoFmt}`;

  estado.expressao = expressao;
  estado.historico.unshift({ expressao, resultado: resultadoFmt });
  if (estado.historico.length > 20) estado.historico.pop();
  estado.display = resultadoFmt;
  estado.valorAnterior = resultado;
  estado.operacaoPendente = null;
  estado.novoNumero = true;
}

export function aplicarPorcentagem(estado) {
  const numero = numDoDisplay(estado);
  const resultado = porcentagem(numero);
  const texto = `${formatarNumero(numero)}% = ${formatarNumero(resultado)}`;
  estado.display = formatarNumero(resultado);
  estado.expressao = texto;
  estado.historico.unshift({ expressao: texto, resultado: formatarNumero(resultado) });
  if (estado.historico.length > 20) estado.historico.pop();
  estado.novoNumero = true;
}

export function alternarSinal(estado) {
  if (estado.display === '0' || estado.display === '0,') return;
  estado.display = estado.display.startsWith('-')
    ? estado.display.slice(1)
    : '-' + estado.display;
}

export function apagarUltimo(estado) {
  if (estado.novoNumero) return;
  if (estado.display.length <= 1 || (estado.display.length === 2 && estado.display.startsWith('-'))) {
    estado.display = '0';
    estado.novoNumero = true;
  } else {
    estado.display = estado.display.slice(0, -1);
  }
}

export function limparTudo(estado) {
  estado.display = '0';
  estado.expressao = '';
  estado.valorAnterior = null;
  estado.operacaoPendente = null;
  estado.novoNumero = true;
}

// ---- Memória ----

export function memoriaMais(estado) {
  estado.memoria += numDoDisplay(estado);
  estado.novoNumero = true;
  estado.display = '0';
}

export function memoriaMenos(estado) {
  estado.memoria -= numDoDisplay(estado);
  estado.novoNumero = true;
  estado.display = '0';
}

export function memoriaRecuperar(estado) {
  estado.display = formatarNumero(estado.memoria);
  estado.novoNumero = true;
}

export function memoriaLimpar(estado) {
  estado.memoria = 0;
}

export function temMemoria(estado) {
  return estado.memoria !== 0;
}
