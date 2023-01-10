import { z } from 'zod';

function makeSchemaOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}

const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const foo = makeSchemaOptional(loginRequestSchema);

type LoginRequestSchema = z.infer<typeof loginRequestSchema>;

export { loginRequestSchema as default, type LoginRequestSchema };
