/* eslint-disable @typescript-eslint/no-namespace */
import { isObjectLike, isPlainObject, isZodType } from '@douglasneuroinformatics/libjs';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { unparse } from 'papaparse';
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

  type RequiredZodTypeName = Exclude<ZodTypeName, 'ZodEffects' | 'ZodOptional'>;

  type AnyZodTypeDef = z3.ZodTypeDef & { typeName: ZodTypeName };

  type ZodObjectArrayDef = z3.ZodArrayDef & { type: z3.AnyZodObject };

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

  function interpetZodArray(..._args: any[]) {
    return null as unknown;
  }

  function getZodTypeName(schema: z3.ZodTypeAny, isOptional?: boolean): unknown {
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
        success: true,
        typeName: def.typeName
      };
    } else if (isZodObjectArrayDef(def)) {
      return interpetZodArray(schema, def.typeName, isOptional);
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
}

namespace Zod4 {
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
    const zod4TemplateData = ''; // zod4Helper(jsonInstrumentSchema);
    return {
      content: zod4TemplateData,
      filename: getTemplateFilename(instrumentInternal)
    };
  }
}

export function createUploadTemplateCSV(instrument: AnyUnilingualFormInstrument) {
  const instrumentSchema = instrument.validationSchema;
  if (isZodType(instrumentSchema, { version: 4 })) {
    return Zod4.createUploadTemplateCSV(instrumentSchema, instrument.internal);
  }
  return Zod3.createUploadTemplateCSV(instrumentSchema, instrument.internal);
}
