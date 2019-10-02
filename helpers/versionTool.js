const tools = require('./tools');
const colors = require('./colors');

async function checkNewVersion() {
    let latestVersion = await tools.execute('npm view air-git version').catch();
    if (latestVersion) {
        latestVersion = latestVersion.replace('\n', '').replace(' ', '');
        if (latestVersion !== process.env.npm_package_version) {
            console.log(getText(process.env.npm_package_version, latestVersion));
        }
    }
    return;
}

function getText(currentVersion, latestVersion) {
    return `${colors.Bright}${colors.fg.Yellow}
    ╭────────────────────────────────────────────────────────────────╮
    │                                                                │
    │        ${colors.Reset}New version of ${colors.Bright}air-git${colors.Reset} available! ${colors.fg.Red}${colors.Bright}${currentVersion}${colors.Reset} -> ${colors.fg.Green}${colors.Bright}${latestVersion}${colors.Bright}${colors.fg.Yellow}        │
    │                                                                │
    │           ${colors.Reset}Run ${colors.fg.Cyan}${colors.Bright}sudo npm install -g air-git${colors.Reset} to update!${colors.Bright}${colors.fg.Yellow}           │
    │                                                                │
    ╰────────────────────────────────────────────────────────────────╯
`;
}

module.exports = { checkNewVersion }