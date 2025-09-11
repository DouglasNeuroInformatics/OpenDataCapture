/* eslint-disable @typescript-eslint/no-namespace */

import { isNumberLike, parseNumber } from '@douglasneuroinformatics/libjs';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { mapValues, reject } from 'lodash-es';
import { parse, unparse } from 'papaparse';
import type { Merge } from 'type-fest';
import { z as z4 } from 'zod/v4';

const INTERNAL_HEADERS = ['subjectID', 'date'];

const INTERNAL_HEADERS_SAMPLE_DATA = ['string', 'yyyy-mm-dd'];

const SUBJECT_ID_REGEX = /^[^$\s]+$/;

class UploadError extends Error {
  description: {
    [L in Language]?: string;
  };

  constructor(description: { [L in Language]?: string }) {
    super();
    this.description = description;
  }
}

class UnexpectedZodTypeError extends UploadError {
  private constructor(description: { [L in Language]?: string }) {
    super(description);
  }

  static forTypeName(typeName: string | undefined) {
    return new this({
      en: `Unexpected Zod type name '${typeName}'`
    });
  }
}

function extractSetEntry(entry: string) {
  const result = /SET\(\s*(.*?)\s*\)/.exec(entry);
  if (!result?.[1]) {
    throw new UploadError({
      en: `Failed to extract set value from entry: '${entry}'`,
      fr: `Échec de l'extraction de la valeur de l'ensemble de l'entrée : '${entry}'`
    });
  }
  return new Set(
    result[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function extractRecordArrayEntry(entry: string): { [key: string]: string }[] {
  const result = /RECORD_ARRAY\(\s*(.*?)[\s;]*\)/.exec(entry);
  if (!result?.[1]) {
    throw new UploadError({
      en: `Failed to extract record array value from entry: '${entry}'`,
      fr: `Échec de l'extraction de la valeur du tableau d'enregistrements de l'entrée : '${entry}'`
    });
  }

  const recordArrayDataList = result[1].split(';');

  if (recordArrayDataList.at(-1) === '') {
    recordArrayDataList.pop();
  }

  return recordArrayDataList.map((listData) => {
    const recordsList = listData.split(',');
    if (!recordsList) {
      throw new UploadError({
        en: `Record in the record array was left undefined`,
        fr: `L'enregistrement dans le tableau d'enregistrements n'est pas défini`
      });
    }
    if (recordsList.some((str) => str === '')) {
      throw new UploadError({
        en: `One or more of the record array fields was left empty`,
        fr: `Un ou plusieurs champs du tableau d'enregistrements ont été laissés vides`
      });
    }
    const records: { [key: string]: string } = {};
    recordsList.forEach((rawRecord, i) => {
      const [recordKey, recordValue] = rawRecord.split(':').map((s) => s.trim());
      if (!(recordKey && recordValue)) {
        throw new UploadError({
          en: `Malformed record at index ${i}`
        });
      }
      records[recordKey] = recordValue;
    });
    return records;
  });
}

function formatOptionalEntry(s: string, isOptional: boolean) {
  return isOptional ? `${s} (optional)` : s;
}

function getTemplateFilename(instrumentInternal: AnyUnilingualFormInstrument['internal']) {
  return `${instrumentInternal.name}_${instrumentInternal.edition}_template.csv`;
}

export namespace Zod4 {
  export type TypeName = Extract<
    z4.core.$ZodTypeDef['type'],
    'array' | 'boolean' | 'date' | 'enum' | 'int' | 'number' | 'object' | 'optional' | 'set' | 'string'
  >;

  type BaseZodConvertResult = {
    isOptional: boolean;
    typeName: Exclude<TypeName, 'array' | 'enum' | 'object' | 'set'>;
  };

  type ArrayZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      innerType: ZodConvertResult;
      typeName: 'array';
    }
  >;

  type EnumZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      enumValues: readonly string[];
      typeName: 'enum';
    }
  >;

  type ObjectZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      dimensions: {
        [key: string]: ZodConvertResult;
      };
      typeName: 'object';
    }
  >;

  type SetZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      innerType: ZodConvertResult;
      typeName: 'set';
    }
  >;

  type ZodConvertResult =
    | ArrayZodConvertResult
    | BaseZodConvertResult
    | EnumZodConvertResult
    | ObjectZodConvertResult
    | SetZodConvertResult;

  function parseZodSchema(schema: unknown, isOptional = false): ZodConvertResult {
    switch (true) {
      case schema instanceof z4.ZodArray:
        return {
          innerType: parseZodSchema(schema.element),
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodObject: {
        const dimensions: { [key: string]: ZodConvertResult } = {};
        Object.entries(schema.shape).forEach(([key, value]) => {
          dimensions[key] = parseZodSchema(value);
        });
        return {
          dimensions,
          isOptional,
          typeName: schema.def.type
        };
      }
      case schema instanceof z4.ZodBoolean:
        return {
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodDate:
        return {
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodEnum:
        return {
          enumValues: schema.options.map(String),
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodNumber:
        return {
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodSet:
        return {
          innerType: parseZodSchema(schema.def.valueType),
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodString:
        return {
          isOptional,
          typeName: schema.def.type
        };
      case schema instanceof z4.ZodOptional:
        return parseZodSchema(schema.def.innerType, true);
      default:
        throw UnexpectedZodTypeError.forTypeName((schema as z4.ZodType)?.def?.type);
    }
  }

  function interpetZodConvertResult(convertResult: ZodConvertResult, entry: string): unknown {
    if (entry === '' && convertResult.isOptional) {
      return { success: true, value: undefined };
    }
    switch (convertResult.typeName) {
      case 'array':
        return extractRecordArrayEntry(entry).map((parsedRecord) => {
          return mapValues(parsedRecord, (entry): unknown => interpetZodConvertResult(convertResult.innerType, entry));
        });

      case 'boolean':
        if (entry.toLowerCase() === 'true') {
          return true;
        } else if (entry.toLowerCase() === 'false') {
          return false;
        }
        throw new UploadError({
          en: `Undecipherable Boolean Type: '${entry}'`,
          fr: `Type booléen indéchiffrable : '${entry}'`
        });
      case 'date': {
        const date = new Date(entry);
        if (Number.isNaN(date.getTime())) {
          throw new UploadError({
            en: `Failed to parse date: '${entry}'`,
            fr: `Échec de l'analyse de la date : '${entry}'`
          });
        }
        return date;
      }
      case 'enum':
        return entry;
      case 'int':
      case 'number':
        if (isNumberLike(entry)) {
          return parseNumber(entry);
        }
        throw new UploadError({ en: `Invalid number type: '${entry}'`, fr: `Type de nombre invalide : '${entry}'` });
      case 'set': {
        const set = extractSetEntry(entry);
        if (set.size === 0) {
          throw new UploadError({ en: 'Empty set is not allowed', fr: "Un ensemble vide n'est pas autorisé" });
        }
        return set;
      }
      case 'string':
        return entry;
      default:
        throw UnexpectedZodTypeError.forTypeName(convertResult.typeName);
    }
  }

  export function generateSampleData(convertResult: ZodConvertResult): string {
    switch (convertResult.typeName) {
      case 'array': {
        return `RECORD_ARRAY(${generateSampleData(convertResult.innerType)};)`;
      }
      case 'boolean':
        return formatOptionalEntry('true/false', convertResult.isOptional);
      case 'date':
        return formatOptionalEntry('yyyy-mm-dd', convertResult.isOptional);
      case 'enum': {
        let possibleEnumOutputs = '';
        for (const val of convertResult.enumValues) {
          possibleEnumOutputs += val + '/';
        }
        possibleEnumOutputs = possibleEnumOutputs.slice(0, -1);
        return formatOptionalEntry(possibleEnumOutputs, convertResult.isOptional);
      }
      case 'int':
      case 'number':
        return formatOptionalEntry('number', convertResult.isOptional);
      case 'object': {
        let output = '';
        const keys = Object.keys(convertResult.dimensions);
        keys.forEach((key, i) => {
          output += `${key}: ${generateSampleData(convertResult.dimensions[key]!)}`;
          if (i !== keys.length - 1) {
            output += ',';
          }
        });
        return output;
      }
      case 'set': {
        const innerTypeSample = generateSampleData(convertResult.innerType);
        return formatOptionalEntry(`SET(${innerTypeSample})`, convertResult.isOptional);
      }
      case 'string':
        return formatOptionalEntry('string', convertResult.isOptional);
      default:
        throw UnexpectedZodTypeError.forTypeName(convertResult.typeName);
    }
  }

  export function createUploadTemplateCSV(
    instrumentSchema: z4.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ) {
    if (!(instrumentSchema instanceof z4.ZodObject)) {
      throw new UploadError({
        en: 'Expected schema to be instance of ZodObject'
      });
    }

    const csvColumns = [...INTERNAL_HEADERS];
    const sampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];

    Object.entries(instrumentSchema.shape).forEach(([key, subschema]) => {
      csvColumns.push(key);
      sampleData.push(generateSampleData(parseZodSchema(subschema)));
    });

    return {
      content: unparse([csvColumns, sampleData]),
      filename: getTemplateFilename(instrumentInternal)
    };
  }

  export async function processInstrumentCSV(
    input: File,
    instrument: AnyUnilingualFormInstrument
  ): Promise<FormTypes.Data[]> {
    if (!(instrument.validationSchema instanceof z4.ZodObject)) {
      throw new UploadError({
        en: 'Expected schema to be instance of ZodObject'
      });
    }

    const instrumentSchema = instrument.validationSchema.extend({
      date: z4.coerce.date(),
      subjectID: z4.string().regex(SUBJECT_ID_REGEX)
    });

    const shape = instrumentSchema.shape as { [key: string]: z4.ZodType };

    return new Promise<FormTypes.Data[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parseResultCsv = parse<string[]>(text, {
          header: false,
          skipEmptyLines: true
        });
        const [headers, ...dataLines] = parseResultCsv.data satisfies string[][] as [string[], ...string[][]];

        if (!dataLines?.[0]) {
          return reject(
            new UploadError({
              en: 'CSV does not contain any rows of data',
              fr: 'Le fichier CSV ne contient aucune ligne de données'
            })
          );
        }

        //remove sample data if included
        if (
          dataLines[0][0] === INTERNAL_HEADERS_SAMPLE_DATA[0] &&
          dataLines[0][1] === INTERNAL_HEADERS_SAMPLE_DATA[1]
        ) {
          dataLines.shift();
        }

        const result: FormTypes.Data[] = [];

        let rowNumber = 1;
        for (const elements of dataLines) {
          const jsonLine: { [key: string]: unknown } = {};
          for (let i = 0; i < headers.length; i++) {
            const key = headers[i]!.trim();
            const rawValue = elements[i]!.trim();
            if (rawValue === '\n') {
              continue;
            }
            if (shape[key] === undefined) {
              return reject(
                new UploadError({
                  en: `Schema value at column ${i} is not defined! Please check if Column has been edited/deleted from original template`,
                  fr: `La valeur du schéma à la colonne ${i} n'est pas définie ! Veuillez vérifier si la colonne a été modifiée/supprimée du modèle original`
                })
              );
            }
            try {
              const result = interpetZodConvertResult(parseZodSchema(shape[key]), rawValue);
              jsonLine[headers[i]!] = result;
            } catch (error: unknown) {
              if (error instanceof UploadError) {
                return reject(
                  new UploadError({
                    en: `${error.description.en} at column name: '${key}' and row number '${rowNumber}'`,
                    fr: `${error.description.fr} au nom de colonne : '${key}' et numéro de ligne '${rowNumber}`
                  })
                );
              }
              console.error(error);
              return reject(
                new UploadError({
                  en: `Error parsing CSV`,
                  fr: `Erreur avec la CSV`
                })
              );
            }
          }
          const zodCheck = instrumentSchema.safeParse(jsonLine);
          if (!zodCheck.success) {
            console.error(zodCheck.error.issues);
            console.error(`Failed to parse data: ${JSON.stringify(jsonLine)}`);
            return reject(
              new UploadError({
                en: 'Schema parsing failed: refer to the browser console for further details'
              })
            );
          }
          result.push(zodCheck.data as FormTypes.Data);
          rowNumber++;
        }
        return resolve(result);
      };
      reader.readAsText(input);
    });
  }
}
