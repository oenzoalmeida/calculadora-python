class Calculadora:
    """Responsável pelas operações matemáticas da aplicação."""

    @staticmethod
    def somar(numero1: float, numero2: float) -> float:
        return numero1 + numero2

    @staticmethod
    def subtrair(numero1: float, numero2: float) -> float:
        return numero1 - numero2

    @staticmethod
    def multiplicar(numero1: float, numero2: float) -> float:
        return numero1 * numero2

    @staticmethod
    def dividir(numero1: float, numero2: float) -> float:
        if numero2 == 0:
            raise ValueError("Não é possível dividir por zero.")

        return numero1 / numero2