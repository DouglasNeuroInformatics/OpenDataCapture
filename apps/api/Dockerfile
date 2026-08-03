FROM node:lts-krypton AS base
WORKDIR /app
ARG RELEASE_VERSION
ENV GATEWAY_DATABASE_URL="file:/dev/null"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN corepack enable
RUN pnpm install -g turbo@2.9.16

# PRUNE WORKSPACE
# Note: Here we cannot use --docker, as is recommended, since the generated
# json directory does not allow linking package.json executable files
FROM base AS pruner
COPY . .
RUN turbo prune @opendatacapture/api

# INSTALL DEPENDENCIES AND BUILD
FROM base AS installer
COPY tsconfig.base.json vitest.config.ts ./
COPY --from=pruner /app/out/ .
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=@opendatacapture/api

# esbuild's JS API gets bundled into dist/app.js, from where it can no longer locate the native
# binary it shells out to. Stage the binary belonging to the exact esbuild that was bundled: the
# store holds several versions, and a mismatched JS/binary pair refuses to start.
RUN node -e "\
const fs = require('node:fs'); \
const path = require('node:path'); \
const entry = require.resolve('esbuild', { paths: ['/app/packages/instrument-bundler'] }); \
const scopeDir = path.join(path.dirname(entry), '../../@esbuild'); \
const [platform] = fs.readdirSync(scopeDir); \
fs.copyFileSync(path.join(scopeDir, platform, 'bin/esbuild'), '/esbuild-native'); \
fs.chmodSync('/esbuild-native', 0o755);"

# RUN SERVER
FROM base AS runner
COPY --from=installer /app/apps/api/dist/ /app/dist/
COPY --from=installer /app/apps/api/public/ /app/public/
COPY --from=installer /app/apps/api/dist/runtime/ /runtime/

RUN echo '{ "type": "module", "imports": { "#runtime/v1/*": "./dist/runtime/v1/*" } }' > package.json
RUN echo '{ "type": "module" }' > /runtime/package.json

# Setting this both points the bundled esbuild at its binary and suppresses its refusal to run
# from a bundle. Without it every instrument repo import fails to compile.
COPY --from=installer /esbuild-native /usr/local/bin/esbuild
ENV ESBUILD_BINARY_PATH="/usr/local/bin/esbuild"

USER node
CMD [ "node", "--enable-source-maps", "./dist/app.js" ]
