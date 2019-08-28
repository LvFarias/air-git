const tools = require('./tools');

let tagVersion = '';
let packageJSON = {};
let projectConfig = {};

const todayDate = new Date();
const today = `${todayDate.getDate()}%20/%20${todayDate.getMonth() + 1}%20/%20${todayDate.getFullYear()}`;

async function getNewReadme(readme, pkJSON) {
    packageJSON = pkJSON;
    return new Promise(async res => {
        readme = await deleteExamplesLines(readme);
        readme = await changeDescriptionInReadme(readme);
        readme = await changeAuthorsInReadme(readme);
        readme = await changeBadgesInReadme(readme);
        readme = await changeSumaryInReadme(readme);
        res(readme);
    });
}
async function deleteExamplesLines(readme) {
    return new Promise(async res => {
        readme = String(readme).replace(' This part will be generated automatically when the **"publish"** or **"commit"** command is called.', '');
        readme = String(readme).replace('\nThe summary will be generated automatically when the **"publish"** or **"commit"** command is called.', '');
        readme = String(readme).replace('\nAuthors imported from **"package.json"**', '');
        res(readme);
    });
}
async function changeDescriptionInReadme(readme) {
    return new Promise(async res => {
        const oldDescription = String(readme).split('## Description')[1].split('#')[0];
        const newDescription = `\n\n${packageJSON.description}\n\n`;

        readme = String(readme).replace(oldDescription, newDescription);
        res(readme);
    });
}
async function changeAuthorsInReadme(readme) {
    return new Promise(async res => {
        let newAuthors = `\n\n`;
        const oldAuthors = String(readme).split('## Authors')[1].split('#')[0];
        for (const i in packageJSON.contributors) {
            if (packageJSON.contributors.hasOwnProperty(i)) {
                const author = packageJSON.contributors[i];
                newAuthors += `- ${author}\n`;
            }
        }

        readme = String(readme).replace(oldAuthors, newAuthors);
        res(readme);
    });
}
async function changeBadgesInReadme(readme) {
    return new Promise(async res => {
        let badgeSize = '';
        if (projectConfig.folderSize !== '') {
            const sizeProject = await tools.getFolderSize(projectConfig.folderSize);
            badgeSize = `[![](https://img.shields.io/badge/Size-${sizeProject}-critical)]() `;
        }

        const dependencies = await tools.getPropertiesLength(packageJSON, 'dependencies');

        // tslint:disable-next-line: max-line-length
        const badges = `[![](https://img.shields.io/badge/Version-${tagVersion}-${projectConfig.color})](${projectConfig.tagUrl}/${tagVersion}) [![](https://img.shields.io/badge/Framework-${projectConfig.framework}-yellow)]() [![](https://img.shields.io/badge/Dependencies-${dependencies}-important)]() [![](https://img.shields.io/badge/Platforms-${projectConfig.platforms}-informational)]() ${badgeSize}[![](https://img.shields.io/badge/Last%20Commit-${today}-success)]() [![](https://img.shields.io/badge/Group-${projectConfig.group}-${projectConfig.color})](${projectConfig.groupUrl})`;
        const oldHeader = String(readme).split('[TOC]')[0];
        let newHeader = oldHeader.split('\n');

        if (newHeader.length === 3) {
            newHeader[1] = '\n' + badges;
            newHeader = newHeader.join('\n') + '\n';
        } else {
            newHeader[2] = badges;
            newHeader = newHeader.join('\n');
        }

        readme = String(readme).replace(oldHeader, newHeader);

        res(readme);
    });
}
async function changeSumaryInReadme(readme) {
    return new Promise(async res => {
        let newSumary = `\n\n`;
        const sumaryList = [];
        const fullReadme = String(readme).split('\n');
        const oldSumary = String(readme).split('## Sumary')[1].split('#')[0];
        for (const i in fullReadme) {
            if (fullReadme.hasOwnProperty(i)) {
                const row = fullReadme[i];
                if (row.indexOf('#') === 0 && row.split("#").length - 1 > 1 && row !== '## Sumary') {
                    sumaryList.push(row.substr(1));
                }
            }
        }
        for (const i in sumaryList) {
            if (sumaryList.hasOwnProperty(i)) {
                const sumaryItem = sumaryList[i];
                const level = sumaryItem.split("#").length - 1;
                const name = sumaryItem.split("#").join('').substr(1);
                const link = `#${name.toLowerCase().split(' ').join('-')}`;

                newSumary += `${tools.getSumaryLevel(level)}[${name}](${link})\n`;
            }
        }
        newSumary += `\n`;

        readme = String(readme).replace(oldSumary, newSumary);

        res(readme);
    });
}

async function getProjectConfigs(version) {
    return new Promise((res, rej) => {
        tools.configureProjectConfigs().then(config => {
            tagVersion = version;
            projectConfig = config;
            res(config);
        }).catch(rej);
    });
}


module.exports = {
    getNewReadme,
    getProjectConfigs
}
