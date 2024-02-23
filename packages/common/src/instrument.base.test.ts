import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  $BaseInstrument,
  $BaseInstrumentDetails,
  $EnhancedBaseInstrumentDetails,
  $InstrumentUIOption,
  type BaseInstrument,
  type BaseInstrumentDetails,
  type EnhancedBaseInstrumentDetails
} from './instrument.base.js';

import type { Language } from './core.js';

const enhancedBilingualDetails: EnhancedBaseInstrumentDetails<Language[]> = Object.freeze({
  description: {
    en: 'Foo',
    fr: 'Foo'
  },
  estimatedDuration: 0,
  instructions: {
    en: ['Foo'],
    fr: ['Foo']
  },
  license: 'AGPL-3.0',
  title: {
    en: 'Foo',
    fr: 'Foo'
  }
});

const enhancedUnilingualDetails: EnhancedBaseInstrumentDetails<Language> = Object.freeze({
  description: 'Foo',
  estimatedDuration: 0,
  instructions: ['Foo'],
  license: 'AGPL-3.0',
  title: 'Foo'
});

export const bilingualDetails: BaseInstrumentDetails<Language[]> = _.pick(enhancedBilingualDetails, [
  'description',
  'license',
  'title'
]);

const unilingualDetails: BaseInstrumentDetails<Language> = _.pick(enhancedUnilingualDetails, [
  'description',
  'license',
  'title'
]);

const englishInstrument: BaseInstrument<null, 'en'> = {
  content: null,
  details: unilingualDetails,
  kind: 'UNKNOWN',
  language: 'en',
  name: 'Foo',
  tags: ['Foo'],
  validationSchema: z.any(),
  version: 1
};

const frenchInstrument: BaseInstrument<null, 'fr'> = {
  content: null,
  details: unilingualDetails,
  kind: 'UNKNOWN',
  language: 'fr',
  name: 'Foo',
  tags: ['Foo'],
  validationSchema: z.any(),
  version: 1
};

const bilingualInstrument: BaseInstrument<null, Language[]> = {
  content: null,
  details: bilingualDetails,
  kind: 'UNKNOWN',
  language: ['en', 'fr'],
  name: 'Foo',
  tags: {
    en: ['Foo'],
    fr: ['Foo']
  },
  validationSchema: z.any(),
  version: 1
};

describe('$InstrumentUIOption', () => {
  const num = -1;
  const obj = Object.freeze({ en: num, fr: num });

  it('should handle the language "en" successfully', () => {
    expect($InstrumentUIOption(z.number(), 'en').parse(num)).toBe(num);
    expect(() => $InstrumentUIOption(z.string(), 'en').parse(num)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), 'en').parse(obj)).toThrow();
  });

  it('should handle the language "fr" successfully', () => {
    expect($InstrumentUIOption(z.number(), 'fr').parse(num)).toBe(num);
    expect(() => $InstrumentUIOption(z.string(), 'fr').parse(num)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), 'fr').parse(obj)).toThrow();
  });

  it('should handle the language ["en", "fr"] successfully', () => {
    expect($InstrumentUIOption(z.number(), ['en', 'fr']).parse(obj)).toEqual(obj);
    expect(() => $InstrumentUIOption(z.string(), ['en', 'fr']).parse(obj)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), ['en', 'fr']).parse(num)).toThrow();
  });
  it('should handle the language ["en", "fr", "fr] successfully', () => {
    expect($InstrumentUIOption(z.number(), ['en', 'fr', 'fr']).parse(obj)).toEqual(obj);
    expect(() => $InstrumentUIOption(z.string(), ['en', 'fr', 'fr']).parse(obj)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), ['en', 'fr', 'fr']).parse(num)).toThrow();
  });
  it('should handle the language ["en"] successfully', () => {
    expect($InstrumentUIOption(z.number(), ['en']).parse(obj)).toEqual({ en: num });
    expect(() => $InstrumentUIOption(z.string(), ['en']).parse(obj)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), ['en']).parse(num)).toThrow();
  });
  it('should handle the language ["fr"] successfully', () => {
    expect($InstrumentUIOption(z.number(), ['fr']).parse(obj)).toEqual({ fr: num });
    expect(() => $InstrumentUIOption(z.string(), ['fr']).parse(obj)).toThrow();
    expect(() => $InstrumentUIOption(z.number(), ['fr']).parse(num)).toThrow();
  });
});

describe('$BaseInstrumentDetails', () => {
  it('should handle the language "en" successfully', () => {
    expect($BaseInstrumentDetails('en').parse(unilingualDetails)).toEqual(unilingualDetails);
    expect(() => $BaseInstrumentDetails('en').parse({ en: unilingualDetails })).toThrow();
  });
  it('should handle the language "fr" successfully', () => {
    expect($BaseInstrumentDetails('fr').parse(unilingualDetails)).toEqual(unilingualDetails);
    expect(() => $BaseInstrumentDetails('fr').parse({ fr: unilingualDetails })).toThrow();
  });
  it('should handle the language ["en", "fr"] successfully', () => {
    expect($BaseInstrumentDetails(['en', 'fr']).parse(bilingualDetails)).toEqual(bilingualDetails);
    expect(() => $BaseInstrumentDetails(['en', 'fr']).parse(unilingualDetails)).toThrow();
  });
});

describe('$EnhancedInstrumentDetails', () => {
  it('should handle the language "en" successfully', () => {
    expect($EnhancedBaseInstrumentDetails('en').parse(enhancedUnilingualDetails)).toEqual(enhancedUnilingualDetails);
    expect(() => $EnhancedBaseInstrumentDetails('en').parse({ en: enhancedUnilingualDetails })).toThrow();
  });
  it('should handle the language "fr" successfully', () => {
    expect($EnhancedBaseInstrumentDetails('fr').parse(enhancedUnilingualDetails)).toEqual(enhancedUnilingualDetails);
    expect(() => $EnhancedBaseInstrumentDetails('fr').parse({ fr: enhancedUnilingualDetails })).toThrow();
  });
  it('should handle the language ["en", "fr"] successfully', () => {
    expect($EnhancedBaseInstrumentDetails(['en', 'fr']).parse(enhancedBilingualDetails)).toEqual(
      enhancedBilingualDetails
    );
    expect(() => $EnhancedBaseInstrumentDetails(['en', 'fr']).parse(enhancedUnilingualDetails)).toThrow();
  });
});

describe('BaseInstrument', () => {
  it('should handle the language "en" successfully', () => {
    expect($BaseInstrument('en').parse(englishInstrument)).toEqual(englishInstrument);
    expect(() => $BaseInstrument('en').parse(frenchInstrument)).toThrow();
    expect(() => $BaseInstrument('en').parse(bilingualInstrument)).toThrow();
  });
  // it('should handle the language "fr" successfully', () => {
  //   expect($BaseInstrument('en').parse(englishInstrument)).toEqual(englishInstrument);
  //   expect(() => $BaseInstrument('en').parse(frenchInstrument)).toThrow();
  //   expect(() => $BaseInstrument('en').parse(bilingualInstrument)).toThrow();
  // });
  // it('should handle the language ["en", "fr"] successfully', () => {
  //   expect($EnhancedBaseInstrumentDetails(['en', 'fr']).parse(enhancedBilingualDetails)).toEqual(
  //     enhancedBilingualDetails
  //   );
  //   expect(() => $EnhancedBaseInstrumentDetails(['en', 'fr']).parse(enhancedUnilingualDetails)).toThrow();
  // });
});
