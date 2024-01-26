#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

const secretKey = await new Promise((resolve, reject) => {
  crypto.generateKey('hmac', { length: 256 }, (err, key) => {
    if (err) {
      return reject(err);
    }
    resolve(key.export().toString('hex'));
  });
});

let env = await fs.readFile(path.resolve(projectRoot, '.env.template'), 'utf-8');
env = env.replace('PROJECT_ROOT=', `PROJECT_ROOT=${projectRoot}`);
env = env.replace('SECRET_KEY=', `SECRET_KEY=${secretKey}`);

const filepath = path.resolve(projectRoot, '.env');
await fs.writeFile(filepath, env, 'utf-8').then(() => {
  console.log(`Done! Successfully generated file: ${filepath}`);
});
