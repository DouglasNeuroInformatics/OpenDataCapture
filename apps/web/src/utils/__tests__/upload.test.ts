import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { unparse } from 'papaparse';
import { describe, expect, it } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

import { Zod3, Zod4 } from '../upload';

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
        multiKeys: ['name', 'age'],
        typeName: 'ZodArray'
      });
      expect(result.multiValues).toHaveLength(2);
      expect(result.multiValues?.[0]).toMatchObject({ typeName: 'ZodString' });
      expect(result.multiValues?.[1]).toMatchObject({ typeName: 'ZodNumber' });
    });

    it('should parse set type', () => {
      const result = Zod3.getZodTypeName(z3.set(z3.enum(['a', 'b', 'c'])));
      expect(result).toMatchObject({
        enumValues: ['a', 'b', 'c'],
        isOptional: false,
        typeName: 'ZodSet'
      });
    });
  });

  describe('processInstrumentCSV', () => {
    const mockInstrument = {
      validationSchema: z3.object({
        notes: z3.string(),
        score: z3.number()
      })
    } as unknown as AnyUnilingualFormInstrument;

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

      await expect(Zod3.processInstrumentCSV(file, mockInstrument)).rejects.toThrow();
    });

    it('should handle optional fields', async () => {
      const instrumentWithOptional = {
        validationSchema: z3.object({
          optional: z3.string().optional(),
          required: z3.string()
        })
      } as unknown as AnyUnilingualFormInstrument;

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

    it('should process boolean values', async () => {
      const instrumentWithBoolean = {
        validationSchema: z3.object({
          completed: z3.boolean()
        })
      } as unknown as AnyUnilingualFormInstrument;

      const csvContent = unparse([
        ['subjectID', 'date', 'completed'],
        ['subject1', '2024-01-01', 'true']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod3.processInstrumentCSV(file, instrumentWithBoolean);

      expect(result).toHaveLength(1);
      expect(result[0]?.completed).toBe(true);
    });

    it('should process set values', async () => {
      const instrumentWithSet = {
        validationSchema: z3.object({
          tags: z3.set(z3.enum(['tag1', 'tag2', 'tag3']))
        })
      } as unknown as AnyUnilingualFormInstrument;

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
  });

  describe('processInstrumentCSV', () => {
    const mockInstrument = {
      validationSchema: z4.object({
        feedback: z4.string(),
        score: z4.number()
      })
    } as unknown as AnyUnilingualFormInstrument;

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

    it('should reject CSV with invalid schema', async () => {
      const csvContent = unparse([
        ['subjectID', 'date', 'score', 'feedback'],
        ['subject1', '2024-01-15', 'invalid_number', 'text']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      await expect(Zod4.processInstrumentCSV(file, mockInstrument)).rejects.toThrow();
    });

    it('should handle dates correctly', async () => {
      const instrumentWithDate = {
        validationSchema: z4.object({
          eventDate: z4.date()
        })
      } as unknown as AnyUnilingualFormInstrument;

      const csvContent = unparse([
        ['subjectID', 'date', 'eventDate'],
        ['subject1', '2024-01-01', '2024-06-15']
      ]);
      const file = new File([csvContent], 'data.csv', { type: 'text/csv' });

      const result = await Zod4.processInstrumentCSV(file, instrumentWithDate);

      expect(result).toHaveLength(1);
      expect(result[0]?.eventDate).toBeInstanceOf(Date);
    });

    it('should process enum values', async () => {
      const instrumentWithEnum = {
        validationSchema: z4.object({
          status: z4.enum(['pending', 'active', 'completed'])
        })
      } as unknown as AnyUnilingualFormInstrument;

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
      const instrumentWithArray = {
        validationSchema: z4.object({
          items: z4.array(
            z4.object({
              name: z4.string(),
              quantity: z4.number()
            })
          )
        })
      } as unknown as AnyUnilingualFormInstrument;

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
  });
});
