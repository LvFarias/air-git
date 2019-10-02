const colors = require('../helpers/colors');

const helpTexts = {
  default: `${colors.Reset}Manage the Tags, README and CHANGELOG of your Project.

${colors.Bright}Initial Command:${colors.Reset}
  air-git init
    Create CHANGELOG.md, README.md, and readmeConfig.json files for project from the specified directory.

${colors.Bright}Usage:${colors.Reset} air-git <command> [arguments]

${colors.Bright}Global Options:${colors.Reset}
  -h or --help      Returns this information, or information from a specified command.
  -v or --version   Returns a current version of this package.

${colors.Bright}Available commands:${colors.Reset}
  init              Creates the CHANGELOG, README, and readmeConfig files for project from the specified directory.
  commit            Change badges in README before commit and run the "commit" afterwards.
  p or publish         Change package information.json, CHANGELOG.md, README.md, merge and push to Stage and add TAG in git.

Run "air-git --help <command>" or "air-git -h <command>" for more information about a command.
`,
  init: `Exits for this version of Air Git.
${colors.Bright}Use:${colors.Reset} air-git init
`,
  update: `Exits for this version of Air Git.
${colors.Bright}Use:${colors.Reset} air-git update
`,
  commit: `Exits for this version of Air Git.
${colors.Bright}Use:${colors.Reset} air-git commit [options]

${colors.Bright}Options:${colors.Reset}
  -m or --message
    Message to the git command.
  -p or --push
    If called, run to the git push too.
  -h or --help
    View a help message for this command in the console.
`,
  publish: `Exits to this version of Air Git.
${colors.Bright}Use:${colors.Reset} air-git publish [options]

${colors.Bright}Options:${colors.Reset}
  -m or --message
    Message to the git command.
  -b or --branch
    Current branch name for Stage merge.
  -v or --version
    New version number to generate TAG, README.md and CHANGELOG.md.
  --tm or --to-master
    If called, publish to Master branch instead of Stage branch.
  -c or --change-log
    If called, opens the dialog box to put "Release Notes" in CHANGELOG.md.
  -h or --help
    Displays a help message for this command in the console.
`,
};

module.exports = helpTexts;