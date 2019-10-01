const tools = require('../helpers/tools');
const readmeTools = require('../helpers/readme-tools');
const createLoading = require('../helpers/loading');
const readmeConfig = require('../files/readmeConfig');

function execInit() {
    main();
}

async function main() {
    let loading = createLoading('updating "readmeConfig.json"');

    let oldConfig = await tools.execute('cat readmeConfig.json').catch();
    oldConfig = JSON.parse(oldConfig);
    delete oldConfig.color;
    delete oldConfig.gitUrl;
    for (const item in readmeConfig) {
        if (readmeConfig.hasOwnProperty(item)) {
            const itemValue = readmeConfig[item];
            if(!oldConfig[item]) {
                oldConfig[item] = itemValue;
            }
        }
    }

    await tools.writeFile('readmeConfig.json', tools.formatJSONtoFile(oldConfig)).catch(() => {
        loading.error('error in updating "readmeConfig.json"');
    });
    
    loading.close('finish');

    return;
}

module.exports = execInit;
