# Air Git

[![](https://img.shields.io/badge/Version-0.4.2-007fb1)](https://github.com/LvFarias/air-git/releases/tag/0.4.2) ![](https://img.shields.io/badge/Framework-Node%20JS-yellow) ![](https://img.shields.io/badge/Dependencies-1-important) ![](https://img.shields.io/badge/Platforms-Linux%20|%20MacOS-informational) ![](https://img.shields.io/badge/Size-324K-critical) ![](https://img.shields.io/badge/Last%20Commit-28%20/%209%20/%202020-success) [![](https://img.shields.io/badge/Group-LvFarias-007fb1)](https://github.com/LvFarias)

## Sumary

- [Description](#description)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Commands](#commands)
    - [Init](#init)
    - [Update](#update)
    - [Commit](#commit)
    - [Publish](#publish)
- [Authors](#authors)

## Description

Helper to manage Tags, README.md, CHANGELOG.md and Package.json of your Project.

## Prerequisites

- NodeJS `npm i -g npm`

## Getting Started

```
sudo npm i -g air-git
```
try run:
```
air-git --help
```

## Commands
#### Init

Creates the CHANGELOG, README, and readmeConfig files for project from the specified directory.
```
air-git init
```
For more information about this command, call "air-git --help init"

#### Update

If your version was 0.4.0 or older this command updates readmeConfig.json to the new options.
```
air-git update
```
For more information about this command, call "air-git --help update"

#### Commit

Change badges in README before commit and run the "commit" afterwards.
```
air-git commit -m "commit message"
```
For more information about this command, call "air-git --help commit"

#### Publish

Change package information.json, CHANGELOG.md, README.md, merge and push to Stage and add TAG in git.
```
air-git publish -m "commit message" -b "feature-x" -v 20.7.95
```
For more information about this command, call "air-git --help publish"

## Authors

- Luan Vasco de Farias <luan.vfarias@gmail.com> (https://github.com/LvFarias/)
