const tools = require('../helpers/tools');
const translate = require('../helpers/translate');
const createLoading = require('../helpers/loading');
const airgitConfig = require('../files/airgitConfig');
const readme = require('../files/readme');

async function main(args) {
    let loading = createLoading(`${translate('creating')} "airgitConfig"`);
    for (const key in airgitConfig) {
        if (airgitConfig.hasOwnProperty(key)) {
            const value = airgitConfig[key];
            if (!args.y || value === '') {
                loading.stop();
                let question = translate(`init_question_${key}`);
                if (airgitConfig.gitPlatform === 'github') {
                    if (key === 'company') {
                        delete airgitConfig[key];
                        continue;
                    }
                    if (key === 'group') {
                        question = translate(`init_question_username`);
                    }
                }
                airgitConfig[key] = await tools.read(question, value);
                loading = loading.continue();
            }
        }
    }
    const writeAirgitConfig = await tools.writeFile('.airgitConfig', tools.formatJSONtoFile(airgitConfig)).catch(() => {
        loading.error(`${translate('error_creating_file')} "airgitConfig"`);
    });
    if (!writeAirgitConfig) return;
    
    loading = loading.next(`${translate('creating')} "README.md"`, `${translate('created')} "airgitConfig"`);
    
    const writeReadme = await tools.writeFile('README.md', readme).catch(() => {
        loading.error(`${translate('error_creating_file')} "README.md"`);
    });
    if (!writeReadme) return;
    
    loading = loading.next(`${translate('reading')} "package.json"`, `${translate('created')} "README.md"`);
    
    const packageContent = await tools.execute('cat package.json').catch(() => {
        loading.close(translate('finish'));
    });
    if (!packageContent) return;
    
    loading = loading.next(`${translate('changing')} "package.json"`, `${translate('readed')} "package.json"`);

    const packageJSON = JSON.parse(JSON.parse(JSON.stringify(packageContent)));
    if (!packageJSON.author) {
        packageJSON.author = 'Airlfuencers';
    }
    packageJSON.version = airgitConfig.version;
    if (!packageJSON.contributors || !packageJSON.contributors.length) {
        packageJSON.contributors = ['User Name'];
    }
    if (!packageJSON.description) {
        packageJSON.description = 'Description of your project.';
    }
    if (!packageJSON.description) {
        packageJSON.description = 'Description of your project.';
    }
    if (!packageJSON.homepage) {
        const companyGitLab = airgitConfig.gitPlatform === 'gitlab' ? `.${airgitConfig.company}` : '';
        const br = airgitConfig.gitPlatform === 'gitlab' ? `.br` : '';
        packageJSON.homepage = `https://${airgitConfig.gitPlatform}${companyGitLab}.com${br}/${airgitConfig.group}/${airgitConfig.project}`;
    }

    const writePackage = await tools.writeFile('package.json', tools.formatJSONtoFile(packageJSON)).catch(loading.error);
    if (!writePackage) return;

    loading.close(translate('finish'));

    return;
}

module.exports = main;
