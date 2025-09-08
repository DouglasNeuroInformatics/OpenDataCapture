/* eslint-disable @typescript-eslint/no-namespace */
import { isObjectLike, isPlainObject, isZodType } from '@douglasneuroinformatics/libjs';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { parse, unparse } from 'papaparse';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

const INTERNAL_HEADERS = ['subjectID', 'date'];

const MONGOLIAN_VOWEL_SEPARATOR = String.fromCharCode(32, 6158);

const INTERNAL_HEADERS_SAMPLE_DATA = [MONGOLIAN_VOWEL_SEPARATOR + 'string', MONGOLIAN_VOWEL_SEPARATOR + 'yyyy-mm-dd'];

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

  title = {
    en: `Error Occurred Downloading Sample Template`,
    fr: `Un occurence d'un erreur quand le csv est telecharger`
  };

  constructor(description: { [L in Language]?: string }) {
    super();
    this.description = description;
  }
}

function getTemplateFilename(instrumentInternal: AnyUnilingualFormInstrument['internal']) {
  return `${instrumentInternal.name}_${instrumentInternal.edition}_template.csv`;
}

namespace Zod3 {
  type ZodTypeName = Extract<`${z3.ZodFirstPartyTypeKind}`, (typeof ZOD_TYPE_NAMES)[number]>;

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

  function isZodTypeDef(value: unknown): value is AnyZodTypeDef {
    return isPlainObject(value) && ZOD_TYPE_NAMES.includes(value.typeName as ZodTypeName);
  }

  function isZodOptionalDef(def: AnyZodTypeDef): def is z3.ZodOptionalDef<z3.ZodTypeAny> {
    return def.typeName === z3.ZodFirstPartyTypeKind.ZodOptional;
  }

  function isZodEnumDef(def: AnyZodTypeDef): def is z3.ZodEnumDef {
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

  function interpretZodArray(def: ZodObjectArrayDef, isOptional?: boolean): ZodTypeNameResult {
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

  function getZodTypeName(schema: z3.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
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

  function formatTypeInfo(s: string, isOptional: boolean) {
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
        return formatTypeInfo('true/false', isOptional);
      case 'ZodDate':
        return formatTypeInfo('yyyy-mm-dd', isOptional);
      case 'ZodNumber':
        return formatTypeInfo('number', isOptional);
      case 'ZodSet':
        try {
          if (enumValues) {
            return formatTypeInfo(`SET(${enumValues.join('/')}, ...)`, isOptional);
          }
          return formatTypeInfo('SET(a,b,c)', isOptional);
        } catch {
          throw new UploadError({
            en: `Failed to generate sample data for ZodSet`,
            fr: `Échec de la génération de données d'exemple pour ZodSet`
          });
        }
      case 'ZodString':
        return formatTypeInfo('string', isOptional);
      case 'ZodEnum':
        try {
          let possibleEnumOutputs = '';
          for (const val of enumValues!) {
            possibleEnumOutputs += val + '/';
          }
          possibleEnumOutputs = possibleEnumOutputs.slice(0, -1);
          return formatTypeInfo(possibleEnumOutputs, isOptional);
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
          if (multiValues && multiKeys) {
            for (let i = 0; i < multiValues.length; i++) {
              const inputData = multiValues[i]!;
              // eslint-disable-next-line max-depth
              if (i === multiValues.length - 1 && multiValues[i] !== undefined) {
                multiString += multiKeys[i] + ':' + generateSampleData(inputData);
              } else {
                multiString += multiKeys[i] + ':' + generateSampleData(inputData) + ',';
              }
            }
            multiString += ';)';
          }
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

    unparse([csvColumns, sampleData]);

    return {
      content: unparse([csvColumns, sampleData]),
      filename: getTemplateFilename(instrumentInternal)
    };
  }

  //new processInstrumentCSV code
  export function processInstrumentCSV(input: File, instrument: AnyUnilingualFormInstrument) {
    const instrumentSchema = instrument.validationSchema as z3.AnyZodObject;
    let shape: { [key: string]: z3.ZodTypeAny } = {};

    let instrumentSchemaWithInternal: z3.AnyZodObject;
    const instrumentSchemaDef: unknown = instrumentSchema._def;
    if (isZodTypeDef(instrumentSchemaDef) && isZodEffectsDef(instrumentSchemaDef)) {
      if (!isZodObject(instrumentSchemaDef.schema)) {
        return { message: { en: 'Invalid instrument schema', fr: "Schéma d'instrument invalide" }, success: false };
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

        //remove sample data if included
        if (dataLines[0]?.[0]?.startsWith(MONGOLIAN_VOWEL_SEPARATOR)) {
          dataLines.shift();
        }

        if (dataLines.length === 0) {
          return resolve({
            message: { en: 'data lines is empty array', fr: 'les lignes de données sont un tableau vide' },
            success: false
          });
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
              if (!interpreterResult.success) {
                return resolve({
                  message: {
                    en: `${interpreterResult.message.en} at column name: '${key}' and row number ${rowNumber}`,
                    fr: `${interpreterResult.message.fr} au nom de colonne : '${key}' et numéro de ligne ${rowNumber}`
                  },
                  success: false
                });
              }
              jsonLine[headers[j]!] = interpreterResult.value;
            } catch (error: unknown) {
              if (error instanceof UploadError) {
                return resolve({
                  message: {
                    en: `${error.description.en} at column name: '${key}' and row number`,
                    fr: `${error.description.fr} au nom de colonne : '${key}'`
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
}

namespace Zod4 {
  function jsonToZod(givenType: unknown): Zod3.RequiredZodTypeName {
    if (typeof givenType === 'string') {
      switch (givenType) {
        case 'array':
          return 'ZodArray';
        case 'boolean':
          return 'ZodBoolean';
        case 'date':
          return 'ZodDate';
        case 'enum':
          return 'ZodEnum';
        case 'number':
          return 'ZodNumber';
        case 'set':
          return 'ZodSet';
        case 'string':
          return 'ZodString';
        default:
      }
    }
    throw new Error("Failed to interpret json value / Échec de l'interprétation de la valeur json");
  }

  function parseJSONSchema(jsonInstrumentSchema: z4.core.JSONSchema.ObjectSchema) {
    // TODO - these could actually not exist
    // prettier-ignore
    if (!(jsonInstrumentSchema.properties)) {
       throw new UploadError({
        en: "Failed to interpret JSON schema",
        fr: "Échec de l'interprétation du schéma JSON"
       });
    }

    const jsonColumnNames = Object.keys(jsonInstrumentSchema.properties);

    const jsonCSVColumns = INTERNAL_HEADERS.concat(jsonColumnNames);
    const jsonSampleData = [...INTERNAL_HEADERS_SAMPLE_DATA];

    for (const col of jsonColumnNames) {
      let optional = true;

      if (
        jsonInstrumentSchema.required &&
        Array.isArray(jsonInstrumentSchema.required) &&
        jsonInstrumentSchema.required.includes(col)
      ) {
        optional = false;
      }

      let data: Zod3.ZodTypeNameResult;
      const propertySchema = jsonInstrumentSchema.properties[col] as z4.core.JSONSchema.Schema;

      if (propertySchema.type === 'array') {
        if (!propertySchema.items) {
          throw new UploadError({
            en: "Property 'items' must be defined for array schema"
          });
        } else if (Array.isArray(propertySchema.items)) {
          throw new UploadError({
            en: "Property 'items' must not be array: only JSON schema 2020 or later is supported"
          });
        }
        const itemsSchema = propertySchema.items as z4.core.JSONSchema.ObjectSchema;
        const keys = Object.keys(itemsSchema.properties!);
        const values = Object.values(itemsSchema.properties!);
        const multiVals: Zod3.ZodTypeNameResult[] = [];

        let i = 0;

        for (const val of values) {
          if (val.type && keys[i]) {
            // optional is false if the key is included in the required items

            if (itemsSchema && Array.isArray(itemsSchema.required)) {
              multiVals.push({
                isOptional: !itemsSchema.required.includes(keys[i]!),
                typeName: jsonToZod(val.type)
              });
            } else {
              multiVals.push({
                isOptional: false,
                typeName: jsonToZod(val.type)
              });
            }

            i++;
          }
        }
        data = {
          isOptional: optional,
          multiKeys: keys,
          multiValues: multiVals,
          typeName: 'ZodObject'
        };
      } else if (propertySchema.enum) {
        data = {
          enumValues: propertySchema.enum as readonly string[],
          isOptional: optional,
          typeName: 'ZodEnum'
        };
      } else if (jsonToZod(propertySchema.type)) {
        data = {
          isOptional: optional,
          typeName: jsonToZod(propertySchema.type)
        };
      } else {
        throw new UploadError({
          en: 'Failed to interpret JSON value from schema',
          fr: "Échec de l'interprétation de la valeur JSON du schéma"
        });
      }
      jsonSampleData.push(Zod3.generateSampleData(data));
    }

    const zod4TemplateData = unparse([jsonCSVColumns, jsonSampleData]);

    return zod4TemplateData;
  }

  export function createUploadTemplateCSV(
    instrumentSchema: z4.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ) {
    const jsonInstrumentSchema = z4.toJSONSchema(instrumentSchema) as z4.core.JSONSchema.Schema;
    if (jsonInstrumentSchema.type !== 'object') {
      throw new UploadError({
        en: `Expected form validation schema to be of type object, got ${jsonInstrumentSchema.type}`
      });
    }

    return {
      content: parseJSONSchema(jsonInstrumentSchema),
      filename: getTemplateFilename(instrumentInternal)
    };
  }
  //to be filled
  export function processInstrumentCSV(input: File, instrument: AnyUnilingualFormInstrument) {
    return undefined;
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
  if (isZodType(instrument, { version: 4 })) {
    return Zod4.processInstrumentCSV(input, instrument);
  }
  return Zod3.processInstrumentCSV(input, instrument);
}
