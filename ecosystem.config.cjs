const path = require('path');

let GATEWAY_SITE_ADDRESS;
if (process.platform === 'darwin') {
  GATEWAY_SITE_ADDRESS = 'http://localhost:3500';
} else if (process.platform === 'linux') {
  GATEWAY_SITE_ADDRESS = 'https://demogateway.opendatacapture.org';
}

const API_PROD_SERVER_PORT = 5500;
const DEBUG = false;
const ESBUILD_BINARY_PATH = path.resolve(__dirname, './apps/api/dist/bin/esbuild');
const GATEWAY_API_KEY = 'f2094f97d4dbc64c4c21c92fe9f5e63fec2ecebbcb442378f518dc207b84c5b3';
const GATEWAY_DATABASE_URL = `file:${path.resolve(__dirname, './apps/gateway/data/gateway.db')}`;
const GATEWAY_ENABLED = true;
const GATEWAY_REFRESH_INTERVAL = 2000;
const GATEWAY_PROD_SERVER_PORT = 3500;
const MONGO_URI = 'mongodb://localhost:27017';
const NODE_ENV = 'production';
const SECRET_KEY = 'f0adb45137854feeaf8742cf0551809c8cea101f6d2b0cb1e4385d3cbb315880';
const VERBOSE = false;
const MONGO_REPLICA_SET = 'rs0';
const MONGO_RETRY_WRITES = true;
const MONGO_WRITE_CONCERN = 'majority';
const MONGO_DIRECT_CONNECTION = true;

module.exports = {
  apps: [
    {
      env: {
        API_PROD_SERVER_PORT,
        DEBUG,
        ESBUILD_BINARY_PATH,
        GATEWAY_API_KEY,
        GATEWAY_ENABLED,
        GATEWAY_REFRESH_INTERVAL,
        GATEWAY_SITE_ADDRESS,
        MONGO_DIRECT_CONNECTION,
        MONGO_REPLICA_SET,
        MONGO_RETRY_WRITES,
        MONGO_URI,
        MONGO_WRITE_CONCERN,
        NODE_ENV,
        SECRET_KEY,
        VERBOSE
      },
      name: 'core',
      script: path.resolve(__dirname, './api/app.mjs')
    },
    {
      env: {
        ESBUILD_BINARY_PATH,
        GATEWAY_API_KEY,
        GATEWAY_DATABASE_URL,
        GATEWAY_PROD_SERVER_PORT,
        NODE_ENV
      },
      name: 'gateway',
      script: path.resolve(__dirname, './gateway/main.mjs')
    }
  ]
};
