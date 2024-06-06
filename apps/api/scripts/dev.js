import nodemon from 'nodemon';

import { clean, outfile, watch } from './build.js';

await clean();
await watch();
nodemon({
  script: outfile
});
