/* eslint-disable @typescript-eslint/no-namespace */

import { isNumberLike, isObjectLike, isPlainObject, isZodType, parseNumber } from '@douglasneuroinformatics/libjs';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument, FormTypes, Json } from '@opendatacapture/runtime-core';
import type { Group } from '@opendatacapture/schemas/group';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { encodeScopedSubjectId } from '@opendatacapture/subject-utils';
import { mapValues } from 'lodash-es';
import { parse, unparse } from 'papaparse';
import type { Merge } from 'type-fest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

const INTERNAL_HEADERS = ['subjectID', 'date'];

const INTERNAL_HEADERS_SAMPLE_DATA = ['string', 'yyyy-mm-dd'];

const SUBJECT_ID_REGEX = /^[^$\s]+$/;

function parseBooleanEntry(entry: string): boolean {
  if (entry.toLowerCase() === 'true') {
    return true;
  } else if (entry.toLowerCase() === 'false') {
    return false;
  }
  throw new UploadError({
    en: `Undecipherable Boolean Type: '${entry}'`,
    fr: `Type booléen indéchiffrable : '${entry}'`
  });
}

function parseDateEntry(entry: string): Date {
  const date = new Date(entry);
  if (Number.isNaN(date.getTime())) {
    throw new UploadError({
      en: `Failed to parse date: '${entry}'`,
      fr: `Échec de l'analyse de la date : '${entry}'`
    });
  }
  return date;
}

function parseNumberEntry(entry: string): number {
  if (isNumberLike(entry)) {
    return parseNumber(entry);
  }
  throw new UploadError({
    en: `Invalid number type: '${entry}'`,
    fr: `Type de nombre invalide : '${entry}'`
  });
}

function parseSetEntry(entry: string): Set<string> {
  const set = extractSetEntry(entry);
  if (set.size === 0) {
    throw new UploadError({
      en: 'Empty set is not allowed',
      fr: "Un ensemble vide n'est pas autorisé"
    });
  }
  return set;
}

function nonVisibleCharChecker(entry: string | undefined) {
  if (!entry) {
    throw new UploadError({
      en: 'Undefined value',
      fr: 'Valeur non définie'
    });
  }
  const nonVisibleCharCheck = /[\u200B-\u200D\uFEFF\u180E]/g.exec(entry);
  return nonVisibleCharCheck;
}

const ZOD_TYPE_NAMES = [
  'ZodNumber',
  'ZodString',
  'ZodBoolean',
  'ZodOptional',
  'ZodSet',
  'ZodDate',
  'ZodEnum',
  'ZodArray',
  'ZodObject',
  'ZodEffects'
] as const;

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
      en: `Unexpected Zod type name '${typeName}'`,
      fr: `Nom de type Zod inattendu '${typeName}'`
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
  entry = entry.trim();
  const opening = 'RECORD_ARRAY(';
  const closing = ')';
  if (!entry.startsWith(opening) && !entry.endsWith(closing)) {
    throw new UploadError({
      en: `Syntax error in RECORD_ARRAY declaration: ${entry}`,
      fr: `Erreur de syntaxe dans la déclaration RECORD_ARRAY : ${entry}`
    });
  }
  const result = entry.slice(opening.length, -1);

  const recordArrayDataList = result.split(';');

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
      if (!recordKey) {
        throw new UploadError({
          en: `Malformed record at index ${i}`,
          fr: `Enregistrement mal formé à l'index ${i}`
        });
      }
      //recordValue can be empty if the value is optional
      records[recordKey] = recordValue!;
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

export namespace Zod3 {
  export type ZodTypeName = Extract<`${z3.ZodFirstPartyTypeKind}`, (typeof ZOD_TYPE_NAMES)[number]>;

  export type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodEffects' | 'ZodOptional'>;

  type AnyZodTypeDef = z3.ZodTypeDef & { typeName: ZodTypeName };

  type ZodObjectArrayDef = z3.ZodArrayDef & { type: z3.AnyZodObject };

  export type ZodTypeNameResult = {
    enumValues?: readonly string[];
    isOptional: boolean;
    multiKeys?: string[];
    multiValues?: ZodTypeNameResult[];
    typeName: RequiredZodTypeName;
  };

  function isZodEffects(value: unknown): value is z3.ZodEffects<z3.ZodType> {
    return isObjectLike(value) && value.constructor.name === 'ZodEffects';
  }

  function isZodEffectsObject(value: unknown): value is z3.ZodEffects<z3.AnyZodObject> {
    return isZodEffects(value) && isZodObject(value.innerType());
  }

  function isZodObject(value: unknown): value is z3.AnyZodObject {
    return isObjectLike(value) && value.constructor.name === 'ZodObject';
  }

  export function isZodTypeDef(value: unknown): value is AnyZodTypeDef {
    return isPlainObject(value) && ZOD_TYPE_NAMES.includes(value.typeName as ZodTypeName);
  }

  function isZodOptionalDef(def: AnyZodTypeDef): def is z3.ZodOptionalDef<z3.ZodTypeAny> {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodOptional;
  }

  export function isZodEnumDef(def: AnyZodTypeDef): def is z3.ZodEnumDef {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodEnum;
  }

  function isZodSetDef(def: AnyZodTypeDef): def is z3.ZodSetDef {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodSet;
  }

  function isZodArrayDef(def: AnyZodTypeDef): def is z3.ZodArrayDef {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodArray;
  }

  function isZodObjectArrayDef(def: AnyZodTypeDef): def is ZodObjectArrayDef {
    return isZodArrayDef(def) && isZodObject(def.type);
  }

  function isZodEffectsDef(def: AnyZodTypeDef): def is z3.ZodEffectsDef {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodEffects;
  }

  export function interpretZodArray(def: ZodObjectArrayDef, isOptional?: boolean): ZodTypeNameResult {
    const listOfZodElements: ZodTypeNameResult[] = [];
    const listOfZodKeys: string[] = [];

    const shape = def.type.shape as { [key: string]: z3.ZodTypeAny };

    for (const [key, insideType] of Object.entries(shape)) {
      const def: unknown = insideType._def;
      if (isZodTypeDef(def)) {
        const innerTypeName = getZodTypeName(insideType);
        listOfZodElements.push(innerTypeName);
        listOfZodKeys.push(key);
      } else {
        console.error({ def });
        throw new UploadError({
          en: `Unhandled case!`,
          fr: `Cas non géré !`
        });
      }
    }
    if (listOfZodElements.length === 0) {
      throw new UploadError({
        en: 'Failure to interpret Zod Object or Array',
        fr: "Échec de l'interprétation de l'objet ou du tableau Zod"
      });
    }
    return {
      isOptional: Boolean(isOptional),
      multiKeys: listOfZodKeys,
      multiValues: listOfZodElements,
      typeName: def.typeName
    };
  }

  export function getZodTypeName(schema: z3.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
    const def: unknown = schema._def;
    if (!isZodTypeDef(def)) {
      console.error(`Cannot parse ZodType from schema: ${JSON.stringify(schema)}`);
      throw new UploadError({ en: 'Unexpected Error', fr: 'Erreur inattendue' });
    } else if (isZodOptionalDef(def)) {
      return getZodTypeName(def.innerType, true);
    } else if (isZodEnumDef(def)) {
      return {
        enumValues: def.values,
        isOptional: Boolean(isOptional),
        typeName: def.typeName
      };
    } else if (isZodObjectArrayDef(def)) {
      return interpretZodArray(def, isOptional);
    } else if (isZodSetDef(def)) {
      const innerDef: unknown = def.valueType._def;
      if (!isZodTypeDef(innerDef)) {
        throw new UploadError({
          en: 'Invalid inner type: ZodSet value type must have a valid type definition',
          fr: 'Type interne invalide : le type de valeur ZodSet doit avoir une définition de type valide'
        });
      }
      if (isZodEnumDef(innerDef)) {
        return {
          enumValues: innerDef.values,
          isOptional: Boolean(isOptional),
          typeName: def.typeName
        };
      }
    }
    return {
      isOptional: Boolean(isOptional),
      typeName: def.typeName satisfies ZodTypeName as RequiredZodTypeName
    };
  }

  export function generateSampleData({
    enumValues,
    isOptional,
    multiKeys,
    multiValues,
    typeName
  }: ZodTypeNameResult): string {
    switch (typeName) {
      case 'ZodBoolean':
        return formatOptionalEntry('true/false', isOptional);
      case 'ZodDate':
        return formatOptionalEntry('yyyy-mm-dd', isOptional);
      case 'ZodNumber':
        return formatOptionalEntry('number', isOptional);
      case 'ZodSet':
        try {
          if (enumValues) {
            return formatOptionalEntry(`SET(${enumValues.join('/')}, ...)`, isOptional);
          }
          return formatOptionalEntry('SET(a,b,c)', isOptional);
        } catch {
          throw new UploadError({
            en: `Failed to generate sample data for ZodSet`,
            fr: `Échec de la génération de données d'exemple pour ZodSet`
          });
        }
      case 'ZodString':
        return formatOptionalEntry('string', isOptional);
      case 'ZodEnum':
        try {
          let possibleEnumOutputs = '';
          if (!enumValues) {
            throw new UploadError({
              en: 'Enum values do not exist',
              fr: `Values d'Enum n'existe pas`
            });
          }
          for (const val of enumValues) {
            possibleEnumOutputs += val + '/';
          }
          possibleEnumOutputs = possibleEnumOutputs.slice(0, -1);
          return formatOptionalEntry(possibleEnumOutputs, isOptional);
        } catch {
          throw new UploadError({
            en: 'Invalid Enum error',
            fr: 'Erreur Enum invalide'
          });
        }
      case 'ZodArray':
      case 'ZodObject':
        try {
          let multiString = 'RECORD_ARRAY( ';
          if (!(multiValues && multiKeys)) {
            throw new UploadError({
              en: 'Record Array is empty or does not exist',
              fr: 'Erreur record array invalide'
            });
          }
          for (let i = 0; i < multiValues.length; i++) {
            const inputData = multiValues[i]!;
            if (i === multiValues.length - 1 && multiValues[i] !== undefined) {
              multiString += multiKeys[i] + ':' + generateSampleData(inputData);
            } else {
              multiString += multiKeys[i] + ':' + generateSampleData(inputData) + ',';
            }
          }
          multiString += ';)';
          return multiString;
        } catch (e) {
          throw new UploadError({
            en: `Invalid Record Array Error` + (e instanceof UploadError ? `: ${e.description.en}` : ''),
            fr:
              `Erreur de tableau d'enregistrements invalide` +
              (e instanceof UploadError ? ` : ${e.description.fr}` : '')
          });
        }
      default:
        throw new UploadError({
          en: `Invalid zod schema: unexpected type name '${typeName satisfies never}'`,
          fr: `Schéma zod invalide : nom de type inattendu '${typeName satisfies never}'`
        });
    }
  }

  function interpretZodConvertResult(convertResult: ZodTypeNameResult, entry: string): unknown {
    if (entry === '' && convertResult.isOptional) {
      return undefined;
    }
    switch (convertResult.typeName) {
      case 'ZodArray':
      case 'ZodObject':
        if (!convertResult.multiKeys || !convertResult.multiValues) {
          throw new UploadError({
            en: 'Record Array keys or values do not exist',
            fr: "Les clés ou valeurs du tableau d'enregistrements n'existent pas"
          });
        }

        return extractRecordArrayEntry(entry).map((parsedRecord) => {
          const result: { [key: string]: unknown } = {};
          convertResult.multiKeys!.forEach((key, index) => {
            const rawValue = parsedRecord[key];
            if (rawValue !== undefined) {
              result[key] = interpretZodConvertResult(convertResult.multiValues![index]!, rawValue);
            }
          });
          return result;
        });

      case 'ZodBoolean':
        return parseBooleanEntry(entry);
      case 'ZodDate':
        return parseDateEntry(entry);
      case 'ZodEnum':
        return entry;
      case 'ZodNumber':
        return parseNumberEntry(entry);
      case 'ZodSet':
        return parseSetEntry(entry);
      case 'ZodString':
        return entry;
      default:
        throw UnexpectedZodTypeError.forTypeName(convertResult.typeName);
    }
  }

  export function createUploadTemplateCSV(
    instrumentSchema: z3.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ) {
    if (!(isZodObject(instrumentSchema) || isZodEffectsObject(instrumentSchema))) {
      throw new UploadError({
        en: 'Validation schema for this instrument is invalid',
        fr: 'Le schéma de validation de cet instrument est invalide'
      });
    }
    const def = instrumentSchema._def;
    const shape = (def.typeName === z3.ZodFirstPartyTypeKind.ZodObject ? def.shape() : def.schema._def.shape()) as {
      [key: string]: z3.ZodTypeAny;
    };

    const columnNames = Object.keys(shape);
    const csvColumns = INTERNAL_HEADERS.concat(columnNames);
    const sampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];

    for (const col of columnNames) {
      const typeNameResult = getZodTypeName(shape[col]!);
      sampleData.push(generateSampleData(typeNameResult));
    }

    return {
      content: unparse([csvColumns, sampleData]),
      filename: getTemplateFilename(instrumentInternal)
    };
  }

  export async function processInstrumentCSV(
    input: File,
    instrument: AnyUnilingualFormInstrument
  ): Promise<FormTypes.Data[]> {
    const instrumentSchema = instrument.validationSchema as z3.AnyZodObject;
    let shape: { [key: string]: z3.ZodTypeAny } = {};

    let instrumentSchemaWithInternal: z3.AnyZodObject;
    const instrumentSchemaDef: unknown = instrumentSchema._def;
    if (isZodTypeDef(instrumentSchemaDef) && isZodEffectsDef(instrumentSchemaDef)) {
      if (!isZodObject(instrumentSchemaDef.schema)) {
        throw new UploadError({
          en: 'Invalid instrument schema',
          fr: "Schéma d'instrument invalide"
        });
      }
      instrumentSchemaWithInternal = instrumentSchemaDef.schema.extend({
        date: z3.coerce.date(),
        subjectID: z3.string().regex(SUBJECT_ID_REGEX)
      });
      shape = (instrumentSchemaWithInternal._def as z3.ZodObjectDef).shape() as { [key: string]: z3.ZodTypeAny };
    } else {
      instrumentSchemaWithInternal = instrumentSchema.extend({
        date: z3.coerce.date(),
        subjectID: z3.string().regex(SUBJECT_ID_REGEX)
      });
      shape = instrumentSchemaWithInternal.shape as { [key: string]: z3.ZodTypeAny };
    }

    return new Promise<FormTypes.Data[]>((resolve, reject) => {
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

        let rowNumber = 1;
        const regexResultSubject = nonVisibleCharChecker(dataLines[0][0]);
        const regexResultDate = nonVisibleCharChecker(dataLines[0][1]);

        if (!regexResultSubject?.[1]) {
          return reject(
            new UploadError({
              en: `Subject ID at row ${rowNumber} contains Non-visisble characters`,
              fr: `L'ID du sujet à la ligne ${rowNumber} contient des caractères non visibles`
            })
          );
        }
        if (!regexResultDate?.[1]) {
          return reject(
            new UploadError({
              en: `Date at row ${rowNumber} contains Non-visisble characters`,
              fr: `Date à la ligne ${rowNumber} contient des caractères non visibles`
            })
          );
        }

        //remove sample data if included remove any mongolian vowel separators
        if (
          dataLines[0][0]?.replace(/[\u200B-\u200D\uFEFF\u180E]/g, '').trim() === INTERNAL_HEADERS_SAMPLE_DATA[0] &&
          dataLines[0][1]?.replace(/[\u200B-\u200D\uFEFF\u180E]/g, '').trim() === INTERNAL_HEADERS_SAMPLE_DATA[1]
        ) {
          dataLines.shift();
        }

        const result: FormTypes.Data[] = [];

        for (const elements of dataLines) {
          const jsonLine: { [key: string]: unknown } = {};
          for (let i = 0; i < headers.length; i++) {
            const key = headers[i]!.trim();
            const rawValue = elements[i]!.trim();
            if (rawValue === '\n') {
              continue;
            }

            const nonVisibleCharCheck = nonVisibleCharChecker(rawValue);

            //Check for non visible char in every row, return error if present
            if (!nonVisibleCharCheck?.[1]) {
              return reject(
                new UploadError({
                  en: `Value at row ${rowNumber} and column ${key} contains Non-visisble characters`,
                  fr: `Date à la ligne ${rowNumber} et column ${key} contient des caractères non visibles`
                })
              );
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
              const result = interpretZodConvertResult(getZodTypeName(shape[key]), rawValue);
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
          const zodCheck = instrumentSchemaWithInternal.safeParse(jsonLine);
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

  function interpretZodConvertResult(convertResult: ZodConvertResult, entry: string): unknown {
    if (entry === '' && convertResult.isOptional) {
      return undefined;
    }
    switch (convertResult.typeName) {
      case 'array':
        return extractRecordArrayEntry(entry).map((parsedRecord) => {
          if (convertResult.innerType.typeName !== 'object') {
            throw new UploadError({
              en: `Unsupported type for innerType of array record '${convertResult.innerType.typeName}': must be 'object'`,
              fr: `Type non pris en charge pour innerType d'enregistrement de tableau '${convertResult.innerType.typeName}': doit être « objet »`
            });
          }
          return mapValues(parsedRecord, (value, key): unknown =>
            interpretZodConvertResult((convertResult.innerType as ObjectZodConvertResult).dimensions[key]!, value)
          );
        });
      case 'boolean':
        return parseBooleanEntry(entry);
      case 'date':
        return parseDateEntry(entry);
      case 'enum':
        return entry;
      case 'int':
      case 'number':
        return parseNumberEntry(entry);
      case 'set':
        return parseSetEntry(entry);
      case 'string':
        return entry;
      default:
        throw UnexpectedZodTypeError.forTypeName(convertResult.typeName);
    }
  }

  export function generateSampleData(convertResult: ZodConvertResult): string {
    switch (convertResult.typeName) {
      case 'array': {
        return `RECORD_ARRAY(${generateSampleData(convertResult.innerType)}; ...)`;
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
        en: 'Expected schema to be instance of ZodObject',
        fr: 'Le schéma attendu doit être une instance de ZodObject'
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
        en: 'Expected schema to be instance of ZodObject',
        fr: 'Le schéma attendu doit être une instance de ZodObject'
      });
    }

    const instrumentSchema = instrument.validationSchema.extend({
      date: z4.coerce.date(),
      subjectID: z4.string().regex(SUBJECT_ID_REGEX)
    });

    const shape = instrumentSchema.shape as { [key: string]: z4.ZodType };

    return new Promise<FormTypes.Data[]>((resolve, reject) => {
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

        //remove sample data if included (account for old mongolian vowel separator templates)
        //return an error if non space charaters are found

        let rowNumber = 1;

        const regexResultSubject = nonVisibleCharChecker(dataLines[0][0]);
        const regexResultDate = nonVisibleCharChecker(dataLines[0][1]);

        if (!regexResultSubject?.[1]) {
          return reject(
            new UploadError({
              en: `Subject ID at row ${rowNumber} contains Non-visisble characters`,
              fr: `L'ID du sujet à la ligne ${rowNumber} contient des caractères non visibles`
            })
          );
        }
        if (!regexResultDate?.[1]) {
          return reject(
            new UploadError({
              en: `Date at row ${rowNumber} contains Non-visisble characters`,
              fr: `Date à la ligne ${rowNumber} contient des caractères non visibles`
            })
          );
        }

        if (
          dataLines[0][0]?.replace(/[\u200B-\u200D\uFEFF\u180E]/g, '').trim() === INTERNAL_HEADERS_SAMPLE_DATA[0] &&
          dataLines[0][1]?.replace(/[\u200B-\u200D\uFEFF\u180E]/g, '').trim() === INTERNAL_HEADERS_SAMPLE_DATA[1]
        ) {
          dataLines.shift();
        }

        const result: FormTypes.Data[] = [];

        for (const elements of dataLines) {
          const jsonLine: { [key: string]: unknown } = {};
          for (let i = 0; i < headers.length; i++) {
            const key = headers[i]!.trim();
            const rawValue = elements[i]!.trim();

            if (rawValue === '\n') {
              continue;
            }

            const nonVisibleCharCheck = nonVisibleCharChecker(rawValue);

            //Check for non visible char in every row, return error if present
            if (!nonVisibleCharCheck?.[1]) {
              return reject(
                new UploadError({
                  en: `Value at row ${rowNumber} and column ${key} contains Non-visisble characters`,
                  fr: `Date à la ligne ${rowNumber} et column ${key} contient des caractères non visibles`
                })
              );
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
              const result = interpretZodConvertResult(parseZodSchema(shape[key]), rawValue);
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
                en: 'Schema parsing failed: refer to the browser console for further details',
                fr: `Échec de l'analyse du schéma : reportez-vous à la console du navigateur pour plus de détails`
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

export function createUploadTemplateCSV(instrument: AnyUnilingualFormInstrument) {
  const instrumentSchema = instrument.validationSchema;
  if (isZodType(instrumentSchema, { version: 4 })) {
    return Zod4.createUploadTemplateCSV(instrumentSchema, instrument.internal);
  }
  return Zod3.createUploadTemplateCSV(instrumentSchema, instrument.internal);
}

export function processInstrumentCSV(input: File, instrument: AnyUnilingualFormInstrument) {
  const instrumentSchema = instrument.validationSchema;
  if (isZodType(instrumentSchema, { version: 4 })) {
    return Zod4.processInstrumentCSV(input, instrument);
  }
  return Zod3.processInstrumentCSV(input, instrument);
}

export function reformatInstrumentData({
  currentGroup,
  data,
  instrument
}: {
  currentGroup: Group | null;
  data: FormTypes.Data[];
  instrument: UnilingualInstrumentInfo;
}): UploadInstrumentRecordsData {
  const recordsList: { data: Json; date: Date; subjectId: string }[] = [];
  for (const dataInfo of data) {
    const { date: dataDate, subjectID: dataSubjectId, ...restOfData } = dataInfo;
    const createdRecord = {
      data: restOfData as Json,
      date: dataDate as Date,
      subjectId: encodeScopedSubjectId(dataSubjectId as string, {
        groupName: currentGroup?.name ?? 'root'
      })
    };
    recordsList.push(createdRecord);
  }
  const reformatForSending: UploadInstrumentRecordsData = {
    groupId: currentGroup?.id,
    instrumentId: instrument.id,
    records: recordsList
  };
  return reformatForSending;
}

export { UploadError };
