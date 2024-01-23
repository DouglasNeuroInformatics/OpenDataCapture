import type { Options as CoreOptions, Output as CoreOutput, ParseOptions as CoreParseOptions } from '@swc/core';
import type { Module } from '@swc/types';
import type { Options as WebOptions, Output as WebOutput, ParseOptions as WebParseOptions } from '@swc/wasm-web';
import type { Simplify } from 'type-fest';

declare type TransformOptions = Simplify<CoreOptions & WebOptions>;

declare type TransformOutput = Simplify<CoreOutput & WebOutput>;

declare type ModuleItemType = Module['body'][number]['type'];

declare type ParseOptions = Simplify<Extract<CoreParseOptions & WebParseOptions, { syntax: 'typescript' }>>;

declare type Transpiler = {
  parse(src: string, options: ParseOptions): Promise<Module>;
  parseSync(src: string, options: ParseOptions): Module;
  transform(src: string, options: TransformOptions): Promise<TransformOutput>;
  transformSync(src: string, options: TransformOptions): TransformOutput;
};

export declare class InstrumentTransformer {
  
}