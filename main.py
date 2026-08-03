import tkinter as tk
from tkinter import messagebox

from calculadora import Calculadora


class CalculadoraApp:
    COR_FUNDO = "#171717"
    COR_PAINEL = "#222222"
    COR_DISPLAY = "#111111"
    COR_BOTAO = "#303030"
    COR_BOTAO_HOVER = "#3d3d3d"
    COR_OPERACAO = "#e67e22"
    COR_OPERACAO_HOVER = "#f39c12"
    COR_ESPECIAL = "#525252"
    COR_TEXTO = "#ffffff"
    COR_TEXTO_SECUNDARIO = "#b7b7b7"

    def __init__(self, janela: tk.Tk) -> None:
        self.janela = janela
        self.calculadora = Calculadora()

        self.expressao = ""
        self.valor_anterior: float | None = None
        self.operacao_pendente: str | None = None
        self.novo_numero = True

        self.configurar_janela()
        self.criar_interface()
        self.configurar_teclado()

    def configurar_janela(self) -> None:
        self.janela.title("Calculadora em Python")
        self.janela.geometry("390x650")
        self.janela.minsize(360, 600)
        self.janela.configure(bg=self.COR_FUNDO)

        self.centralizar_janela()

    def centralizar_janela(self) -> None:
        self.janela.update_idletasks()

        largura = 390
        altura = 650

        largura_tela = self.janela.winfo_screenwidth()
        altura_tela = self.janela.winfo_screenheight()

        posicao_x = (largura_tela - largura) // 2
        posicao_y = (altura_tela - altura) // 2

        self.janela.geometry(
            f"{largura}x{altura}+{posicao_x}+{posicao_y}"
        )

    def criar_interface(self) -> None:
        self.criar_cabecalho()
        self.criar_display()
        self.criar_historico()
        self.criar_botoes()

    def criar_cabecalho(self) -> None:
        cabecalho = tk.Frame(
            self.janela,
            bg=self.COR_FUNDO,
            padx=20,
            pady=15,
        )
        cabecalho.pack(fill="x")

        titulo = tk.Label(
            cabecalho,
            text="Calculadora",
            font=("Segoe UI", 22, "bold"),
            bg=self.COR_FUNDO,
            fg=self.COR_TEXTO,
        )
        titulo.pack(side="left")

        subtitulo = tk.Label(
            cabecalho,
            text="Python",
            font=("Segoe UI", 10),
            bg=self.COR_FUNDO,
            fg=self.COR_TEXTO_SECUNDARIO,
        )
        subtitulo.pack(side="right", pady=(10, 0))

    def criar_display(self) -> None:
        area_display = tk.Frame(
            self.janela,
            bg=self.COR_DISPLAY,
            padx=20,
            pady=15,
        )
        area_display.pack(fill="x", padx=15)

        self.texto_expressao = tk.StringVar(value="")
        self.texto_resultado = tk.StringVar(value="0")

        label_expressao = tk.Label(
            area_display,
            textvariable=self.texto_expressao,
            anchor="e",
            font=("Segoe UI", 13),
            bg=self.COR_DISPLAY,
            fg=self.COR_TEXTO_SECUNDARIO,
            height=2,
        )
        label_expressao.pack(fill="x")

        label_resultado = tk.Label(
            area_display,
            textvariable=self.texto_resultado,
            anchor="e",
            font=("Segoe UI", 34, "bold"),
            bg=self.COR_DISPLAY,
            fg=self.COR_TEXTO,
            height=1,
        )
        label_resultado.pack(fill="x")

    def criar_historico(self) -> None:
        area_historico = tk.Frame(
            self.janela,
            bg=self.COR_FUNDO,
            padx=15,
            pady=10,
        )
        area_historico.pack(fill="x")

        titulo_historico = tk.Label(
            area_historico,
            text="Última operação",
            anchor="w",
            font=("Segoe UI", 10, "bold"),
            bg=self.COR_FUNDO,
            fg=self.COR_TEXTO_SECUNDARIO,
        )
        titulo_historico.pack(fill="x")

        self.texto_historico = tk.StringVar(
            value="Nenhuma operação realizada"
        )

        label_historico = tk.Label(
            area_historico,
            textvariable=self.texto_historico,
            anchor="w",
            font=("Segoe UI", 10),
            bg=self.COR_FUNDO,
            fg=self.COR_TEXTO,
        )
        label_historico.pack(fill="x", pady=(3, 0))

    def criar_botoes(self) -> None:
        area_botoes = tk.Frame(
            self.janela,
            bg=self.COR_FUNDO,
            padx=15,
            pady=5,
        )
        area_botoes.pack(fill="both", expand=True)

        botoes = [
            ("C", 0, 0, self.limpar_tudo, self.COR_ESPECIAL),
            ("⌫", 0, 1, self.apagar_ultimo, self.COR_ESPECIAL),
            ("%", 0, 2, self.calcular_porcentagem, self.COR_ESPECIAL),
            ("÷", 0, 3, lambda: self.selecionar_operacao("÷"),
             self.COR_OPERACAO),

            ("7", 1, 0, lambda: self.adicionar_numero("7"),
             self.COR_BOTAO),
            ("8", 1, 1, lambda: self.adicionar_numero("8"),
             self.COR_BOTAO),
            ("9", 1, 2, lambda: self.adicionar_numero("9"),
             self.COR_BOTAO),
            ("×", 1, 3, lambda: self.selecionar_operacao("×"),
             self.COR_OPERACAO),

            ("4", 2, 0, lambda: self.adicionar_numero("4"),
             self.COR_BOTAO),
            ("5", 2, 1, lambda: self.adicionar_numero("5"),
             self.COR_BOTAO),
            ("6", 2, 2, lambda: self.adicionar_numero("6"),
             self.COR_BOTAO),
            ("−", 2, 3, lambda: self.selecionar_operacao("−"),
             self.COR_OPERACAO),

            ("1", 3, 0, lambda: self.adicionar_numero("1"),
             self.COR_BOTAO),
            ("2", 3, 1, lambda: self.adicionar_numero("2"),
             self.COR_BOTAO),
            ("3", 3, 2, lambda: self.adicionar_numero("3"),
             self.COR_BOTAO),
            ("+", 3, 3, lambda: self.selecionar_operacao("+"),
             self.COR_OPERACAO),

            ("±", 4, 0, self.alternar_sinal, self.COR_BOTAO),
            ("0", 4, 1, lambda: self.adicionar_numero("0"),
             self.COR_BOTAO),
            (",", 4, 2, self.adicionar_decimal, self.COR_BOTAO),
            ("=", 4, 3, self.calcular_resultado, self.COR_OPERACAO),
        ]

        for coluna in range(4):
            area_botoes.grid_columnconfigure(coluna, weight=1)

        for linha in range(5):
            area_botoes.grid_rowconfigure(linha, weight=1)

        for texto, linha, coluna, comando, cor in botoes:
            botao = tk.Button(
                area_botoes,
                text=texto,
                command=comando,
                font=("Segoe UI", 18, "bold"),
                bg=cor,
                fg=self.COR_TEXTO,
                activebackground=cor,
                activeforeground=self.COR_TEXTO,
                relief="flat",
                bd=0,
                cursor="hand2",
            )

            botao.grid(
                row=linha,
                column=coluna,
                sticky="nsew",
                padx=4,
                pady=4,
            )

            cor_hover = (
                self.COR_OPERACAO_HOVER
                if cor == self.COR_OPERACAO
                else self.COR_BOTAO_HOVER
            )

            botao.bind(
                "<Enter>",
                lambda evento, b=botao, c=cor_hover: b.config(bg=c),
            )
            botao.bind(
                "<Leave>",
                lambda evento, b=botao, c=cor: b.config(bg=c),
            )

    def configurar_teclado(self) -> None:
        self.janela.bind(
            "<Key>",
            self.processar_tecla,
        )

    def processar_tecla(self, evento: tk.Event) -> None:
        tecla = evento.char
        nome_tecla = evento.keysym

        if tecla.isdigit():
            self.adicionar_numero(tecla)
        elif tecla in {",", "."}:
            self.adicionar_decimal()
        elif tecla in {"+", "-", "*", "/"}:
            operacoes = {
                "+": "+",
                "-": "−",
                "*": "×",
                "/": "÷",
            }
            self.selecionar_operacao(operacoes[tecla])
        elif nome_tecla in {"Return", "KP_Enter"}:
            self.calcular_resultado()
        elif nome_tecla == "BackSpace":
            self.apagar_ultimo()
        elif nome_tecla in {"Escape", "Delete"}:
            self.limpar_tudo()

    def adicionar_numero(self, numero: str) -> None:
        valor_atual = self.texto_resultado.get()

        if self.novo_numero or valor_atual == "0":
            novo_valor = numero
            self.novo_numero = False
        else:
            novo_valor = valor_atual + numero

        if len(novo_valor) <= 15:
            self.texto_resultado.set(novo_valor)

    def adicionar_decimal(self) -> None:
        valor_atual = self.texto_resultado.get()

        if self.novo_numero:
            self.texto_resultado.set("0,")
            self.novo_numero = False
        elif "," not in valor_atual:
            self.texto_resultado.set(valor_atual + ",")

    def selecionar_operacao(self, operacao: str) -> None:
        try:
            numero_atual = self.obter_valor_display()

            if (
                    self.valor_anterior is not None
                    and self.operacao_pendente is not None
                    and not self.novo_numero
            ):
                numero_atual = self.executar_operacao(
                    self.valor_anterior,
                    numero_atual,
                    self.operacao_pendente,
                )
                self.texto_resultado.set(
                    self.formatar_numero(numero_atual)
                )

            self.valor_anterior = numero_atual
            self.operacao_pendente = operacao
            self.texto_expressao.set(
                f"{self.formatar_numero(numero_atual)} {operacao}"
            )
            self.novo_numero = True

        except ValueError as erro:
            self.mostrar_erro(str(erro))

    def calcular_resultado(self) -> None:
        if (
                self.valor_anterior is None
                or self.operacao_pendente is None
        ):
            return

        try:
            numero_atual = self.obter_valor_display()

            resultado = self.executar_operacao(
                self.valor_anterior,
                numero_atual,
                self.operacao_pendente,
            )

            primeiro = self.formatar_numero(self.valor_anterior)
            segundo = self.formatar_numero(numero_atual)
            resultado_formatado = self.formatar_numero(resultado)

            expressao_completa = (
                f"{primeiro} {self.operacao_pendente} "
                f"{segundo} = {resultado_formatado}"
            )

            self.texto_expressao.set(expressao_completa)
            self.texto_historico.set(expressao_completa)
            self.texto_resultado.set(resultado_formatado)

            self.valor_anterior = resultado
            self.operacao_pendente = None
            self.novo_numero = True

        except ValueError as erro:
            self.mostrar_erro(str(erro))

    def executar_operacao(
            self,
            numero1: float,
            numero2: float,
            operacao: str,
    ) -> float:
        if operacao == "+":
            return self.calculadora.somar(numero1, numero2)

        if operacao == "−":
            return self.calculadora.subtrair(numero1, numero2)

        if operacao == "×":
            return self.calculadora.multiplicar(numero1, numero2)

        if operacao == "÷":
            return self.calculadora.dividir(numero1, numero2)

        raise ValueError("Operação inválida.")

    def calcular_porcentagem(self) -> None:
        try:
            numero = self.obter_valor_display()
            resultado = numero / 100

            texto = (
                f"{self.formatar_numero(numero)}% = "
                f"{self.formatar_numero(resultado)}"
            )

            self.texto_resultado.set(
                self.formatar_numero(resultado)
            )
            self.texto_expressao.set(texto)
            self.texto_historico.set(texto)
            self.novo_numero = True

        except ValueError as erro:
            self.mostrar_erro(str(erro))

    def alternar_sinal(self) -> None:
        try:
            numero = self.obter_valor_display()
            numero *= -1

            self.texto_resultado.set(
                self.formatar_numero(numero)
            )

        except ValueError as erro:
            self.mostrar_erro(str(erro))

    def apagar_ultimo(self) -> None:
        if self.novo_numero:
            return

        valor_atual = self.texto_resultado.get()

        if len(valor_atual) <= 1:
            self.texto_resultado.set("0")
            self.novo_numero = True
        else:
            self.texto_resultado.set(valor_atual[:-1])

    def limpar_tudo(self) -> None:
        self.texto_resultado.set("0")
        self.texto_expressao.set("")
        self.valor_anterior = None
        self.operacao_pendente = None
        self.novo_numero = True

    def obter_valor_display(self) -> float:
        valor = self.texto_resultado.get().replace(",", ".")

        try:
            return float(valor)
        except ValueError as erro:
            raise ValueError("Valor inválido.") from erro

    @staticmethod
    def formatar_numero(numero: float) -> str:
        if numero == int(numero):
            return str(int(numero))

        texto = f"{numero:.10f}".rstrip("0").rstrip(".")
        return texto.replace(".", ",")

    def mostrar_erro(self, mensagem: str) -> None:
        messagebox.showerror(
            "Erro",
            mensagem,
        )

        self.limpar_tudo()


def iniciar_aplicacao() -> None:
    janela = tk.Tk()
    CalculadoraApp(janela)
    janela.mainloop()


if __name__ == "__main__":
    iniciar_aplicacao()