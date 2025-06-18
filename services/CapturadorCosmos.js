class CapturadorCosmos {
    constructor(page) {
        this.page = page;
    }

    async capturar(ean) {
        await this.page.$eval('#search-input', input => input.value = '');
        console.log(`Pesquisando por EAN: ${ean}`);
        await this.page.type('#search-input', ean);
        await this.page.keyboard.press('Enter');

        await this.page.waitForSelector('table.table-responsive tbody', { visible: true, timeout: 3000 })
            .catch(() => null);

        const dados = await this.page.evaluate(() => {
            const linhas = document.querySelectorAll('table.table-responsive tbody tr');
            let eanCaixa = 'N/A', tipo = 'N/A', embalagem = 'N/A';
            let lastro = 'N/A', camada = 'N/A', comprimento = 'N/A', altura = 'N/A';
            let largura = 'N/A', pesoBruto = 'N/A', pesoLiquido = 'N/A';

            linhas.forEach(linha => {
                const colunas = [...linha.querySelectorAll('td')].map(td => td.innerText.trim());
                if (colunas.length > 9 && colunas[0].length === 14) {
                    [eanCaixa, tipo, embalagem, lastro, camada, comprimento, altura, largura, pesoBruto, pesoLiquido] = colunas;
                }
            });

            return { eanCaixa, tipo, embalagem, lastro, camada, comprimento, altura, largura, pesoBruto, pesoLiquido };
        });

        console.log(`Informações capturadas para EAN ${ean}:`, dados);
        return dados;
    }
}

module.exports = CapturadorCosmos;
