const tools = require('../helpers/tools');
const colors = require('../helpers/colors');
const createLoading = require('../helpers/loading');
const readmeTools = require('../helpers/readme-tools');

let commands = [];
let packageJSON = {};
let tagVersion = '';
let commitBranch = '';
let commitMessage = '';

function execPublish(args) {
    tagVersion = args.v || args.version;
    commitBranch = args.b || args.branch;
    commitMessage = args.m || args.message;

    if (!commitMessage) {
        console.log(`argument ${colors.Bright}-m${colors.Reset} ou ${colors.Bright}--message${colors.Reset} is required`);
        return;
    }
    if (!tagVersion) {
        console.log(`argument ${colors.Bright}-v${colors.Reset} ou ${colors.Bright}--version${colors.Reset} is required`);
        return;
    }
    if (!commitBranch) {
        console.log(`argument ${colors.Bright}-b${colors.Reset} ou ${colors.Bright}--branch${colors.Reset} is required`);
        return;
    }

    const branchToPublish = (args.tm || args['to-master']) ? 'master' : 'stage';
    commands = [
        {
            command: 'git pull',
            name: 'Rodando: git pull',
        },
        {
            command: 'git add .',
            name: 'Adicionando arquivos modificados',
        },
        {
            command: `git commit -m "${commitMessage}"`,
            name: `Commitando com a menssagem: "${commitMessage}"`,
        },
        {
            command: 'git push',
            name: 'Rodando: git push',
        },
        {
            command: `git checkout ${branchToPublish}`,
            name: `Mudando para branch: ${branchToPublish}`,
        },
        {
            command: 'git pull',
            name: 'Verificando conflitos',
        },
        {
            command: `git merge ${commitBranch}`,
            name: `Merge de ${commitBranch} pra ${branchToPublish}`,
        },
        {
            name: 'Criando merge request',
            command: 'git push -o merge_request.create -o merge_request.target=master',
        },
        {
            name: `Criando a tag "v${tagVersion}"`,
            command: `git tag -a ${tagVersion} -m "v${tagVersion}"`,
        },
        {
            command: 'git push origin --tags',
            name: 'Atualizando as tags no repositório',
        },
    ];
    if (branchToPublish === commitBranch) commands.splice(3, 4);

    main();
}

async function main() {

    let loading = createLoading('reading "readmeConfig.json"');
    const projectConfig = await readmeTools.getProjectConfigs(tagVersion).catch(loading.error);
    if (!projectConfig) return;
    
    if (projectConfig.language === 'node') {
        loading = loading.next('reading "package.json"', 'readed "readmeConfig.json"');
        const packageContent = await tools.execute('cat package.json').catch(() => {
            loading.error('error in reading "package.json"');
        });
        if (!packageContent) return;

        loading = loading.next('changing "package.json"', 'readed "package.json"');
        packageJSON = JSON.parse(JSON.parse(JSON.stringify(packageContent)));
        const newPackageContent = packageContent.replace(`"version": "${packageJSON.version}"`, `"version": "${tagVersion}"`);
    
        const result = await tools.writeFile('package.json', newPackageContent).catch(loading.error);
        if (!result) return;
    
        loading = loading.next('changing version in "readmeConfig.json"', 'changed "package.json"');
    } else {
        loading = loading.next('changing version in "readmeConfig.json"', 'readed "readmeConfig.json"');
    }
    
    let oldConfig = await tools.execute('cat readmeConfig.json').catch();
    oldConfig = JSON.parse(oldConfig);
    oldConfig.version = tagVersion;
    
    const result2 = await tools.writeFile('readmeConfig.json', tools.formatJSONtoFile(oldConfig)).catch(loading.error);
    if (!result2) return;

    loading = loading.next('reading "README.md"', 'changed version in "readmeConfig.json"');

    const readme = await tools.execute('cat README.md').catch(() => {
        loading.error('error in reading "README.md"');
    });
    if (!readme) return;

    loading = loading.next('generating new modified "README.md"', 'readed "README.md"');
    const newReadme = await readmeTools.getNewReadme(readme, packageJSON);
    if (!newReadme) return;

    loading = loading.next('changing "README.md"', 'generated new modified "README.md"');
    const result3 = await tools.writeFile('README.md', newReadme).catch(loading.error);
    if (!result3) return;

    loading.close('changed "README.md"');

    if (projectConfig.gitPlatform !== 'gitlab') {
        const index = commands.length - 3;
        commands[index] = {
            name: 'Rodando: git push',
            command: 'git push',
        }
    }
    if (projectConfig.deleteBranchPublush === 'true' && commitBranch !== projectConfig.homologBranch && commitBranch !== 'master') {
        commands.push({
            name: 'Deletando branch',
            command: `git push origin --delete ${commitBranch}`,
        });
    }

    const resultCommands = await tools.runManyCommands(commands);
    if (!resultCommands) return;

    loading = createLoading('finish').close('finish');

    return;
}

module.exports = execPublish;
