# Calculadora em Python (e na web)

Calculadora com interface gráfica desenvolvida em Python utilizando Tkinter. Desde 2026, o repositório também inclui uma versão web construída sobre a mesma lógica.

## Contexto

Este foi um dos meus primeiros projetos da faculdade de Ciência da Computação, conservado como parte da evolução do meu portfólio: um utilitário de desktop completo, com tratamento de erros, suporte a teclado e regras de interface, tudo construído com a biblioteca padrão do Python. A versão web foi criada depois, como exercício de port da lógica original para o navegador, sem apagar a versão acadêmica.

## Evolução: original → web

| | Original (Tkinter) | Web |
|---|---|---|
| Interface | Tkinter (desktop) | HTML/CSS/JS puros, responsiva |
| Lógica | `calculadora.py` | `web/calculator.js` (mesma máquina de estados) |
| Histórico | última operação | lista com até 20 cálculos |
| Memória | Não disponível | M+, M−, MR, MC |
| Testes | manuais | 36 testes automatizados (`node --test`) |
| Demo | `python main.py` | https://oenzoa-calculadora.web.app |

A versão web preserva a semântica do original: avaliação encadeada ao trocar operador, divisão por zero como erro explícito, vírgula como separador decimal e o mesmo mapa de teclas.

### Formatação dos resultados

As interfaces mantêm seus formatos próprios, conforme decisão do responsável pelo produto. A versão Python apresenta até dez casas decimais. A versão web usa até doze dígitos significativos. Os zeros finais desnecessários são removidos, e a vírgula é usada como separador decimal. Por exemplo, `1 ÷ 3` aparece como `0,3333333333` no Python e `0,333333333333` na web. Essa diferença de apresentação é intencional e não exige igualdade textual entre as duas interfaces.

## Funcionalidades (web)

- Soma, subtração, multiplicação e divisão.
- Tratamento de divisão por zero e entradas inválidas.
- Porcentagem e alternância de sinal (±).
- Apagar último dígito (⌫) e limpar tudo (C).
- Memória: M+, M−, MR e MC.
- Histórico dos últimos cálculos.
- Suporte a teclado (números, operadores, Enter, Backspace, Esc e %).
- Vírgula como separador decimal.

## Tecnologias utilizadas

**Original:** Python 3, Tkinter.

**Web:** HTML, CSS e JavaScript puros (sem frameworks), testes com `node:test`, hospedagem no Firebase Hosting.

## Como executar

### Versão desktop (Python)

```bash
git clone https://github.com/oenzoalmeida/calculadora-python.git
cd calculadora-python
python main.py
```

### Versão web

```bash
# sirva a pasta web/ com qualquer servidor estático, por exemplo:
python -m http.server 8000 --directory web
# abra http://localhost:8000
```

## Estrutura do projeto

```
calculadora-python/
├── calculadora.py          # lógica da versão original (preservada)
├── main.py                 # interface Tkinter da versão original (preservada)
├── web/                    # versão web
│   ├── index.html
│   ├── style.css
│   ├── app.js              # interface
│   └── calculator.js       # motor de cálculo (port da lógica)
├── tests/
│   └── calculator.test.mjs # testes do motor
├── firebase.json           # Firebase Hosting
├── .github/workflows/      # CI (Python + web) e deploy
├── pyproject.toml
├── uv.lock
├── README.md
└── .gitignore
```

## Testes

```bash
node --test tests/calculator.test.mjs
```

Cobrem operações básicas, porcentagem, casas decimais, divisão por zero, limpeza, memória e histórico.

## Autor

Enzo Almeida
