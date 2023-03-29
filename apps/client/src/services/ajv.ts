import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  strict: true
});

addFormats(ajv);

export { ajv };
