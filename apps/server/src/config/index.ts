import process from 'process';

import dotenv from 'dotenv';
import { StringUtils } from 'utils';

import { MissingEnvironmentVariableError, InvalidEnvironmentVariableError } from '../exceptions';

dotenv.config();

/**
 * The config class is used to get environment variables, checking that they
 * exist and are in the correct format, and casting them to the correct type.
 */

// Find way to merge with attribute
type Environment = 'demo' | 'development' | 'test';

class Config {
  private environments = ['demo', 'development', 'test'];

  private getEnvironmentVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new MissingEnvironmentVariableError(key);
    }
    return value;
  }

  private getIntegerEnvironmentVariable(key: string): number {
    const value = this.getEnvironmentVariable(key);
    if (!StringUtils.isInt(value)) {
      throw new InvalidEnvironmentVariableError(key, value);
    }
    return parseInt(value);
  }

  get env(): Environment {
    const env = this.getEnvironmentVariable('NODE_ENV');
    if (this.environments.includes(env)) {
      return env as Environment;
    }
    throw new InvalidEnvironmentVariableError('NODE_ENV', env);
  }

  get mongoUri(): string {
    return `${this.getEnvironmentVariable('MONGO_URI')}/${this.env}`;
  }

  get port(): number {
    return this.getIntegerEnvironmentVariable('SERVER_PORT');
  }
}

const config = new Config();

export default config;
