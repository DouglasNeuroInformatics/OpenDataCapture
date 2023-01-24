Our monorepo is a repository that contains multiple packages or projects within it. We use Turborepo to manage the monorepo and Yarn as the package manager.

Turborepo is a tool that allows to build, test and publish multiple packages in a monorepo. It make easier to manage the monorepo, and it allows to automate the process of publishing packages, and also to keep the monorepo organized.

Yarn is a package manager that allows to manage the dependencies in the monorepo, it is faster, and more secure than other package manager like npm.

The monorepo contains three packages:
- The client package is for client-side code and assets
- The common package contains code that is shared across the client and server packages.
- The server package is for server-side code.

The entire codebase is written in Typescript, and each package has a tsconfig.json file that extends a base tsconfig.base.json file located in the root of the monorepo. This allows for sharing of TypeScript configurations across all packages in the monorepo.

Similarly, the .eslintrc.cjs files within each package extend a base .eslintrc.json file located in the root of the monorepo. This allows for sharing of Eslint configurations across all packages in the monorepo.
