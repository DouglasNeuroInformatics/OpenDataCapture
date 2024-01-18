import type { Options as CoreOptions, Output as CoreOutput, ParseOptions as CoreParseOptions } from '@swc/core';
import type { Module } from '@swc/types';
import type { Options as WebOptions, Output as WebOutput, ParseOptions as WebParseOptions } from '@swc/wasm-web';
import type { Simplify } from 'type-fest';

export type TransformOptions = Simplify<CoreOptions & WebOptions>;

export type TransformOutput = Simplify<CoreOutput & WebOutput>;

export type ModuleItemType = Module['body'][number]['type'];

export type ParseOptions = Simplify<Extract<CoreParseOptions & WebParseOptions, { syntax: 'ecmascript' }>>;

export type Transpiler = {
  parse(src: string, options: ParseOptions): Promise<Module>;
  parseSync(src: string, options: ParseOptions): Module;
  transform(src: string, options: TransformOptions): Promise<TransformOutput>;
  transformSync(src: string, options: TransformOptions): TransformOutput;
};
