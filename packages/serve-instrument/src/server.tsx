/* eslint-disable no-console */

import { renderToString } from 'react-dom/server';

import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

import { formatError } from '@douglasneuroinformatics/libjs';
import { bundle, BUNDLER_FILE_EXT_REGEX, inferLoader } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { encodeUnicodeToBase64 } from '@opendatacapture/runtime-internal';
import { generateMetadata, resolveRuntimeAsset } from '@opendatacapture/runtime-meta';
import type { RuntimeMetadataMap } from '@opendatacapture/runtime-meta';
import chalk from 'chalk';

import { Root } from './root';

import type { RootProps } from './root';

declare const __TAILWIND_STYLES__: string;

function timestamp(): string {
  return chalk.dim(new Date().toLocaleTimeString('en', { hour12: false }));
}

function log(message: string): void {
  console.log(`${timestamp()} ${message}`);
}

function logError(message: string): void {
  console.error(`${timestamp()} ${message}`);
}

class InstrumentLoader {
  private encodedBundle: null | string;

  constructor(
    private readonly target: string,
    private readonly verbose: boolean
  ) {
    this.encodedBundle = null;
    fs.watch(target, { recursive: false }, () => {
      log(chalk.yellow('↺') + chalk.dim(' File changed, rebuilding...'));
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
    const start = Date.now();
    try {
      this.encodedBundle = encodeUnicodeToBase64(await bundle({ inputs }));
      const elapsed = Date.now() - start;
      const timing = this.verbose ? chalk.dim(` (${elapsed}ms)`) : '';
      log(chalk.green('✓') + chalk.dim(' Bundle ready') + timing);
    } catch (err) {
      const formattedError = err instanceof Error ? formatError(err) : err;
      logError(chalk.red('✘') + chalk.bold.red(' Failed to compile instrument'));
      logError(chalk.dim(String(formattedError)));
    }
  }
}

class RequestHandler {
  private instrumentLoader: InstrumentLoader;
  private runtimeMetadata: RuntimeMetadataMap;
  private verbose: boolean;

  constructor(params: { instrumentLoader: InstrumentLoader; runtimeMetadata: RuntimeMetadataMap; verbose: boolean }) {
    this.instrumentLoader = params.instrumentLoader;
    this.runtimeMetadata = params.runtimeMetadata;
    this.verbose = params.verbose;
  }

  async handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    } else if (req.url === '/') {
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

  static async create({ port, target, verbose }: { port: number; target: string; verbose: boolean }) {
    return new this({
      handler: new RequestHandler({
        instrumentLoader: new InstrumentLoader(target, verbose),
        runtimeMetadata: await generateMetadata({ rootDir: import.meta.dirname }),
        verbose
      }),
      port
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        log(
          chalk.green('✓') +
            chalk.bold(' Ready') +
            '  ' +
            chalk.dim('➜') +
            '  ' +
            chalk.cyan.underline(`http://localhost:${this.port}`)
        );
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
