const tools = require('../helpers/tools');
const createLoading = require('../helpers/loading');
const readmeTools = require('../helpers/readme-tools');

let commands = [];
let runPush = false;
let tagVersion = '';
let commitMessage = '';

function execCommit(args) {
    runPush = args.p || args.push;
    commitMessage = args.m || args.message;
    
    if (!commitMessage) {
        console.log(`argument ${colors.Bright}-m${colors.Reset} ou ${colors.Bright}--message${colors.Reset} is required`);
        return;
    }

    commands = [
        'git add .',
        `git commit -m "${commitMessage}"`,
    ];
    if (runPush) commands.push('git push');

    main();
}

async function main() {
    let loading = createLoading('reading "package.json"');
    
    const packageContent = await tools.execute('cat package.json').catch(() => {
        loading.error('error in reading "package.json"');
    });
    if (!packageContent) return;
    
    const packageJSON = JSON.parse(JSON.parse(JSON.stringify(packageContent)));
    tagVersion = packageJSON.version;
    
    loading = loading.next('reading "README.md"', 'readed "package.json"');
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

    const resultCommands = await tools.runManyCommands(commands);
    if (!resultCommands) return;

    loading = createLoading('finish').close('finish');
    
    return;
}

module.exports = execCommit;
