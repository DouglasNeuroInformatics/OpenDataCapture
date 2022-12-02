# Installing Node

## Installing NVM

It is recommended to install Node using a version management system, such as Node Version Manager (nvm). Instructions for doing so are provided by the nvm project on [GitHub](https://github.com/nvm-sh/nvm).

Please install and activate the required version of Node for this project, as specified in `package.json`.

## Activate Yarn

We use Yarn as our package manager, which is included in recent versions of Node, but not activated by default. To activate Yarn, run the following command in the shell:

```
$ corepack enable
```