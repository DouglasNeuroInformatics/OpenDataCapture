import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import type { Group } from '@opendatacapture/schemas/group';
import { unparse } from 'papaparse';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

import {
  createUploadTemplateCSV,
  processInstrumentCSV,
  reformatInstrumentData,
  UploadError,
  Zod3,
  Zod4
} from '../upload';

const baseInstrument: AnyUnilingualFormInstrument = {
  ...unilingualFormInstrument.instance,
  content: {},
  measures: null
};

/** Accepts schemas the instrument type forbids, since rejecting those at runtime is part of the contract. */
function instrumentWith(validationSchema: z3.ZodTypeAny | z4.ZodType): AnyUnilingualFormInstrument {
  return Object.assign({ ...baseInstrument }, { validationSchema });
}

function csvFile(rows: string[][]) {
  return new File([unparse(rows)], 'data.csv', { type: 'text/csv' });
}

function uploadErrorOf(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    if (error instanceof UploadError) {
      return error.description;
    }
    throw error;
  }
  throw new Error('Expected an UploadError to be thrown');
}

function expectRejection(promise: Promise<unknown>, en: string) {
  return expect(promise).rejects.toMatchObject({ description: { en } });
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleError.mockRestore();
});

describe('Zod3', () => {
  describe('getZodTypeName', () => {
    it('should parse basic string type', () => {
      const result = Zod3.getZodTypeName(z3.string());
      expect(result).toMatchObject({
        isOptional: false,
        typeName: 'ZodString'
      });
    });

    it('should parse optional string type', () => {
      const result = Zod3.getZodTypeName(z3.string().optional());
      expect(result).toMatchObject({
        isOptional: true,
        typeName: 'ZodString'
      });
    });

    it('should parse enum type', () => {
      const result = Zod3.getZodTypeName(z3.enum(['foo', 'bar', 'baz']));
      expect(result).toMatchObject({
        enumValues: ['foo', 'bar', 'baz'],
        isOptional: false,
        typeName: 'ZodEnum'
      });
    });

    it('should parse array of objects', () => {
      const result = Zod3.getZodTypeName(z3.array(z3.object({ age: z3.number(), name: z3.string() })));
      expect(result).toMatchObject({
        isOptional: false,
        multiKeys: ['age', 'name'],
        multiValues: [{ typeName: 'ZodNumber' }, { typeName: 'ZodString' }],
        typeName: 'ZodArray'
      });
    });

    it('should carry optionality into an array of objects', () => {
      expect(Zod3.getZodTypeName(z3.array(z3.object({ name: z3.string() })).optional())).toMatchObject({
        isOptional: true,
        multiKeys: ['name'],
        typeName: 'ZodArray'
      });
    });

    it('should parse set type', () => {
      const result = Zod3.getZodTypeName(z3.set(z3.enum(['a', 'b', 'c'])));
      expect(result).toMatchObject({
        enumValues: ['a', 'b', 'c'],
        isOptional: false,
        typeName: 'ZodSet'
      });
    });

    it('should parse a set of free-form values without enum values', () => {
      expect(Zod3.getZodTypeName(z3.set(z3.string()))).toStrictEqual({ isOptional: false, typeName: 'ZodSet' });
    });

    it('should parse an array of primitives without record keys', () => {
      expect(Zod3.getZodTypeName(z3.array(z3.string()))).toStrictEqual({ isOptional: false, typeName: 'ZodArray' });
    });

    it('should reject a schema type that cannot be represented in a CSV', () => {
      expect(uploadErrorOf(() => Zod3.getZodTypeName(z3.literal('a')))).toMatchObject({ en: 'Unexpected Error' });
    });

    it('should reject a set whose value type cannot be represented in a CSV', () => {
      expect(uploadErrorOf(() => Zod3.getZodTypeName(z3.set(z3.literal('a'))))).toMatchObject({
        en: 'Invalid inner type: ZodSet value type must have a valid type definition'
      });
    });

    it('should reject an array of objects with a field that cannot be represented in a CSV', () => {
      expect(uploadErrorOf(() => Zod3.getZodTypeName(z3.array(z3.object({ a: z3.literal('x') }))))).toMatchObject({
        en: 'Unhandled case!'
      });
    });

    it('should reject an array of objects without any fields', () => {
      expect(uploadErrorOf(() => Zod3.getZodTypeName(z3.array(z3.object({}))))).toMatchObject({
        en: 'Failure to interpret Zod Object or Array'
      });
    });
  });

  describe('generateSampleData', () => {
    it.each([
      ['ZodBoolean', 'true/false'],
      ['ZodDate', 'yyyy-mm-dd'],
      ['ZodNumber', 'number'],
      ['ZodString', 'string']
    ] as const)('should describe a %s column as %s', (typeName, sample) => {
      expect(Zod3.generateSampleData({ isOptional: false, typeName })).toBe(sample);
    });

    it('should mark an optional column as optional', () => {
      expect(Zod3.generateSampleData({ isOptional: true, typeName: 'ZodNumber' })).toBe('number (optional)');
    });

    it('should list the allowed values of a set of enum values', () => {
      expect(Zod3.generateSampleData({ enumValues: ['a', 'b'], isOptional: false, typeName: 'ZodSet' })).toBe(
        'SET(a/b, ...)'
      );
    });

    it('should show a generic example for a set of free-form values', () => {
      expect(Zod3.generateSampleData({ isOptional: true, typeName: 'ZodSet' })).toBe('SET(a,b,c) (optional)');
    });

    it('should wrap a failure to format set values in an upload error', () => {
      const enumValues = Object.assign(['a'], {
        join(): never {
          throw new Error('join failed');
        }
      });
      expect(
        uploadErrorOf(() => Zod3.generateSampleData({ enumValues, isOptional: false, typeName: 'ZodSet' }))
      ).toEqual({
        en: 'Failed to generate sample data for ZodSet',
        fr: "Échec de la génération de données d'exemple pour ZodSet"
      });
    });

    it('should list the allowed values of an enum', () => {
      expect(Zod3.generateSampleData({ enumValues: ['yes', 'no'], isOptional: false, typeName: 'ZodEnum' })).toBe(
        'yes/no'
      );
    });

    it('should reject an enum without values', () => {
      expect(uploadErrorOf(() => Zod3.generateSampleData({ isOptional: false, typeName: 'ZodEnum' }))).toMatchObject({
        en: 'Invalid Enum error'
      });
    });

    it('should describe every field of a record array, separated by commas', () => {
      const result = Zod3.getZodTypeName(z3.array(z3.object({ age: z3.number(), name: z3.string().optional() })));
      expect(Zod3.generateSampleData(result)).toBe('RECORD_ARRAY( age:number,name:string (optional);)');
    });

    it('should name the cause when a record array has no fields', () => {
      expect(uploadErrorOf(() => Zod3.generateSampleData({ isOptional: false, typeName: 'ZodObject' }))).toEqual({
        en: 'Invalid Record Array Error: Record Array is empty or does not exist',
        fr: "Erreur de tableau d'enregistrements invalide : Erreur record array invalide"
      });
    });

    it('should report an unexpected failure in a record array without a cause', () => {
      const multiValues = new Array<Zod3.ZodTypeNameResult>(1);
      expect(
        uploadErrorOf(() =>
          Zod3.generateSampleData({ isOptional: false, multiKeys: ['a'], multiValues, typeName: 'ZodArray' })
        )
      ).toEqual({
        en: 'Invalid Record Array Error',
        fr: "Erreur de tableau d'enregistrements invalide"
      });
    });

    it('should currently reject a refined field, since getZodTypeName does not unwrap ZodEffects', () => {
      const result = Zod3.getZodTypeName(z3.string().refine(Boolean));
      expect(uploadErrorOf(() => Zod3.generateSampleData(result))).toMatchObject({
        en: "Invalid zod schema: unexpected type name 'ZodEffects'"
      });
    });
  });

  describe('createUploadTemplateCSV', () => {
    const expectedContent = unparse([
      ['subjectID', 'date', 'favoriteNumber', 'reasonFavoriteNumberIsNegative'],
      ['string', 'yyyy-mm-dd', 'number', 'string (optional)']
    ]);

    it('should list the internal columns, then every field with sample data', () => {
      expect(createUploadTemplateCSV(baseInstrument)).toStrictEqual({
        content: expectedContent,
        filename: 'UNILINGUAL_FORM_1_template.csv'
      });
    });

    it('should read the fields of a refined object schema', () => {
      const schema = z3
        .object({ favoriteNumber: z3.number(), reasonFavoriteNumberIsNegative: z3.string().optional() })
        .refine(Boolean);
      expect(createUploadTemplateCSV(instrumentWith(schema)).content).toBe(expectedContent);
    });

    it('should reject a schema that is not an object', () => {
      expect(uploadErrorOf(() => createUploadTemplateCSV(instrumentWith(z3.string())))).toMatchObject({
        en: 'Validation schema for this instrument is invalid'
      });
    });

    it('should reject a refined schema that is not an object', () => {
      expect(uploadErrorOf(() => createUploadTemplateCSV(instrumentWith(z3.string().refine(Boolean))))).toMatchObject({
        en: 'Validation schema for this instrument is invalid'
      });
    });
  });

  describe('processInstrumentCSV', () => {
    const mockInstrument = instrumentWith(
      z3.object({
        notes: z3.string(),
        score: z3.number()
      })
    );

    it('should process valid CSV data', async () => {
      const csvContent = unparse([
        ['subjectID', 'date', 'score', 'notes'],
        ['subject1', '2024-01-01', '85', 'Good performance']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod3.processInstrumentCSV(file, mockInstrument);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        notes: 'Good performance',
        score: 85,
        subjectID: 'subject1'
      });
    });

    it('should reject empty CSV', async () => {
      const file = new File([''], 'data.csv', { type: 'text/csv' });

      await expectRejection(Zod3.processInstrumentCSV(file, mockInstrument), 'CSV does not contain any rows of data');
    });

    it('should handle optional fields', async () => {
      const instrumentWithOptional = instrumentWith(
        z3.object({
          optional: z3.string().optional(),
          required: z3.string()
        })
      );

      const csvContent = unparse([
        ['subjectID', 'date', 'required', 'optional'],
        ['subject1', '2024-01-01', 'value', '']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod3.processInstrumentCSV(file, instrumentWithOptional);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        optional: undefined,
        required: 'value'
      });
    });

    it('should process set values', async () => {
      const instrumentWithSet = instrumentWith(
        z3.object({
          tags: z3.set(z3.enum(['tag1', 'tag2', 'tag3']))
        })
      );

      const csvContent = unparse([
        ['subjectID', 'date', 'tags'],
        ['subject1', '2024-01-01', 'SET(tag1,tag2)']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod3.processInstrumentCSV(file, instrumentWithSet);

      expect(result).toHaveLength(1);
      expect(result[0]?.tags).toBeInstanceOf(Set);
      expect(result[0]?.tags).toEqual(new Set(['tag1', 'tag2']));
    });

    it('should convert every supported column type', async () => {
      const instrument = instrumentWith(
        z3.object({
          choice: z3.enum(['a', 'b']),
          done: z3.boolean(),
          when: z3.date()
        })
      );
      const file = csvFile([
        ['subjectID', 'date', 'choice', 'done', 'when'],
        ['subject1', '2024-01-01', 'b', 'FALSE', '2024-06-15']
      ]);
      await expect(processInstrumentCSV(file, instrument)).resolves.toStrictEqual([
        {
          choice: 'b',
          date: new Date('2024-01-01'),
          done: false,
          subjectID: 'subject1',
          when: new Date('2024-06-15')
        }
      ]);
    });

    it('should read the fields of a refined object schema', async () => {
      const instrument = instrumentWith(z3.object({ score: z3.number() }).refine(Boolean));
      const file = csvFile([
        ['subjectID', 'date', 'score'],
        ['subject1', '2024-01-01', '7']
      ]);
      await expect(processInstrumentCSV(file, instrument)).resolves.toMatchObject([{ score: 7 }]);
    });

    it('should reject a refined schema that is not an object', async () => {
      const file = csvFile([['subjectID'], ['subject1']]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z3.string().refine(Boolean))),
        'Invalid instrument schema'
      );
    });

    it('should reject a CSV with headers but no rows of data', async () => {
      const file = csvFile([['subjectID', 'date', 'score', 'notes']]);
      await expectRejection(processInstrumentCSV(file, mockInstrument), 'CSV does not contain any rows of data');
    });

    it('should name the invisible character hidden in the first subject ID', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['\u200bsubject1', '2024-01-01', '85', 'Good']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Subject ID at row 1 contains non-visible character(s) (U+200B)'
      );
    });

    it('should name the invisible character hidden in the first date', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['subject1', '2024-01-01\u200b', '85', 'Good']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Date at row 1 contains non-visible character(s) (U+200B)'
      );
    });

    it('should name the row and column of an invisible character in any other value', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['subject1', '2024-01-01', '85', 'Good'],
        ['subject2', '2024-01-01', '85', 'Go\u200bod']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        "Value at row 2 and column 'notes' contains non-visible character(s) (U+200B)"
      );
    });

    it('should skip the sample data row copied from the template', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['string', 'yyyy-mm-dd', 'number', 'string'],
        ['subject1', '2024-01-01', '85', 'Good']
      ]);
      await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject([{ subjectID: 'subject1' }]);
    });

    it('should reject a row without a subject ID', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['', '2024-01-01', '85', 'Good']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Schema parsing failed: refer to the browser console for further details'
      );
    });

    it('should reject a column that is not in the template', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes', 'extra'],
        ['subject1', '2024-01-01', '85', 'Good', 'x']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Schema value at column 4 is not defined! Please check if Column has been edited/deleted from original template'
      );
    });

    it('should locate a value that cannot be converted by column and row', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'notes'],
        ['subject1', '2024-01-01', 'abc', 'Good']
      ]);
      await expect(processInstrumentCSV(file, mockInstrument)).rejects.toMatchObject({
        description: {
          en: "Invalid number type: 'abc' at column name: 'score' and row number '1'",
          fr: "Type de nombre invalide : 'abc' au nom de colonne : 'score' et numéro de ligne '1'"
        }
      });
    });

    it.each([
      ['done', 'maybe', z3.boolean(), "Undecipherable Boolean Type: 'maybe'"],
      ['when', 'someday', z3.date(), "Failed to parse date: 'someday'"],
      ['tags', 'SET()', z3.set(z3.string()), "Failed to extract set value from entry: 'SET()'"],
      ['tags', 'SET( , )', z3.set(z3.string()), 'Empty set is not allowed'],
      ['items', 'RECORD_ARRAY(a)', z3.array(z3.string()), 'Record Array keys or values do not exist']
    ])(
      'should reject %s value %j as unconvertible, naming the column and row',
      async (column, value, schema, message) => {
        const file = csvFile([
          ['subjectID', 'date', column],
          ['subject1', '2024-01-01', value]
        ]);
        await expectRejection(
          processInstrumentCSV(file, instrumentWith(z3.object({ [column]: schema }))),
          `${message} at column name: '${column}' and row number '1'`
        );
      }
    );

    it('should currently reject a refined number column, since getZodTypeName does not unwrap ZodEffects', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score'],
        ['subject1', '2024-01-01', '1']
      ]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z3.object({ score: z3.number().refine(Boolean) }))),
        "Unexpected Zod type name 'ZodEffects' at column name: 'score' and row number '1'"
      );
    });

    it('should fall back to a generic error when an unsupported field schema cannot be serialized for logging', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'big'],
        ['subject1', '2024-01-01', '1']
      ]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z3.object({ big: z3.literal(1n) }))),
        'Error parsing CSV'
      );
    });

    it('should reject a row the instrument schema does not accept', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'choice'],
        ['subject1', '2024-01-01', 'c']
      ]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z3.object({ choice: z3.enum(['a', 'b']) }))),
        'Schema parsing failed: refer to the browser console for further details'
      );
    });

    describe('record arrays', () => {
      const instrument = instrumentWith(
        z3.object({ items: z3.array(z3.object({ name: z3.string(), quantity: z3.number().optional() })) })
      );

      const processItems = (value: string) =>
        processInstrumentCSV(
          csvFile([
            ['subjectID', 'date', 'items'],
            ['subject1', '2024-01-01', value]
          ]),
          instrument
        );

      it('should convert each record with the type of its field', async () => {
        await expect(processItems('RECORD_ARRAY(name:item1,quantity:5;name:item2,quantity:3;)')).resolves.toMatchObject(
          [
            {
              items: [
                { name: 'item1', quantity: 5 },
                { name: 'item2', quantity: 3 }
              ]
            }
          ]
        );
      });

      it('should leave out a field the record does not mention', async () => {
        await expect(processItems('RECORD_ARRAY(name:item1)')).resolves.toMatchObject([{ items: [{ name: 'item1' }] }]);
      });
    });
  });
});

describe('Zod4', () => {
  describe('generateSampleData', () => {
    it('should generate sample data for string type', () => {
      const result = Zod4.generateSampleData({
        isOptional: false,
        typeName: 'string'
      });
      expect(result).toBe('string');
    });

    it('should generate sample data for optional number type', () => {
      const result = Zod4.generateSampleData({
        isOptional: true,
        typeName: 'number'
      });
      expect(result).toBe('number (optional)');
    });

    it('should generate sample data for enum type', () => {
      const result = Zod4.generateSampleData({
        enumValues: ['option1', 'option2', 'option3'],
        isOptional: false,
        typeName: 'enum'
      });
      expect(result).toBe('option1/option2/option3');
    });

    it('should generate sample data for boolean type', () => {
      const result = Zod4.generateSampleData({
        isOptional: false,
        typeName: 'boolean'
      });
      expect(result).toBe('true/false');
    });

    it('should generate sample data for date type', () => {
      const result = Zod4.generateSampleData({
        isOptional: false,
        typeName: 'date'
      });
      expect(result).toBe('yyyy-mm-dd');
    });

    it('should wrap the sample of the inner type of a set', () => {
      expect(
        Zod4.generateSampleData({
          innerType: { enumValues: ['a', 'b'], isOptional: false, typeName: 'enum' },
          isOptional: true,
          typeName: 'set'
        })
      ).toBe('SET(a/b) (optional)');
    });

    it('should describe every field of a record array, separated by commas', () => {
      expect(
        Zod4.generateSampleData({
          innerType: {
            dimensions: {
              name: { isOptional: false, typeName: 'string' },
              quantity: { isOptional: true, typeName: 'number' }
            },
            isOptional: false,
            typeName: 'object'
          },
          isOptional: false,
          typeName: 'array'
        })
      ).toBe('RECORD_ARRAY(name: string,quantity: number (optional); ...)');
    });

    it('should reject a type name it has no sample for', () => {
      expect(uploadErrorOf(() => Zod4.generateSampleData({ isOptional: false, typeName: 'optional' }))).toEqual({
        en: "Unexpected Zod type name 'optional'",
        fr: "Nom de type Zod inattendu 'optional'"
      });
    });
  });

  describe('createUploadTemplateCSV', () => {
    it('should describe an integer column as a number, since zod 4 integers are number schemas', () => {
      const { content } = createUploadTemplateCSV(instrumentWith(z4.object({ age: z4.int() })));
      expect(content).toBe(
        unparse([
          ['subjectID', 'date', 'age'],
          ['string', 'yyyy-mm-dd', 'number']
        ])
      );
    });

    it('should list the internal columns, then every field with sample data', () => {
      const schema = z4.object({
        count: z4.number().optional(),
        done: z4.boolean(),
        items: z4.array(z4.object({ name: z4.string() })),
        level: z4.enum(['low', 'high']),
        tags: z4.set(z4.string()),
        when: z4.date()
      });
      expect(createUploadTemplateCSV(instrumentWith(schema))).toStrictEqual({
        content: unparse([
          ['subjectID', 'date', 'count', 'done', 'items', 'level', 'tags', 'when'],
          [
            'string',
            'yyyy-mm-dd',
            'number (optional)',
            'true/false',
            'RECORD_ARRAY(name: string; ...)',
            'low/high',
            'SET(string)',
            'yyyy-mm-dd'
          ]
        ]),
        filename: 'UNILINGUAL_FORM_1_template.csv'
      });
    });

    it('should reject a schema that is not an object', () => {
      expect(uploadErrorOf(() => createUploadTemplateCSV(instrumentWith(z4.string())))).toMatchObject({
        en: 'Expected schema to be instance of ZodObject'
      });
    });

    it('should reject a field type that cannot be represented in a CSV', () => {
      expect(
        uploadErrorOf(() => createUploadTemplateCSV(instrumentWith(z4.object({ kind: z4.literal('a') }))))
      ).toMatchObject({ en: "Unexpected Zod type name 'literal'" });
    });
  });

  describe('processInstrumentCSV', () => {
    const mockInstrument = instrumentWith(
      z4.object({
        feedback: z4.string(),
        score: z4.number()
      })
    );

    it('should process valid CSV data', async () => {
      const csvContent = unparse([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1', '2024-01-15', '92', 'Excellent work']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod4.processInstrumentCSV(file, mockInstrument);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        feedback: 'Excellent work',
        score: 92,
        subjectID: 'subject1'
      });
    });

    it('should locate a number that cannot be converted by column and row', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1', '2024-01-15', 'invalid_number', 'text']
      ]);
      await expectRejection(
        Zod4.processInstrumentCSV(file, mockInstrument),
        "Invalid number type: 'invalid_number' at column name: 'score' and row number '1'"
      );
    });

    it('should parse a date column into the date it names', async () => {
      const instrumentWithDate = instrumentWith(
        z4.object({
          eventDate: z4.date()
        })
      );

      const csvContent = unparse([
        ['subjectID', 'date', 'eventDate'],
        ['subject1', '2024-01-01', '2024-06-15']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod4.processInstrumentCSV(file, instrumentWithDate);

      expect(result).toHaveLength(1);
      expect(result[0]?.eventDate).toStrictEqual(new Date('2024-06-15'));
    });

    it('should process enum values', async () => {
      const instrumentWithEnum = instrumentWith(
        z4.object({
          status: z4.enum(['pending', 'active', 'completed'])
        })
      );

      const csvContent = unparse([
        ['subjectID', 'date', 'status'],
        ['subject1', '2024-01-01', 'active']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod4.processInstrumentCSV(file, instrumentWithEnum);

      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe('active');
    });

    it('should process array of objects', async () => {
      const instrumentWithArray = instrumentWith(
        z4.object({
          items: z4.array(
            z4.object({
              name: z4.string(),
              quantity: z4.number()
            })
          )
        })
      );

      const csvContent = unparse([
        ['subjectID', 'date', 'items'],
        ['subject1', '2024-01-01', 'RECORD_ARRAY(name:item1,quantity:5;name:item2,quantity:3;)']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod4.processInstrumentCSV(file, instrumentWithArray);

      expect(result).toHaveLength(1);
      expect(result[0]?.items).toHaveLength(2);
      expect(result[0]?.items).toEqual([
        { name: 'item1', quantity: 5 },
        { name: 'item2', quantity: 3 }
      ]);
    });

    it('should convert booleans, sets and optional values', async () => {
      const instrument = instrumentWith(
        z4.object({ done: z4.boolean(), note: z4.string().optional(), tags: z4.set(z4.string()) })
      );
      const file = csvFile([
        ['subjectID', 'date', 'done', 'note', 'tags'],
        ['subject1', '2024-01-01', 'True', '', 'SET(a, b)']
      ]);
      await expect(processInstrumentCSV(file, instrument)).resolves.toStrictEqual([
        { date: new Date('2024-01-01'), done: true, note: undefined, subjectID: 'subject1', tags: new Set(['a', 'b']) }
      ]);
    });

    it('should read a missing trailing cell as blank, so a short row is not an error', async () => {
      const instrument = instrumentWith(z4.object({ note: z4.string().optional() }));
      const file = new File(['subjectID,date,note\nsubject1,2024-01-01'], 'data.csv', { type: 'text/csv' });
      await expect(processInstrumentCSV(file, instrument)).resolves.toMatchObject([{ note: undefined }]);
    });

    it('should reject a schema that is not an object', async () => {
      const file = csvFile([['subjectID'], ['subject1']]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z4.string())),
        'Expected schema to be instance of ZodObject'
      );
    });

    it('should reject a CSV with headers but no rows of data', async () => {
      const file = csvFile([['subjectID', 'date', 'score', 'feedback']]);
      await expectRejection(processInstrumentCSV(file, mockInstrument), 'CSV does not contain any rows of data');
    });

    it('should name the invisible character hidden in the first subject ID', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1\u00ad', '2024-01-01', '1', 'ok']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Subject ID at row 1 contains non-visible characters (U+00AD)'
      );
    });

    it('should name the invisible character hidden in the first date', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1', '\u180e2024-01-01', '1', 'ok']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Date at row 1 contains non-visible characters (U+180E)'
      );
    });

    it('should name the row and column of an invisible character in any other value', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1', '2024-01-01', '1', 'o\u200bk']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        "Value at row 1 and column 'feedback' contains non-visible characters (U+200B)"
      );
    });

    it('should skip the sample data row copied from the template', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'score', 'feedback'],
        ['string', 'yyyy-mm-dd', 'number', 'string'],
        ['subject1', '2024-01-01', '1', 'ok'],
        ['subject2', '2024-01-02', '2', 'ok']
      ]);
      await expect(processInstrumentCSV(file, mockInstrument)).resolves.toMatchObject([
        { subjectID: 'subject1' },
        { subjectID: 'subject2' }
      ]);
    });

    it('should reject a column that is not in the template', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'extra'],
        ['subject1', '2024-01-01', 'x']
      ]);
      await expectRejection(
        processInstrumentCSV(file, mockInstrument),
        'Schema value at column 2 is not defined! Please check if Column has been edited/deleted from original template'
      );
    });

    it('should locate a value that cannot be converted by column and row', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'done'],
        ['subject1', '2024-01-01', 'maybe']
      ]);
      await expect(processInstrumentCSV(file, instrumentWith(z4.object({ done: z4.boolean() })))).rejects.toMatchObject(
        {
          description: {
            en: "Undecipherable Boolean Type: 'maybe' at column name: 'done' and row number '1'",
            fr: "Type booléen indéchiffrable : 'maybe' au nom de colonne : 'done' et numéro de ligne '1'"
          }
        }
      );
    });

    it.each([
      [
        'items',
        'RECORD_ARRAY(a:b)',
        z4.array(z4.string()),
        "Unsupported type for innerType of array record 'string': must be 'object'"
      ],
      ['nested', 'a', z4.object({ a: z4.string() }), "Unexpected Zod type name 'object'"],
      ['items', 'items', z4.array(z4.object({ name: z4.string() })), 'Syntax error in RECORD_ARRAY declaration: items'],
      [
        'items',
        'RECORD_ARRAY(name:a,,name:b)',
        z4.array(z4.object({ name: z4.string() })),
        'One or more of the record array fields was left empty'
      ],
      ['items', 'RECORD_ARRAY(:a)', z4.array(z4.object({ name: z4.string() })), 'Malformed record at index 0']
    ])(
      'should reject %s value %j as unconvertible, naming the column and row',
      async (column, value, schema, message) => {
        const file = csvFile([
          ['subjectID', 'date', column],
          ['subject1', '2024-01-01', value]
        ]);
        await expectRejection(
          processInstrumentCSV(file, instrumentWith(z4.object({ [column]: schema }))),
          `${message} at column name: '${column}' and row number '1'`
        );
      }
    );

    it('should fall back to a generic error for a record key outside the schema, rather than naming the key', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'items'],
        ['subject1', '2024-01-01', 'RECORD_ARRAY(unknown:a)']
      ]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z4.object({ items: z4.array(z4.object({ name: z4.string() })) }))),
        'Error parsing CSV'
      );
    });

    it('should reject a row the instrument schema does not accept', async () => {
      const file = csvFile([
        ['subjectID', 'date', 'level'],
        ['subject1', '2024-01-01', 'medium']
      ]);
      await expectRejection(
        processInstrumentCSV(file, instrumentWith(z4.object({ level: z4.enum(['low', 'high']) }))),
        'Schema parsing failed: refer to the browser console for further details'
      );
    });
  });
});

describe('reformatInstrumentData', () => {
  const group: Group = {
    accessibleInstrumentIds: [],
    createdAt: new Date('2026-01-01'),
    id: 'group-1',
    instrumentRepoIds: [],
    name: 'Group One',
    settings: { defaultIdentificationMethod: 'CUSTOM_ID' },
    subjectIds: [],
    type: 'CLINICAL',
    updatedAt: new Date('2026-01-02'),
    userIds: []
  };

  const data = [{ date: new Date('2024-01-01'), score: 5, subjectID: 'subject1' }];

  it('should scope each subject ID to the current group and separate the record data', () => {
    expect(
      reformatInstrumentData({
        currentGroup: group,
        currentUsername: 'jdoe',
        data,
        instrument: unilingualFormInstrument.instance
      })
    ).toStrictEqual({
      groupId: 'group-1',
      instrumentId: unilingualFormInstrument.instance.id,
      records: [{ data: { score: 5 }, date: new Date('2024-01-01'), subjectId: 'Group_One$subject1' }],
      username: 'jdoe'
    });
  });

  it('should scope subject IDs to root and omit the username when there is no group or user', () => {
    expect(
      reformatInstrumentData({
        currentGroup: null,
        currentUsername: null,
        data,
        instrument: unilingualFormInstrument.instance
      })
    ).toMatchObject({
      groupId: undefined,
      records: [{ subjectId: 'root$subject1' }],
      username: undefined
    });
  });
});
