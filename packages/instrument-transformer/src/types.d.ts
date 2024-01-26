import type { Options as CoreOptions, Output as CoreOutput, ParseOptions as CoreParseOptions } from '@swc/core';
import type { Module } from '@swc/types';
import type { Options as WebOptions, Output as WebOutput, ParseOptions as WebParseOptions } from '@swc/wasm-web';
import type { Simplify } from 'type-fest';

/**
 * `InstrumentTransformer` is responsible for transpiling the source code (including potentially, JSX syntax)
 * to vanilla JavaScript that can run in the browser. Since dynamic import is a requirement of the runtime 
 * in general, ES2022 is targeted.
 */
export class InstrumentTransformer {
  transpiler: InstrumentTransformer.Transpiler;
  generateBundle(src: string): Promise<string>;
  generateBundleSync(src: string): string;
}

// This namespace is merged with the InstrumentTransformer class and allows for consumers, and this file
// to have types which are nested away in their own sections.
declare namespace InstrumentTransformer {
  export interface Transpiler {
    parse(src: string, options: ParseOptions): Promise<Module>;
    parseSync(src: string, options: ParseOptions): Module;
    transform(src: string, options: TransformOptions): Promise<TransformOutput>;
    transformSync(src: string, options: TransformOptions): TransformOutput;
  }
  export type TransformOptions = Simplify<CoreOptions & WebOptions>;

  export type TransformOutput = Simplify<CoreOutput & WebOutput>;

  export type ModuleItemType = Module['body'][number]['type'];

  export type ParseOptions = Simplify<Extract<CoreParseOptions & WebParseOptions, { syntax: 'typescript' }>>;
}

export as namespace InstrumentTransformer;
