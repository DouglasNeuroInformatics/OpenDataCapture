import { describe, expect, it } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

// Importing the service registers the maps on this bundle's v3 and v4 instances, which are the
// same instances these 'zod/v3' and 'zod/v4' imports resolve to.
import '@/services/zod';

const REQUIRED_MESSAGE = 'This field is required';

const firstMessage = (result: { error?: { issues: { message: string }[] } }) => result.error?.issues[0]?.message;

describe('zod v3 error map', () => {
  it('should localize a missing field, so instrument forms report it as required', () => {
    expect(firstMessage(z3.object({ name: z3.string() }).safeParse({}))).toBe(REQUIRED_MESSAGE);
  });
  it('should localize an empty string bounded by min(1), which forms submit for untouched text fields', () => {
    expect(firstMessage(z3.string().min(1).safeParse(''))).toBe(REQUIRED_MESSAGE);
  });
  it('should leave other issues at their default message', () => {
    expect(firstMessage(z3.number().safeParse('x'))).not.toBe(REQUIRED_MESSAGE);
  });
});

describe('zod v4 error map', () => {
  it('should localize a missing field, so instrument forms report it as required', () => {
    expect(firstMessage(z4.object({ name: z4.string() }).safeParse({}))).toBe(REQUIRED_MESSAGE);
  });
  it('should localize an empty string bounded by min(1), which forms submit for untouched text fields', () => {
    expect(firstMessage(z4.string().min(1).safeParse(''))).toBe(REQUIRED_MESSAGE);
  });
  it('should leave other issues at their default message', () => {
    expect(firstMessage(z4.number().safeParse('x'))).not.toBe(REQUIRED_MESSAGE);
  });
});
