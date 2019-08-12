const fs = require('fs');
const exec = require('child_process').exec;
const createLoading = require('./loading');

async function execute(command) {
    return new Promise((res, rej) => {
        exec(command, (err, ret, retErr) => {
            if (err) {
                rej(`error to execute command ${err}`);
                console.log(retErr);
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
                rej(`error in write file: ${file}`);
            } else {
                res('success');
            }
        });
    });
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
        let loading = createLoading(commands[0]);
        for (const i in commands) {
            if (commands.hasOwnProperty(i)) {
                const command = commands[i];
                if (i != 0) {
                    loading = loading.next(command);
                }
                const result = await execute(command).catch(err => {
                    loading.error(err);
                    rej(err);
                });
                if (!result) return;
            }
        }
        loading.close(commands[commands.length - 1]);
        res('runned all commands');
    });
}

function formatJSONtoFile(json = {}) {
    return JSON.stringify(json, null, '\t');
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
            newConfig.groupUrl = `${config.gitUrl}/${config.group}`;
            newConfig.projectUrl = `${config.gitUrl}/${config.group}/${config.project}`;

            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    const item = config[key];
                    newConfig[key] = item.split(' ').join('%20').split('-').join('--').split('_').join('__');
                }
            }

            res(newConfig);
        } catch (error) {
            rej('error in readmeConfig.json');
        }
    });
}

module.exports = {
    execute,
    writeFile,
    getFolderSize,
    getSumaryLevel,
    runManyCommands,
    formatJSONtoFile,
    getPropertiesLength,
    configureProjectConfigs,
}