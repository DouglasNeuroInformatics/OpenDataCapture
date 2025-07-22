import type { AppAbility } from '@douglasneuroinformatics/libnest';

export type EntityOperationOptions = {
  ability?: AppAbility;
};

//This indentity type is used as a quick fix to resolve the swc compiling issue with fowardRef nestjs services
export type Identity<T> = T;
