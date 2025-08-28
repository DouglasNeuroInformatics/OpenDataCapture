import { isObjectLike, isZodType } from '@douglasneuroinformatics/libjs';
import type { Language } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument, FormTypes } from '@opendatacapture/runtime-core';
import { unparse } from 'papaparse';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

const INTERNAL_HEADERS = ['subjectID', 'date'];

const MONGOLIAN_VOWEL_SEPARATOR = String.fromCharCode(32, 6158);

const INTERNAL_HEADERS_SAMPLE_DATA = [MONGOLIAN_VOWEL_SEPARATOR + 'string', MONGOLIAN_VOWEL_SEPARATOR + 'yyyy-mm-dd'];

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

type CSVUploadTemplate = {
  content: string;
  filename: string;
};

class Zod3TypeGuards {
  static isZodEffectsObject(value: unknown): value is z3.ZodEffects<z3.AnyZodObject> {
    return this.isZodEffects(value) && this.isZodObject(value.innerType());
  }
  static isZodObject(value: unknown): value is z3.AnyZodObject {
    return isObjectLike(value) && value.constructor.name === 'ZodObject';
  }
  private static isZodEffects(value: unknown): value is z3.ZodEffects<z3.ZodType> {
    return isObjectLike(value) && value.constructor.name === 'ZodEffects';
  }
}

class CSVUploadTemplateBuilder {
  static build(instrument: AnyUnilingualFormInstrument): CSVUploadTemplate {
    const instrumentSchema = instrument.validationSchema;
    if (isZodType(instrumentSchema, { version: 4 })) {
      return this.forZod4(instrumentSchema, instrument.internal);
    }
    return this.forZod3(instrumentSchema, instrument.internal);
  }

  private static forZod3(
    instrumentSchema: z3.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ): CSVUploadTemplate {
    if (!(Zod3TypeGuards.isZodObject(instrumentSchema) || Zod3TypeGuards.isZodEffectsObject(instrumentSchema))) {
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
      const typeNameResult = getZodTypeName(shape[col]);
      if (!typeNameResult.success) {
        throw new Error(`${typeNameResult.message.en} / ${typeNameResult.message.fr}`);
      }
      sampleData.push(generateSampleData(typeNameResult));
    }

    unparse([csvColumns, sampleData]);

    return {
      content: unparse([csvColumns, sampleData]),
      filename: this.getFilename(instrumentInternal)
    };
  }

  private static forZod4(
    instrumentSchema: z4.ZodType<FormTypes.Data>,
    instrumentInternal: AnyUnilingualFormInstrument['internal']
  ): CSVUploadTemplate {
    const jsonInstrumentSchema = z4.toJSONSchema(instrumentSchema) as z4.core.JSONSchema.Schema;
    if (jsonInstrumentSchema.type !== 'object') {
      throw new UploadError({
        en: `Expected form validation schema to be of type object, got ${jsonInstrumentSchema.type}`
      });
    }
    const zod4TemplateData = ''; // zod4Helper(jsonInstrumentSchema);
    return {
      content: zod4TemplateData,
      filename: this.getFilename(instrumentInternal)
    };
  }

  private static getFilename(instrumentInternal: AnyUnilingualFormInstrument['internal']) {
    return `${instrumentInternal.name}_${instrumentInternal.edition}_template.csv`;
  }
}
