const LeitorCSV = require('./services/LeitorCSV');
const GravadorCSV = require('./services/GravadorCSV');
const CapturadorCosmos = require('./services/CapturadorCosmos');
const BrowserManager = require('./services/BrowserManager');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browserURL = 'http://localhost:9222';

const caminhoCSVEntrada = './setemcaixa.csv';
const caminhoCSVSaida = './resultado.csv';

function esperar(ms) {
    console.log(`Aguardando ${ms / 1000} segundos...`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const leitor = new LeitorCSV();
    const gravador = new GravadorCSV();
    const browserManager = new BrowserManager(chromePath, browserURL);

    const linhasCSV = await leitor.ler(caminhoCSVEntrada);
    const { browser, page } = await browserManager.conectar();
    const capturador = new CapturadorCosmos(page);

    const dadosAdicionados = [];

    for (const linha of linhasCSV) {
        const ean = linha.EAN;
        try {
            await page.waitForSelector('#search-input', { visible: true });
            const info = await capturador.capturar(ean);

            dadosAdicionados.push({
                ...linha,
                EAN_CAIXA: info.eanCaixa,
                TIPO: info.tipo,
                QUANTIDADE_CAIXA: info.embalagem,
                LASTRO: info.lastro,
                CAMADA: info.camada,
                COMPRIMENTO: info.comprimento,
                ALTURA: info.altura,
                LARGURA: info.largura,
                PESO_BRUTO: info.pesoBruto,
                PESO_LIQUIDO: info.pesoLiquido
            });

            await esperar(2000);
        } catch (error) {
            console.error(`Erro ao capturar informações para EAN ${ean}:`, error);
        }
    }

    await gravador.gravar(caminhoCSVSaida, dadosAdicionados);
    await browser.close();
})();
