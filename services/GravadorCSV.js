const fs = require('fs');
const fastcsv = require('fast-csv');

class GravadorCSV {
    async gravar(caminhoSaida, dados) {
        return new Promise((resolve, reject) => {
            const ws = fs.createWriteStream(caminhoSaida);
            fastcsv
                .write(dados, { headers: true, delimiter: ';' })
                .pipe(ws)
                .on('finish', () => {
                    console.log('Arquivo CSV gravado com sucesso.');
                    resolve();
                })
                .on('error', reject);
        });
    }
}

module.exports = GravadorCSV;
