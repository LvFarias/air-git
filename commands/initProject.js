const tools = require('../helpers/tools');
const createLoading = require('../helpers/loading');
const readmeConfig = require('../files/readmeConfig');

function execPublish(args) {
    main();
}

async function main() {
    let loading = createLoading('creating "README.md"');

    const readme = require('../files/readme');
    const writeReadme = await tools.writeFile('README.md', readme).catch(() => {
        loading.error('error in creating "README.md"');
    });
    if (!writeReadme) return;

    loading = loading.next('creating "readmeConfig.json"', 'created "README.md"');
    
    const writeReadmeConfig = await tools.writeFile('readmeConfig.json', tools.formatJSONtoFile(readmeConfig)).catch(() => {
        loading.error('error in creating "readmeConfig.json"');
    });
    if (!writeReadmeConfig) return;
    
    loading = loading.next('reading "package.json"', 'created "readmeConfig.json"');

    const packageContent = await tools.execute('cat package.json').catch(() => {
        loading.error('error in reading "package.json"');
    });
    if (!packageContent) return;
    
    loading = loading.next('changing "package.json"', 'readed "package.json"');
    
    const packageJSON = JSON.parse(JSON.parse(JSON.stringify(packageContent)));
    packageJSON.version = '0.0.1';
    packageJSON.author = 'Company Name';
    packageJSON.contributors = ['User Name'];
    packageJSON.description = 'Description of your project.';
    packageJSON.homepage = `${readmeConfig.gitUrl}/${readmeConfig.group}/${readmeConfig.project}`;

    const writePackage = await tools.writeFile('package.json', tools.formatJSONtoFile(packageJSON)).catch(loading.error);
    if (!writePackage) return;
    
    loading.close('finish');

    return;
}

module.exports = execPublish;
