const tools = require('../helpers/tools');
const colors = require('../helpers/colors');
const createLoading = require('../helpers/loading');
const readmeTools = require('../helpers/readme-tools');

let commands = [];
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
    let loading = createLoading('reading "package.json"');

    const packageContent = await tools.execute('cat package.json').catch(() => {
        loading.error('error in reading "package.json"');
    });
    if (!packageContent) return;

    loading = loading.next('changing "package.json"', 'readed "package.json"');
    const packageJSON = JSON.parse(JSON.parse(JSON.stringify(packageContent)));
    const newPackageContent = packageContent.replace(`"version": "${packageJSON.version}"`, `"version": "${tagVersion}"`);

    const result = await tools.writeFile('package.json', newPackageContent).catch(loading.error);
    if (!result) return;

    loading = loading.next('reading "README.md"', 'changed "package.json"');
    const readme = await tools.execute('cat README.md').catch(() => {
        loading.error('error in reading "README.md"');
    });
    if (!readme) return;

    loading = loading.next('reading "readmeConfig.json"', 'readed "README.md"');
    const projectConfig = await readmeTools.getProjectConfigs(tagVersion).catch(loading.error);
    if (!projectConfig) return;

    loading = loading.next('generating new modified "README.md"', 'readed "readmeConfig.json"');
    const newReadme = await readmeTools.getNewReadme(readme, packageJSON);
    if (!newReadme) return;

    loading = loading.next('changing "README.md"', 'generated new modified "README.md"');
    const result2 = await tools.writeFile('README.md', newReadme).catch(loading.error);
    if (!result2) return;

    loading.close('changed "README.md"');

    if (!(projectConfig.gitUrl.indexOf('gitlab') > -1)) {
        commands[7] = {
            name: 'Rodando: git push',
            command: 'git push',
        }
    }

    const resultCommands = await tools.runManyCommands(commands);
    if (!resultCommands) return;

    loading = createLoading('finish').close('finish');

    return;
}

module.exports = execPublish;
