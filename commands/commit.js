const tools = require('../helpers/tools');
const createLoading = require('../helpers/loading');

async function main(args) {
    let loading = createLoading('Lendo nome');
    setTimeout(async () => {
        loading.stop();
        const nome = await tools.read('Digite seu nome: ');
        loading = loading.continue();
        setTimeout(() => {
            loading.close(`o nome é ${nome}`);
        }, 1000);
    }, 2000);
    return;
}

module.exports = main;
