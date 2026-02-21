/* eslint-disable no-console */

import { renderToString } from 'react-dom/server';

import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

import {
  bundle,
  BUNDLER_FILE_EXT_REGEX,
  inferLoader,
  InstrumentBundlerError
} from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { encodeUnicodeToBase64 } from '@opendatacapture/runtime-internal';
import { generateMetadata, resolveRuntimeAsset } from '@opendatacapture/runtime-meta';
import type { RuntimeMetadataMap } from '@opendatacapture/runtime-meta';
import chalk from 'chalk';

import { Root } from './root';

import type { RootProps } from './root';

declare const __TAILWIND_STYLES__: string;

class InstrumentLoader {
  private encodedBundle: null | string;

  constructor(private readonly target: string) {
    this.encodedBundle = null;
    fs.watch(target, { recursive: false }, () => {
      console.log(chalk.yellow('↺') + chalk.dim(' File changed, rebuilding instrument...'));
      void this.updateEncodedBundle();
    });
  }

  async getEncodedBundle(): Promise<null | string> {
    if (!this.encodedBundle) {
      await this.updateEncodedBundle();
    }
    return this.encodedBundle;
  }

  private async updateEncodedBundle(): Promise<void> {
    const inputs: BundlerInput[] = [];
    const filepaths = await fs.promises
      .readdir(this.target, 'utf-8')
      .then((filenames) => filenames.filter((filename) => BUNDLER_FILE_EXT_REGEX.test(filename)))
      .then((filenames) => filenames.map((filename) => path.resolve(this.target, filename)));

    for (const filepath of filepaths) {
      const loader = inferLoader(filepath);
      const content: string | Uint8Array = await fs.promises.readFile(filepath, loader === 'dataurl' ? null : 'utf-8');
      inputs.push({
        // https://github.com/microsoft/TypeScript/issues/62546
        content: content instanceof Uint8Array ? new Uint8Array(content) : content,
        name: path.basename(filepath)
      });
    }
    try {
      this.encodedBundle = encodeUnicodeToBase64(await bundle({ inputs }));
      console.log(chalk.green('✓') + chalk.dim(' Bundle ready'));
    } catch (err) {
      if (!(err instanceof InstrumentBundlerError)) {
        console.error(err);
      }
      console.error(chalk.red('✘ Failed to compile instrument'));
    }
  }
}

class RequestHandler {
  private instrumentLoader: InstrumentLoader;
  private runtimeMetadata: RuntimeMetadataMap;

  constructor(params: { instrumentLoader: InstrumentLoader; runtimeMetadata: RuntimeMetadataMap }) {
    this.instrumentLoader = params.instrumentLoader;
    this.runtimeMetadata = params.runtimeMetadata;
  }

  async handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
      return;
    }

    if (req.url === '/') {
      const encodedBundle = await this.instrumentLoader.getEncodedBundle();
      if (encodedBundle) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html>' + (await this.renderPage({ encodedBundle })));
      } else {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Bundle Loading or Error (See Console)');
      }
    } else if (req.url?.startsWith('/runtime')) {
      const asset = await resolveRuntimeAsset(req.url.replace(/^\/?runtime\//, ''), this.runtimeMetadata);
      if (!asset) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': asset.contentType });
        res.end(asset.content);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  private async renderPage(props: RootProps): Promise<string> {
    const clientBundle = await fs.promises
      .readFile(path.resolve(import.meta.dirname, 'client.js'), 'utf-8')
      .then((text) => `const __ROOT_PROPS__ = ${JSON.stringify(props)}; ${text}`);

    return renderToString(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
          <title>Open Data Capture</title>
          <style>{atob(__TAILWIND_STYLES__)}</style>
        </head>
        <body>
          <div id="root">
            <Root {...props} />
          </div>
        </body>
        <script dangerouslySetInnerHTML={{ __html: clientBundle }} type="module" />
      </html>
    );
  }
}

export class Server {
  private handler: RequestHandler;
  private port: number;
  private server: http.Server;

  private constructor(params: { handler: RequestHandler; port: number }) {
    this.handler = params.handler;
    this.port = params.port;
    this.server = http.createServer((...args) => void this.handler.handle(...args));
  }

  static async create({ port, target }: { port: number; target: string }) {
    return new this({
      handler: new RequestHandler({
        instrumentLoader: new InstrumentLoader(target),
        runtimeMetadata: await generateMetadata({ rootDir: import.meta.dirname })
      }),
      port
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(chalk.green('✓') + ' Listening on ' + chalk.cyan.underline(`http://localhost:${this.port}`));
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}
