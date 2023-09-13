import { AjvFactory } from '@douglasneuroinformatics/ajv';
import Ajv from 'ajv';

// Their imports are wrong - see comment in our ajv repo
const ajv = AjvFactory.create() as Ajv;

export { ajv };
