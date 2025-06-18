const fs = require('fs');
const csv = require('csv-parser');

class LeitorCSV {
    async ler(caminho) {
        const linhas = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(caminho)
                .pipe(csv({ separator: ';' }))
                .on('data', (row) => {
                    console.log(`Lendo linha do CSV: ${row.EAN}`);
                    linhas.push(row);
                })
                .on('end', () => {
                    console.log(`Total de linhas lidas do CSV: ${linhas.length}`);
                    resolve(linhas);
                })
                .on('error', reject);
        });
    }
}

module.exports = LeitorCSV;
