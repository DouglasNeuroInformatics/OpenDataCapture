import { isNumberLike, isObjectLike, isPlainObject, isZodType, parseNumber } from '@douglasneuroinformatics/libjs';
import type { AnyUnilingualFormInstrument, FormTypes, Json } from '@opendatacapture/runtime-core';
import type { Group } from '@opendatacapture/schemas/group';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import type { UploadInstrumentRecordsData } from '@opendatacapture/schemas/instrument-records';
import { encodeScopedSubjectId } from '@opendatacapture/subject-utils';
import { parse, unparse } from 'papaparse';
import { z } from 'zod';
import { z as z4 } from 'zod/v4';

// TODO - refine ZodTypeNameResult to reflect specific ZodType variants (i.e., object)

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

const INTERNAL_HEADERS = ['subjectID', 'date'];

const MONGOLIAN_VOWEL_SEPARATOR = String.fromCharCode(32, 6158);

const INTERNAL_HEADERS_SAMPLE_DATA = [MONGOLIAN_VOWEL_SEPARATOR + 'string', MONGOLIAN_VOWEL_SEPARATOR + 'yyyy-mm-dd'];

const SUBJECT_ID_REGEX = /^[^$\s]+$/;

type ZodTypeName = Extract<`${z.ZodFirstPartyTypeKind}`, (typeof ZOD_TYPE_NAMES)[number]>;

type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodEffects' | 'ZodOptional'>;

type ZodTypeNameResult =
  | {
      enumValues?: readonly string[];
      isOptional: boolean;
      multiKeys?: string[];
      multiValues?: ZodTypeNameResult[];
      success: true;
      typeName: RequiredZodTypeName;
    }
  | {
      message: { en: string; fr: string };
      success: false;
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

type PropertySchema = {
  items?: {
    properties?: { [key: string]: unknown };
  };
  type: string;
};

type AnyZodTypeDef = z.ZodTypeDef & { typeName: ZodTypeName };

type AnyZodArrayDef = z.ZodArrayDef & { type: z.AnyZodObject };

type Zod4Object = {
  element?: ElementShape;
  entries?: unknown;
  innerType?: z4.ZodType<unknown, unknown> | z.ZodTypeAny;
  type: string;
  values?: string[];
  valueType: Zod4ValueType;
};

type Zod4ValueType = {
  _def: unknown;
};

type ElementShape = {
  [key: string]: z.ZodTypeAny;
};

//check for edge cases since the were using reversed hierachical logic (if object has a _def that AnyZodTypeDef then object is AnyZodObject)
function isZodObject(value: unknown): value is z.AnyZodObject {
  return isObjectLike(value) && isZodTypeDef((value as { [key: string]: unknown })._def);
}

function isZodTypeDef(value: unknown): value is AnyZodTypeDef {
  return isPlainObject(value) && ZOD_TYPE_NAMES.includes(value.typeName as ZodTypeName);
}

function isZodOptionalDef(def: AnyZodTypeDef): def is z.ZodOptionalDef<z.ZodTypeAny> {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodOptional;
}

function isZodEnumDef(def: AnyZodTypeDef): def is z.ZodEnumDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodEnum;
}

function isZodSetDef(def: AnyZodTypeDef): def is z.ZodSetDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodSet;
}

function isZodArrayDef(def: AnyZodTypeDef): def is AnyZodArrayDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodArray;
}

function isZodEffectsDef(def: AnyZodTypeDef): def is z.ZodEffectsDef {
  return def.typeName === z.ZodFirstPartyTypeKind.ZodEffects;
}

function extractSetEntry(entry: string) {
  const result = /SET\(\s*(.*?)\s*\)/.exec(entry);
  if (!result?.[1]) {
    throw new Error(
      `Failed to extract set value from entry: '${entry}' / Échec de l'extraction de la valeur de l'ensemble de l'entrée : '${entry}'`
    );
  }
  return result[1];
}

function extractRecordArrayEntry(entry: string) {
  const result = /RECORD_ARRAY\(\s*(.*?)[\s;]*\)/.exec(entry);
  if (!result?.[1]) {
    throw new Error(
      `Failed to extract record array value from entry: '${entry}' / Échec de l'extraction de la valeur du tableau d'enregistrements de l'entrée : '${entry}'`
    );
  }
  return result[1];
}

function reformatInstrumentData({
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

function getZodTypeName(schema: z4.ZodType<unknown, unknown> | z.ZodTypeAny, isOptional?: boolean): ZodTypeNameResult {
  const def: unknown = schema._def;
  if (isZodType(schema, { version: 4 })) {
    const getZod4TypeNameResult = getZod4TypeName(def, schema, isOptional);
    return getZod4TypeNameResult;
  }
  if (isZodTypeDef(def)) {
    if (isZodOptionalDef(def)) {
      return getZodTypeName(def.innerType, true);
    } else if (isZodEnumDef(def)) {
      return {
        enumValues: def.values,
        isOptional: Boolean(isOptional),
        success: true,
        typeName: def.typeName
      };
    } else if (isZodArrayDef(def)) {
      return interpretZodArray(schema, def.typeName, isOptional);
    } else if (isZodSetDef(def)) {
      const innerDef: unknown = def.valueType._def;

      if (!isZodTypeDef(innerDef)) {
        return {
          message: {
            en: 'Invalid inner type: ZodSet value type must have a valid type definition',
            fr: 'Type interne invalide : le type de valeur ZodSet doit avoir une définition de type valide'
          },
          success: false
        };
      }

      if (isZodEnumDef(innerDef)) {
        return {
          enumValues: innerDef.values,
          isOptional: Boolean(isOptional),
          success: true,
          typeName: def.typeName
        };
      }
    }

    return {
      isOptional: Boolean(isOptional),
      success: true,
      typeName: def.typeName satisfies ZodTypeName as RequiredZodTypeName
    };
  }
  console.error(`Cannot parse ZodType from schema: ${JSON.stringify(schema)}`);
  return { message: { en: 'Unexpected Error', fr: 'Erreur inattendue' }, success: false };
}

function getZod4TypeName(
  defUnkown: unknown,
  schema: z4.ZodType<unknown, unknown> | z.ZodTypeAny,
  isOptional?: boolean
): ZodTypeNameResult {
  if (!defUnkown) {
    return {
      message: { en: 'Invalid Zod v4 definition structure', fr: 'Structure de définition Zod v4 invalide' },
      success: false
    };
  }

  const def = defUnkown as Zod4Object;

  if (!def.type) {
    return {
      message: { en: 'Invalid Zod v4 definition structure', fr: 'Structure de définition Zod v4 invalide' },
      success: false
    };
  }
  if (!isObjectLike(def) || typeof def.type !== 'string') {
    return {
      message: { en: 'Invalid Zod v4 definition structure', fr: 'Structure de définition Zod v4 invalide' },
      success: false
    };
  }
  if (def.type === 'optional' && def.innerType) {
    return getZodTypeName(def.innerType, true);
  } else if (def.type === 'enum') {
    if (def.entries) {
      const entries = Object.keys(def.entries as object);

      return {
        enumValues: entries,
        isOptional: Boolean(isOptional),
        success: true,
        typeName: jsonToZod(def.type)
      };
    }
    return {
      enumValues: def.values,
      isOptional: Boolean(isOptional),
      success: true,
      typeName: jsonToZod(def.type)
    };
  } else if (def.type === 'array') {
    const arrayName = jsonToZod(def.type) as z.ZodFirstPartyTypeKind.ZodArray;

    return interpretZodArray(schema as z.ZodTypeAny, arrayName, isOptional);
  } else if (def.type === 'set') {
    const innerDef: unknown = def.valueType._def;

    if (!isZodTypeDef(innerDef)) {
      return {
        message: {
          en: 'Invalid inner type: ZodSet value type must have a valid type definition',
          fr: 'Type interne invalide : le type de valeur ZodSet doit avoir une définition de type valide'
        },
        success: false
      };
    }

    if (isZodEnumDef(innerDef)) {
      return {
        enumValues: innerDef.values,
        isOptional: Boolean(isOptional),
        success: true,
        typeName: jsonToZod(def.type)
      };
    }
  }

  return {
    isOptional: Boolean(isOptional),
    success: true,
    typeName: jsonToZod(def.type)
  };
}

function interpretZodArray(
  schema: z.ZodTypeAny,
  originalName: z.ZodFirstPartyTypeKind.ZodArray,
  isOptional?: boolean
): ZodTypeNameResult {
  const def: unknown = schema._def;
  const listOfZodElements: ZodTypeNameResult[] = [];
  const listOfZodKeys: string[] = [];

  if (isZodType(schema, { version: 4 })) {
    const Zod4ArrayResult = interpretZod4Array(def, originalName, isOptional);
    return Zod4ArrayResult;
  }

  if (!isZodTypeDef(def)) {
    throw new Error(
      `Unexpected value for _def in schema: ${JSON.stringify(def)} / Valeur inattendue pour _def dans le schéma : ${JSON.stringify(def)}`
    );
  } else if (!isZodArrayDef(def)) {
    throw new Error(
      `Unexpected value '${def.typeName}' for property _def.typeName in schema: must be '${z.ZodFirstPartyTypeKind.ZodArray}' / Valeur inattendue '${def.typeName}' pour la propriété _def.typeName dans le schéma : doit être '${z.ZodFirstPartyTypeKind.ZodArray}'`
    );
  }

  const shape = def.type.shape as { [key: string]: z.ZodTypeAny };

  for (const [key, insideType] of Object.entries(shape)) {
    const def: unknown = insideType._def;
    if (isZodTypeDef(def)) {
      const innerTypeName = getZodTypeName(insideType);
      listOfZodElements.push(innerTypeName);
      listOfZodKeys.push(key);
    } else {
      console.error({ def });
      throw new Error(`Unhandled case! / Cas non géré !`);
    }
  }

  if (listOfZodElements.length === 0) {
    return {
      message: {
        en: 'Failure to interpret Zod Object or Array',
        fr: "Échec de l'interprétation de l'objet ou du tableau Zod"
      },
      success: false
    };
  }

  return {
    isOptional: Boolean(isOptional),
    multiKeys: listOfZodKeys,
    multiValues: listOfZodElements,
    success: true,
    typeName: originalName
  };
}

function interpretZod4Array(
  def: unknown,
  originalName: z.ZodFirstPartyTypeKind.ZodArray,
  isOptional?: boolean
): ZodTypeNameResult {
  const listOfZodElements: ZodTypeNameResult[] = [];
  const listOfZodKeys: string[] = [];
  const castedDef = def as Zod4Object;
  if (!castedDef.element) {
    return {
      message: {
        en: 'Failure to interpret Zod Object or Array',
        fr: "Échec de l'interprétation de l'objet ou du tableau Zod"
      },
      success: false
    };
  }
  const shape = castedDef.element.shape;

  if (!shape || shape === undefined) {
    return {
      message: {
        en: 'Failure to interpret Zod Object or Array',
        fr: "Échec de l'interprétation de l'objet ou du tableau Zod"
      },
      success: false
    };
  }

  for (const [key, insideType] of Object.entries(shape)) {
    const def: unknown = insideType._def;
    if (def.type) {
      const innerTypeName = getZodTypeName(insideType as z.ZodTypeAny);
      listOfZodElements.push(innerTypeName);
      listOfZodKeys.push(key);
    } else {
      console.error({ def });
      throw new Error(`Unhandled case! / Cas non géré !`);
    }
  }

  if (listOfZodElements.length === 0) {
    return {
      message: {
        en: 'Failure to interpret Zod Object or Array',
        fr: "Échec de l'interprétation de l'objet ou du tableau Zod"
      },
      success: false
    };
  }

  return {
    isOptional: Boolean(isOptional),
    multiKeys: listOfZodKeys,
    multiValues: listOfZodElements,
    success: true,
    typeName: originalName
  };
}

function interpretZodValue(
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
        message: { en: `Invalid ZodType: ${zType satisfies never}`, fr: `ZodType invalide : ${zType satisfies never}` },
        success: false
      };
  }
}

function interpretZodObjectValue(
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
        if (!(zListResult.success && zListResult.typeName !== 'ZodArray' && zListResult.typeName !== 'ZodObject')) {
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

function jsonToZod(givenType: unknown): RequiredZodTypeName {
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

export async function processInstrumentCSV(
  input: File,
  instrument: AnyUnilingualFormInstrument
): Promise<UploadOperationResult<FormTypes.Data[]>> {
  const instrumentSchema = instrument.validationSchema as z.AnyZodObject;
  let shape: { [key: string]: z.ZodTypeAny } = {};

  let instrumentSchemaWithInternal: z.AnyZodObject;

  const instrumentSchemaDef: unknown = instrumentSchema._def;

  if (isZodTypeDef(instrumentSchemaDef) && isZodEffectsDef(instrumentSchemaDef)) {
    if (!isZodObject(instrumentSchemaDef.schema)) {
      return { message: { en: 'Invalid instrument schema', fr: "Schéma d'instrument invalide" }, success: false };
    }
    instrumentSchemaWithInternal = instrumentSchemaDef.schema.extend({
      date: z.coerce.date(),
      subjectID: z.string().regex(SUBJECT_ID_REGEX)
    });
    shape = (instrumentSchemaWithInternal._def as z.ZodObjectDef).shape() as { [key: string]: z.ZodTypeAny };
  } else {
    if (isZodType(instrumentSchema, { version: 4 })) {
      const result = processInstrumentCSVZod4(input, instrument);
      return result;
    } else {
      instrumentSchemaWithInternal = instrumentSchema.extend({
        date: z.coerce.date(),
        subjectID: z.string().regex(SUBJECT_ID_REGEX)
      });
      shape = instrumentSchemaWithInternal.shape as { [key: string]: z.ZodTypeAny };
    }
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
          const typeNameResult = getZodTypeName(shape[key]);

          if (!typeNameResult.success) {
            return resolve({ message: typeNameResult.message, success: false });
          }

          let interpreterResult: UploadOperationResult<FormTypes.FieldValue> = {
            message: { en: 'Could not interpret a correct value', fr: "Impossible d'interpréter une valeur correcte" },
            success: false
          };

          if (typeNameResult.typeName === 'ZodArray' || typeNameResult.typeName === 'ZodObject') {
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

export async function processInstrumentCSVZod4(
  input: File,
  instrument: AnyUnilingualFormInstrument
): Promise<UploadOperationResult<FormTypes.Data[]>> {
  const instrumentSchema = instrument.validationSchema as z4.ZodObject;
  let shape: { [key: string]: z4.ZodTypeAny } = {};
  let instrumentSchemaWithInternal: z4.ZodObject;

  const instrumentSchemaDef: unknown = instrumentSchema.def;

  if (isZodTypeDef(instrumentSchemaDef) && isZodEffectsDef(instrumentSchemaDef)) {
    return {
      message: { en: 'Wrong schema', fr: 'Mauvais schéma' },
      success: false
    };
  } else {
    if (instrumentSchema instanceof z4.ZodObject) {
      instrumentSchemaWithInternal = instrumentSchema.extend({
        date: z4.coerce.date(),
        subjectID: z4.string().regex(SUBJECT_ID_REGEX)
      });
      shape = instrumentSchemaWithInternal.shape;
    }
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
          const typeNameResult = getZodTypeName(shape[key]);
          if (!typeNameResult.success) {
            return resolve({ message: typeNameResult.message, success: false });
          }

          let interpreterResult: UploadOperationResult<FormTypes.FieldValue> = {
            message: { en: 'Could not interpret a correct value', fr: "Impossible d'interpréter une valeur correcte" },
            success: false
          };

          if (typeNameResult.typeName === 'ZodArray' || typeNameResult.typeName === 'ZodObject') {
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
        result.push(zodCheck.data as FormTypes.Data);
        rowNumber++;
      }
      resolve({ success: true, value: result });
    };
    reader.readAsText(input);
  });
}

export { getZodTypeName, interpretZodArray, reformatInstrumentData };
