import pino from 'pino';

export const logger = pino(
  {},
  {
    write: (message) => {
      process.stdout.write(JSON.stringify(JSON.parse(message), null, 2) + '\n');
    }
  }
);
