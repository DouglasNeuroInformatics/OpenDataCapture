/* eslint-disable no-case-declarations */
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
import z, { z as z4 } from 'zod/v4';

const INTERNAL_HEADERS = ['subjectID', 'date'];

const INTERNAL_HEADERS_SAMPLE_DATA = ['string', 'yyyy-mm-dd'];

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

type CSVUploadTemplate = {
  content: string;
  filename: string;
};

type UploadOperationResult<T> =
  | {
      message: { en: string; fr: string };
      success: false;
    }
  | {
      success: true;
      value: T;
    };

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

function getTemplateFilename(instrumentInternal: AnyUnilingualFormInstrument['internal']) {
  return `${instrumentInternal.name}_${instrumentInternal.edition}_template.csv`;
}

//functions to extract set and record array strings into values
function extractSetEntry(entry: string) {
  const result = /SET\(\s*(.*?)\s*\)/.exec(entry);
  if (!result?.[1]) {
    throw new Error(
      `Failed to extract set value from entry: '${entry}' / Échec de l'extraction de la valeur de l'ensemble de l'entrée : '${entry}'`
    );
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
    throw new Error(
      `Failed to extract record array value from entry: '${entry}' / Échec de l'extraction de la valeur du tableau d'enregistrements de l'entrée : '${entry}'`
    );
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

namespace Zod3 {
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

  function formatOptionalEntry(s: string, isOptional: boolean) {
    return isOptional ? `${s} (optional)` : s;
  }

  export function generateSampleData({
    enumValues,
    isOptional,
    multiKeys,
    multiValues,
    typeName
  }: Exclude<ZodTypeNameResult, 'ZodEffects'>) {
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
            // prettier-ignore
            fr: `Erreur de tableau d'enregistrements invalide` + (e instanceof UploadError ? ` : ${e.description.fr}` : '')
          });
        }
      default:
        throw new UploadError({
          en: `Invalid zod schema: unexpected type name '${typeName satisfies never}'`,
          fr: `Schéma zod invalide : nom de type inattendu '${typeName satisfies never}'`
        });
    }
  }

  export function createUploadTemplateCSV(
    instrumentSchema: z3.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ): CSVUploadTemplate {
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

  //new processInstrumentCSV code
  export function processInstrumentCSV(
    input: File,
    instrument: AnyUnilingualFormInstrument
  ): Promise<UploadOperationResult<FormTypes.Data[]>> {
    const instrumentSchema = instrument.validationSchema as z3.AnyZodObject;
    let shape: { [key: string]: z3.ZodTypeAny } = {};

    let instrumentSchemaWithInternal: z3.AnyZodObject;
    const instrumentSchemaDef: unknown = instrumentSchema._def;
    if (isZodTypeDef(instrumentSchemaDef) && isZodEffectsDef(instrumentSchemaDef)) {
      if (!isZodObject(instrumentSchemaDef.schema)) {
        return new Promise<UploadOperationResult<FormTypes.Data[]>>((resolve) => {
          return resolve({
            message: { en: 'Invalid instrument schema', fr: "Schéma d'instrument invalide" },
            success: false
          });
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
    return new Promise<UploadOperationResult<FormTypes.Data[]>>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parseResultCsv = parse<string[]>(text, {
          header: false,
          skipEmptyLines: true
        });

        const [headers, ...dataLines] = parseResultCsv.data;

        if (!dataLines[0]) {
          return resolve({
            message: { en: 'data lines is empty array', fr: 'les lignes de données sont un tableau vide' },
            success: false
          });
        }

        //remove sample data if included
        if (
          dataLines[0][0] === INTERNAL_HEADERS_SAMPLE_DATA[0] &&
          dataLines[0][1] === INTERNAL_HEADERS_SAMPLE_DATA[1]
        ) {
          dataLines.shift();
        }

        const result: FormTypes.Data[] = [];

        if (!headers?.length) {
          return resolve({
            message: {
              en: 'headers is undefined or empty array',
              fr: 'les en-têtes ne sont pas définis ou constituent un tableau vide'
            },
            success: false
          });
        }
        let rowNumber = 1;
        for (const elements of dataLines) {
          const jsonLine: { [key: string]: unknown } = {};
          for (let j = 0; j < headers.length; j++) {
            const key = headers[j]!.trim();
            const rawValue = elements[j]!.trim();

            if (rawValue === '\n') {
              continue;
            }
            if (shape[key] === undefined) {
              return resolve({
                message: {
                  en: `Schema value at column ${j} is not defined! Please check if Column has been edited/deleted from original template`,
                  fr: `La valeur du schéma à la colonne ${j} n'est pas définie ! Veuillez vérifier si la colonne a été modifiée/supprimée du modèle original`
                },
                success: false
              });
            }
            try {
              const typeNameResult = getZodTypeName(shape[key]);

              let interpreterResult: UploadOperationResult<FormTypes.FieldValue> = {
                message: {
                  en: 'Could not interpret a correct value',
                  fr: "Impossible d'interpréter une valeur correcte"
                },
                success: false
              };

              if (typeNameResult.typeName === 'ZodArray' || typeNameResult.typeName === 'ZodObject') {
                // eslint-disable-next-line max-depth
                if (typeNameResult.multiKeys && typeNameResult.multiValues) {
                  interpreterResult = interpretZodObjectValue(
                    rawValue,
                    typeNameResult.isOptional,
                    typeNameResult.multiValues,
                    typeNameResult.multiKeys
                  );
                  // TODO - what if this is not the case? Once generics are handled correctly should not be a problem
                  // Dealt with via else statement for now
                } else {
                  interpreterResult.message = {
                    en: 'Record Array keys do not exist',
                    fr: "Les clés du tableau d'enregistrements n'existent pas"
                  };
                }
              } else {
                interpreterResult = interpretZodValue(rawValue, typeNameResult.typeName, typeNameResult.isOptional);
              }
              if (interpreterResult.success) jsonLine[headers[j]!] = interpreterResult.value;
            } catch (error: unknown) {
              if (error instanceof UploadError) {
                return resolve({
                  message: {
                    en: `${error.description.en} at column name: '${key}' and row number '${rowNumber}'`,
                    fr: `${error.description.fr} au nom de colonne : '${key}' et numéro de ligne '${rowNumber}`
                  },
                  success: false
                });
              } else {
                return resolve({
                  message: {
                    en: `Error parsing CSV`,
                    fr: `Erreur lors de l'analyse du CSV`
                  },
                  success: false
                });
              }
            }
          }

          const zodCheck = instrumentSchemaWithInternal.safeParse(jsonLine);

          if (!zodCheck.success) {
            console.error(zodCheck.error.issues);
            const zodIssues = zodCheck.error.issues.map((issue) => {
              return `issue message: \n ${issue.message} \n path: ${issue.path.toString()}`;
            });
            console.error(`Failed to parse data: ${JSON.stringify(jsonLine)}`);
            return resolve({ message: { en: zodIssues.join(), fr: zodIssues.join() }, success: false });
          }
          result.push(zodCheck.data);
          rowNumber++;
        }
        resolve({ success: true, value: result });
      };
      reader.readAsText(input);
    });
  }

  //insert zodObjectValue function
  export function interpretZodObjectValue(
    entry: string,
    isOptional: boolean,
    zList: ZodTypeNameResult[],
    zKeys: string[]
  ): UploadOperationResult<FormTypes.FieldValue> {
    try {
      if (entry === '' && isOptional) {
        return { success: true, value: undefined };
      } else if (!entry.startsWith('RECORD_ARRAY(')) {
        return { message: { en: `Invalid ZodType`, fr: `ZodType invalide` }, success: false };
      }

      const recordArray: { [key: string]: any }[] = [];
      const recordArrayDataEntry = extractRecordArrayEntry(entry);
      const recordArrayDataList = recordArrayDataEntry.split(';');

      if (recordArrayDataList.at(-1) === '') {
        recordArrayDataList.pop();
      }

      for (const listData of recordArrayDataList) {
        const recordArrayObject: { [key: string]: any } = {};

        const record = listData.split(',');

        if (!record) {
          return {
            message: {
              en: `Record in the record array was left undefined`,
              fr: `L'enregistrement dans le tableau d'enregistrements n'est pas défini`
            },
            success: false
          };
        }
        if (record.some((str) => str === '')) {
          return {
            message: {
              en: `One or more of the record array fields was left empty`,
              fr: `Un ou plusieurs champs du tableau d'enregistrements ont été laissés vides`
            },
            success: false
          };
        }
        if (!(zList.length === zKeys.length && zList.length === record.length)) {
          return {
            message: {
              en: `Incorrect number of entries for record array`,
              fr: `Nombre incorrect d'entrées pour le tableau d'enregistrements`
            },
            success: false
          };
        }
        for (let i = 0; i < record.length; i++) {
          if (!record[i]) {
            return {
              message: { en: `Failed to interpret field '${i}'`, fr: `Échec de l'interprétation du champ '${i}'` },
              success: false
            };
          }

          const recordValue = record[i]!.split(':')[1]!.trim();

          const zListResult = zList[i]!;
          if (!(zListResult && zListResult.typeName !== 'ZodArray' && zListResult.typeName !== 'ZodObject')) {
            return {
              message: { en: `Failed to interpret field '${i}'`, fr: `Échec de l'interprétation du champ '${i}'` },
              success: false
            };
          }
          const interpretZodValueResult: UploadOperationResult<FormTypes.FieldValue> = interpretZodValue(
            recordValue,
            zListResult.typeName,
            zListResult.isOptional
          );
          if (!interpretZodValueResult.success) {
            return {
              message: {
                en: `failed to interpret value at entry ${i} in record array row ${listData}`,
                fr: `échec de l'interprétation de la valeur à l'entrée ${i} dans la ligne de tableau d'enregistrements ${listData}`
              },
              success: false
            };
          }

          recordArrayObject[zKeys[i]!] = interpretZodValueResult.value;
        }
        recordArray.push(recordArrayObject);
      }

      return { success: true, value: recordArray };
    } catch {
      return {
        message: {
          en: `failed to interpret record array entries`,
          fr: `échec de l'interprétation des entrées du tableau d'enregistrements`
        },
        success: false
      };
    }
  }

  //insert interpretZodValue Function
  export function interpretZodValue(
    entry: string,
    zType: Exclude<ZodTypeName, 'ZodArray' | 'ZodEffects' | 'ZodObject' | 'ZodOptional'>,
    isOptional: boolean
  ): UploadOperationResult<FormTypes.FieldValue> {
    if (entry === '' && isOptional) {
      return { success: true, value: undefined };
    }
    switch (zType) {
      case 'ZodBoolean':
        if (entry.toLowerCase() === 'true') {
          return { success: true, value: true };
        } else if (entry.toLowerCase() === 'false') {
          return { success: true, value: false };
        }
        return {
          message: { en: `Undecipherable Boolean Type: '${entry}'`, fr: `Type booléen indéchiffrable : '${entry}'` },
          success: false
        };
      case 'ZodDate': {
        const date = new Date(entry);
        if (Number.isNaN(date.getTime())) {
          return {
            message: { en: `Failed to parse date: '${entry}'`, fr: `Échec de l'analyse de la date : '${entry}'` },
            success: false
          };
        }
        return { success: true, value: date };
      }
      case 'ZodEnum':
        return interpretZodValue(entry, 'ZodString', isOptional);
      case 'ZodNumber':
        if (isNumberLike(entry)) {
          return { success: true, value: parseNumber(entry) };
        }
        return {
          message: { en: `Invalid number type: '${entry}'`, fr: `Type de nombre invalide : '${entry}'` },
          success: false
        };
      case 'ZodSet':
        try {
          if (entry.startsWith('SET(')) {
            const setData = extractSetEntry(entry);
            const values = setData
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            if (values.length === 0) {
              return {
                message: { en: 'Empty set is not allowed', fr: "Un ensemble vide n'est pas autorisé" },
                success: false
              };
            }
            return { success: true, value: new Set(values) };
          }
        } catch {
          return {
            message: {
              en: 'Error occurred interpreting set entry',
              fr: "Une erreur s'est produite lors de l'interprétation de l'entrée de l'ensemble"
            },
            success: false
          };
        }

        return { message: { en: `Invalid ZodSet: '${entry}'`, fr: `ZodSet invalide : '${entry}'` }, success: false };
      case 'ZodString':
        return { success: true, value: entry };
      default:
        return {
          message: {
            en: `Invalid ZodType: ${zType satisfies never}`,
            fr: `ZodType invalide : ${zType satisfies never}`
          },
          success: false
        };
    }
  }
}

namespace Zod4 {
  type BaseZodConvertResult = {
    isOptional: boolean;
    typeName: Exclude<Zod3.RequiredZodTypeName, 'ZodArray' | 'ZodEnum' | 'ZodObject'>;
  };

  type ArrayZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      innerType: ZodConvertResult;
      typeName: 'ZodArray';
    }
  >;

  type EnumZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      enumValues?: readonly string[];
      typeName: 'ZodEnum';
    }
  >;

  type ObjectZodConvertResult = Merge<
    BaseZodConvertResult,
    {
      dimensions: {
        [key: string]: ZodConvertResult;
      };
      typeName: 'ZodObject';
    }
  >;

  type ZodConvertResult = ArrayZodConvertResult | BaseZodConvertResult | EnumZodConvertResult | ObjectZodConvertResult;

  function parseZodSchema(schema: unknown, isOptional = false): ZodConvertResult {
    switch (true) {
      case schema instanceof z4.ZodArray:
        return {
          innerType: parseZodSchema(schema.element),
          isOptional,
          typeName: 'ZodArray'
        };
      case schema instanceof z4.ZodObject:
        const dimensions: { [key: string]: ZodConvertResult } = {};
        Object.entries(schema.shape).forEach(([key, value]) => {
          dimensions[key] = parseZodSchema(value);
        });
        return {
          dimensions,
          isOptional,
          typeName: 'ZodObject'
        };
      case schema instanceof z4.ZodBoolean:
        return {
          isOptional,
          typeName: 'ZodBoolean'
        };
      case schema instanceof z4.ZodDate:
        return {
          isOptional,
          typeName: 'ZodDate'
        };
      case schema instanceof z4.ZodEnum:
        return {
          enumValues: schema.options.map(String),
          isOptional,
          typeName: 'ZodEnum'
        };
      case schema instanceof z4.ZodNumber:
        return {
          isOptional,
          typeName: 'ZodNumber'
        };
      case schema instanceof z4.ZodSet:
        return {
          isOptional,
          typeName: 'ZodSet'
        };
      case schema instanceof z4.ZodString:
        return {
          isOptional,
          typeName: 'ZodString'
        };
      case schema instanceof z4.ZodOptional:
        return parseZodSchema(schema.def.innerType, true);
      default:
        throw new UploadError({
          en: `Unsupported schema type: ${(schema as z4.ZodType)?.def?.type}`
        });
    }
  }
  function interpetZodConvertResult(convertResult: ZodConvertResult, entry: string) {
    if (entry === '' && convertResult.isOptional) {
      return { success: true, value: undefined };
    }
    switch (convertResult.typeName) {
      case 'ZodArray':
        try {
          const parsedRecords = extractRecordArrayEntry(entry).map((parsedRecord) => {
            return mapValues(parsedRecord, (entry): unknown =>
              interpetZodConvertResult(convertResult.innerType, entry)
            );
          });
          return {
            success: true,
            value: parsedRecords
          };
        } catch {
          return {
            message: {
              en: `failed to interpret record array entries`,
              fr: `échec de l'interprétation des entrées du tableau d'enregistrements`
            },
            success: false
          };
        }
      case 'ZodBoolean':
        if (entry.toLowerCase() === 'true') {
          return { success: true, value: true };
        } else if (entry.toLowerCase() === 'false') {
          return { success: true, value: false };
        }
        return {
          message: { en: `Undecipherable Boolean Type: '${entry}'`, fr: `Type booléen indéchiffrable : '${entry}'` },
          success: false
        };
      case 'ZodDate': {
        const date = new Date(entry);
        if (Number.isNaN(date.getTime())) {
          return {
            message: { en: `Failed to parse date: '${entry}'`, fr: `Échec de l'analyse de la date : '${entry}'` },
            success: false
          };
        }
        return { success: true, value: date };
      }
      case 'ZodEnum':
        return { success: true, value: entry };
      case 'ZodNumber':
        if (isNumberLike(entry)) {
          return { success: true, value: parseNumber(entry) };
        }
        return {
          message: { en: `Invalid number type: '${entry}'`, fr: `Type de nombre invalide : '${entry}'` },
          success: false
        };
      case 'ZodSet':
        try {
          const set = extractSetEntry(entry);
          if (set.size === 0) {
            return {
              message: { en: 'Empty set is not allowed', fr: "Un ensemble vide n'est pas autorisé" },
              success: false
            };
          }
          return { success: true, value: set };
        } catch {
          return {
            message: {
              en: 'Error occurred interpreting set entry',
              fr: "Une erreur s'est produite lors de l'interprétation de l'entrée de l'ensemble"
            },
            success: false
          };
        }
      case 'ZodString':
        return { success: true, value: entry };
      default:
        return {
          message: {
            en: `Invalid ZodType: ${convertResult.typeName}`,
            fr: `ZodType invalide : ${convertResult.typeName}`
          },
          success: false
        };
    }
  }

  export function createUploadTemplateCSV(
    instrumentSchema: z4.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ) {
    if (!(instrumentSchema instanceof z.ZodObject)) {
      throw new UploadError({
        en: 'Expected schema to be instance of ZodObject'
      });
    }

    const csvColumns = [...INTERNAL_HEADERS];
    const sampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];

    Object.entries(instrumentSchema.shape).forEach(([key, subschema]) => {
      csvColumns.push(key);
      sampleData.push(Zod3.generateSampleData(parseZodSchema(subschema)));
    });

    return {
      content: unparse([csvColumns, sampleData]),
      filename: getTemplateFilename(instrumentInternal)
    };
  }

  export async function processInstrumentCSV(
    input: File,
    instrument: AnyUnilingualFormInstrument
  ): Promise<UploadOperationResult<FormTypes.Data[]>> {
    if (!(instrument.validationSchema instanceof z.ZodObject)) {
      throw new UploadError({
        en: 'Expected schema to be instance of ZodObject'
      });
    }

    const instrumentSchema = instrument.validationSchema.extend({
      date: z4.coerce.date(),
      subjectID: z4.string().regex(SUBJECT_ID_REGEX)
    });

    const shape = instrumentSchema.shape as { [key: string]: z4.ZodType };

    return new Promise<UploadOperationResult<FormTypes.Data[]>>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const parseResultCsv = parse<string[]>(text, {
          header: false,
          skipEmptyLines: true
        });

        const [headers, ...dataLines] = parseResultCsv.data satisfies string[][] as [string[], ...string[][]];

        if (!dataLines?.[0]) {
          return resolve({
            message: {
              en: 'CSV does not contain any rows of data',
              fr: 'Le fichier CSV ne contient aucune ligne de données'
            },
            success: false
          });
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
              return resolve({
                message: {
                  en: `Schema value at column ${i} is not defined! Please check if Column has been edited/deleted from original template`,
                  fr: `La valeur du schéma à la colonne ${i} n'est pas définie ! Veuillez vérifier si la colonne a été modifiée/supprimée du modèle original`
                },
                success: false
              });
            }
            try {
              const result = interpetZodConvertResult(parseZodSchema(shape[key]), rawValue);
              jsonLine[headers[i]!] = result;
            } catch (error: unknown) {
              if (error instanceof UploadError) {
                return resolve({
                  message: {
                    en: `${error.description.en} at column name: '${key}' and row number '${rowNumber}'`,
                    fr: `${error.description.fr} au nom de colonne : '${key}' et numéro de ligne '${rowNumber}`
                  },
                  success: false
                });
              } else {
                return resolve({
                  message: {
                    en: `Error parsing CSV`,
                    fr: `Erreur avec la CSV`
                  },
                  success: false
                });
              }
            }
          }

          const zodCheck = instrumentSchema.safeParse(jsonLine);
          if (!zodCheck.success) {
            console.error(zodCheck.error.issues);
            const zodIssues = zodCheck.error.issues.map((issue) => {
              return `issue message: \n ${issue.message} \n path: ${issue.path.toString()}`;
            });
            console.error(`Failed to parse data: ${JSON.stringify(jsonLine)}`);
            return resolve({ message: { en: zodIssues.join(), fr: zodIssues.join() }, success: false });
          }
          result.push(zodCheck.data as FormTypes.Data);
          rowNumber++;
        }
        resolve({ success: true, value: result });
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

//new process instrument csv methods
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
    const { date: dataDate, subjectID: dataSubjectId, ...restOfData } = dataInfo; // Destructure and extract the rest of the data
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
