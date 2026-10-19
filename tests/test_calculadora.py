"""Testes da classe Calculadora — o núcleo aritmético da versão Python.

Até aqui o CI só compilava o arquivo e confirmava que ele podia ser importado,
o que prova apenas que a sintaxe é válida. A aritmética em si, que dá nome ao
repositório, não era verificada por nada.

Os casos de operação vêm de tests/casos-aritmetica.json, a mesma tabela lida
pela suíte da versão web. As duas implementações da mesma regra não podem
divergir em silêncio.
"""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from calculadora import Calculadora  # noqa: E402

CASOS = json.loads((Path(__file__).resolve().parent / 'casos-aritmetica.json').read_text('utf-8'))

OPERACOES = {
    '+': Calculadora.somar,
    '-': Calculadora.subtrair,
    '*': Calculadora.multiplicar,
    '/': Calculadora.dividir,
}


class TabelaCompartilhadaTests(unittest.TestCase):
    """Roda a tabela de casos que a versão web também usa."""

    def test_a_tabela_tem_casos(self):
        self.assertGreater(len(CASOS['operacoes']), 10)

    def test_operacoes_da_tabela(self):
        for caso in CASOS['operacoes']:
            if 'erro' in caso:
                continue
            with self.subTest(caso=f"{caso['a']} {caso['op']} {caso['b']}"):
                resultado = OPERACOES[caso['op']](caso['a'], caso['b'])
                self.assertEqual(resultado, caso['esperado'])

    def test_erros_da_tabela(self):
        for caso in CASOS['operacoes']:
            if caso.get('erro') != 'divisao-por-zero':
                continue
            with self.subTest(caso=f"{caso['a']} / {caso['b']}"):
                with self.assertRaises(ValueError):
                    Calculadora.dividir(caso['a'], caso['b'])


class SomarTests(unittest.TestCase):
    def test_inteiros(self):
        self.assertEqual(Calculadora.somar(2, 3), 5)

    def test_negativos(self):
        self.assertEqual(Calculadora.somar(-7, -3), -10)

    def test_ponto_flutuante_mantem_o_erro_do_binario(self):
        # 0.1 + 0.2 não dá exatamente 0.3 em ponto flutuante, aqui como em
        # qualquer linguagem. Fixado para que ninguém "corrija" com um
        # arredondamento escondido na operação.
        self.assertEqual(Calculadora.somar(0.1, 0.2), 0.30000000000000004)


class SubtrairTests(unittest.TestCase):
    def test_resultado_positivo(self):
        self.assertEqual(Calculadora.subtrair(10, 3), 7)

    def test_resultado_negativo(self):
        self.assertEqual(Calculadora.subtrair(3, 10), -7)

    def test_nao_e_comutativa(self):
        self.assertNotEqual(Calculadora.subtrair(10, 3), Calculadora.subtrair(3, 10))


class MultiplicarTests(unittest.TestCase):
    def test_inteiros(self):
        self.assertEqual(Calculadora.multiplicar(6, 7), 42)

    def test_por_zero(self):
        self.assertEqual(Calculadora.multiplicar(0, 12345), 0)

    def test_sinais_opostos(self):
        self.assertEqual(Calculadora.multiplicar(-3, 4), -12)

    def test_dois_negativos(self):
        self.assertEqual(Calculadora.multiplicar(-3, -4), 12)


class DividirTests(unittest.TestCase):
    def test_divisao_exata(self):
        self.assertEqual(Calculadora.dividir(10, 4), 2.5)

    def test_resultado_inteiro_vem_como_float(self):
        # A divisão em Python devolve float mesmo quando o resultado é exato;
        # é o que a interface recebe e formata.
        self.assertIsInstance(Calculadora.dividir(9, 3), float)

    def test_divisao_por_zero_recusada(self):
        with self.assertRaises(ValueError):
            Calculadora.dividir(1, 0)

    def test_zero_dividido_por_zero_tambem_recusado(self):
        with self.assertRaises(ValueError):
            Calculadora.dividir(0, 0)

    def test_mensagem_do_erro_explica_o_motivo(self):
        with self.assertRaises(ValueError) as contexto:
            Calculadora.dividir(5, 0)
        self.assertIn('zero', str(contexto.exception).lower())

    def test_divisor_muito_pequeno_nao_e_tratado_como_zero(self):
        # Só o zero exato é recusado; 1e-300 é um divisor legítimo.
        self.assertGreater(Calculadora.dividir(1, 1e-300), 0)


class MetodosEstaticosTests(unittest.TestCase):
    def test_funcionam_sem_instanciar(self):
        # Os métodos são estáticos: a interface chama pela instância, mas
        # nada na classe depende de estado.
        self.assertEqual(Calculadora.somar(1, 1), 2)
        self.assertEqual(Calculadora().somar(1, 1), 2)


if __name__ == '__main__':
    unittest.main()
