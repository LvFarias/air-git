const fs = require('fs');
const colors = require('./colors');
const minimist = require('minimist');
const exec = require('child_process').exec;
const createLoading = require('./loading');
const args = minimist(process.argv.slice(2));

async function execute(command) {
    return new Promise((res, rej) => {
        exec(command, (err, ret, retErr) => {
            if (err) {
                debugConsole(retErr);
                rej(`error to execute command ${err}`);
            } else {
                res(ret || 'success');
            }
        });
    });
}

async function writeFile(file, content) {
    return new Promise((res, rej) => {
        fs.writeFile(file, content, function (err) {
            if (err) {
                debugConsole(err);
                rej(`error in write file: ${file}`);
            } else {
                res('success');
            }
        });
    });
}

function debugConsole(param, ...optionalParams) {
    if (args.verbose) {
        console.log(colors.Bright + colors.bg.White + colors.fg.Black + '#### VERBOSE ####' + colors.Reverse);
        console.log(colors.bg.White + colors.fg.Black + param + colors.Reverse);
        for (const i in optionalParams) {
            if (optionalParams.hasOwnProperty(i)) {
                console.log(optionalParams[i] + colors.Reverse);
            }
        }
        console.log(colors.Bright + colors.bg.White + colors.fg.Black + '#### VERBOSE ####' + colors.Reverse);
    }
}

async function getFolderSize(folder) {
    return new Promise(async res => {
        const ret = await execute(`du -sh ${folder}`);
        res(String(ret).split('\t')[0].replace(',', '.'));
    });
}

function getSumaryLevel(level) {
    let ret = '';
    for (let i = 1; i < level; i++) {
        ret += '  ';
    }
    ret += '- ';
    return ret;
}

async function runManyCommands(commands = []) {
    return new Promise(async (res, rej) => {
        let loading = createLoading(commands[0].name);
        for (const i in commands) {
            if (commands.hasOwnProperty(i)) {
                const command = commands[i];
                if (i != 0) {
                    loading = loading.next(command.name);
                }
                const result = await execute(command.command).catch(err => {
                    loading.error(err);
                    rej(err);
                });
                if (!result) return;
            }
        }
        loading.close(commands[commands.length - 1].name);
        res('runned all commands');
    });
}

function formatJSONtoFile(json = {}) {
    return JSON.stringify(json, null, '\t');
}

async function getDependenciesFromPython() {
    let count = 0;
    let requirements = await execute('cat requirements.txt').catch(console.log);
    requirements = requirements.split('\n');
    for (const i in requirements) {
        if (requirements.hasOwnProperty(i)) {
            const line = requirements[i];
            if (line.length > 0) {
                count++;
            } 
        }
    }
    return count;
}

async function getPropertiesLength(obj, propertie) {
    return new Promise((res, rej) => {
        let count = 0;
        let itemOfCount = obj;
        if (typeof (propertie) === 'string') {
            itemOfCount = obj[propertie];
        } else {
            for (const i in propertie) {
                if (propertie.hasOwnProperty(i)) {
                    const key = propertie[i];
                    itemOfCount = itemOfCount[key];
                }
            }
        }
        for (const i in itemOfCount) {
            if (itemOfCount.hasOwnProperty(i)) {
                count++;
            }
        }
        res(count);
    });
}

async function configureProjectConfigs() {
    return new Promise(async (res, rej) => {
        try {
            const newConfig = {};
            let config = await execute('cat readmeConfig.json');
            config = JSON.parse(config);
            const gitUrl = config.gitPlatform === 'gitlab' ? `http://gitlab.${config.company}.com.br` : 'https://github.com';
            newConfig.groupUrl = `${gitUrl}/${config.group}`;
            newConfig.projectUrl = `${gitUrl}/${config.group}/${config.project}`;
            newConfig.tagUrl = `${newConfig.projectUrl}${config.gitPlatform === 'gitlab' ? '/tags' : '/releases/tag'}`;

            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    const item = config[key];
                    newConfig[key] = item.split(' ').join('%20').split('-').join('--').split('_').join('__');
                }
            }

            res(newConfig);
        } catch (error) {
            debugConsole(error);
            rej('error in readmeConfig.json');
        }
    });
}

module.exports = {
    execute,
    writeFile,
    debugConsole,
    getFolderSize,
    getSumaryLevel,
    runManyCommands,
    formatJSONtoFile,
    getPropertiesLength,
    configureProjectConfigs,
    getDependenciesFromPython,
}