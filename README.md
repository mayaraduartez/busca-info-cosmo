# Coletor Logístico (Node.js)

> Automatiza a busca de informações logísticas no **Cosmos (Bluesoft)** via navegador, e consolida o resultado em planilha para repasse ao time de análises.

---

## Visão geral

* **Entrada:** CSV com a coluna **`EAN`** (um EAN por linha).
* **Processo:** Abre o Chrome já em execução (modo *remote debugging*), acessa o Cosmos, pesquisa cada EAN e extrai campos logísticos da tabela de resultado.
* **Saída:** Planilha com dados consolidados. **No código atual, a saída é `CSV` (`resultado.csv`)**. Se você precisa de **`.xlsx`**, veja a seção [Exportar para XLSX](#📤-exportar-para-xlsx).

---

## Estrutura do projeto

```
.
├─ index.js                  # Orquestra o fluxo: ler CSV -> coletar -> gravar CSV
├─ services/
│  ├─ BrowserManager.js      # Conecta ao Chrome via puppeteer-core (Remote Debugging)
│  ├─ CapturadorCosmos.js    # Pesquisa o EAN e extrai os dados da tabela
│  ├─ LeitorCSV.js           # Lê o CSV de entrada (separador ';')
│  └─ GravadorCSV.js         # Grava o CSV de saída (separador ';')
└─ setemcaixa.csv            # (exemplo) arquivo de entrada com coluna EAN
```

---

## Stack & dependências

* **Node.js**: 18+ (recomendado)
* **Navegador**: Google Chrome (controlado externamente)
* **Pacotes NPM**:

  * `puppeteer-core` – controla um Chrome já iniciado via *remote debugging*
  * `csv-parser` – leitura do CSV de entrada
  * `fast-csv` – escrita do CSV de saída
  * (`exceljs` – *opcional* para exportar `.xlsx`)

### Instalação

```bash
npm init -y
npm i puppeteer-core csv-parser fast-csv
# opcional para .xlsx
npm i exceljs
```

---

## Configuração

Edite as variáveis no `index.js` conforme seu ambiente:

```js
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browserURL = 'http://localhost:9222';
const caminhoCSVEntrada = './setemcaixa.csv';
const caminhoCSVSaida = './resultado.csv';
```

* **`chromePath`**: caminho do executável do Chrome (macOS no exemplo). Em Windows/Linux, ajuste:

  * Windows (ex.): `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`
  * Linux (ex.): `/usr/bin/google-chrome`
* **`browserURL`**: URL do Chrome com *remote debugging* habilitado.
* **Arquivos**: a entrada precisa ter a coluna `EAN` (maiúscula). O separador padrão é `;` (ponto e vírgula).

### Iniciar o Chrome com *remote debugging*

> O projeto usa `puppeteer-core.connect`, portanto o Chrome deve estar **rodando antes**.

* **macOS / Linux**

  ```bash
  google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-profile
  ```
* **Windows (PowerShell)**

  ```powershell
  & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\\temp\\chrome-profile"
  ```

> Dica: mantenha uma *user data dir* dedicada para evitar interferência do seu perfil principal.

---

## Execução

1. Garanta o Chrome rodando com `--remote-debugging-port=9222`.
2. Confirme/ajuste `chromePath`, `browserURL`, `caminhoCSVEntrada` e `caminhoCSVSaida`.
3. Rode:

   ```bash
   node index.js
   ```
4. Ao final, verifique o arquivo **`resultado.csv`**.

---

## Lógica de captura

* **`BrowserManager.conectar()`**: usa `puppeteer.connect` com `browserURL` e navega até `https://cosmos.bluesoft.com.br/`.
* **`LeitorCSV.ler()`**: processa o CSV de entrada (separador `;`) e retorna um array de linhas; cada linha deve conter `EAN`.
* **`CapturadorCosmos.capturar(ean)`**:

  * Limpa e preenche `#search-input` com o EAN, pressiona *Enter*.
  * Aguarda `table.table-responsive tbody` ficar visível (até 3s).
  * Varre as linhas da tabela e, quando encontra uma com **1ª coluna com 14 caracteres (EAN de caixa)** e **≥10 colunas**, extrai:

    * `eanCaixa`, `tipo`, `embalagem` (quantidade por caixa),
    * `lastro`, `camada`,
    * `comprimento`, `altura`, `largura`,
    * `pesoBruto`, `pesoLiquido`.
* **`index.js`**: para cada EAN, agrega os campos ao objeto original e grava tudo no final através do `GravadorCSV`.

### Campos de saída

| Campo de saída     | Origem / Observação                         |
| ------------------ | ------------------------------------------- |
| `EAN_CAIXA`        | 1ª coluna (14 dígitos) da tabela resultante |
| `TIPO`             | coluna 2                                    |
| `QUANTIDADE_CAIXA` | coluna 3 ("embalagem")                      |
| `LASTRO`           | coluna 4                                    |
| `CAMADA`           | coluna 5                                    |
| `COMPRIMENTO`      | coluna 6                                    |
| `ALTURA`           | coluna 7                                    |
| `LARGURA`          | coluna 8                                    |
| `PESO_BRUTO`       | coluna 9                                    |
| `PESO_LIQUIDO`     | coluna 10                                   |

> Caso a estrutura do site mude (classe da tabela, ordem/quantidade de colunas, seletor `#search-input`), ajuste os seletores em `CapturadorCosmos.js`.

---

## Ritmo / anti-bloqueio

* Há um `await esperar(2000)` entre consultas (2s). Ajuste conforme necessário para evitar *rate limit*.
* Use listas de EAN menores em testes.

---

## CSV de exemplo (entrada)

```csv
EAN
7891234567890
7899876543210
```

> O leitor usa `;` como separador. Se seu arquivo usa vírgula, ajuste `LeitorCSV.js`.

---

## Solução de problemas

* **Timeout no seletor `#search-input` ou na tabela**: verifique se o login foi realizado e se o Chrome abriu na janela correta. Aumente `timeout` no `waitForSelector`.
* **Estrutura da página mudou**: ajuste `.table-responsive`, ordem das colunas e condição `colunas[0].length === 14`.
* **CSV com separador errado**: alinhe `LeitorCSV.js` (opção `separator`) e o seu arquivo.
* **Acesso negado / Captcha**: reduza o ritmo, faça login manual no perfil usado pelo Chrome e reexecute.

---

## Autoria & manutenção

* **Autor:** Mayara Duarte
