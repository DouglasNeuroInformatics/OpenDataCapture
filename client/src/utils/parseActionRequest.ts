import { z } from 'zod';

type ActionData<T> = T | null;

type ActionError<T> = z.typeToFlattenedError<T> | null;

interface ParsedActionRequest<T> {
  data: ActionData<T>;
  error: ActionError<T>;
}

const parseActionRequest = async <T>(request: Request, schema: z.ZodType<T>): Promise<ParsedActionRequest<T>> => {
  let data: ActionData<T> = null;
  let error: ActionError<T> = null;

  try {
    data = await schema.parseAsync(Object.fromEntries(await request.formData()));
  } catch (e) {
    if (e instanceof z.ZodError) {
      error = e.flatten();
    } else {
      console.error(e);
      throw new Error('An unexpected error occurred');
    }
  }

  return { data, error };
};

export { parseActionRequest as default, type ParsedActionRequest };
