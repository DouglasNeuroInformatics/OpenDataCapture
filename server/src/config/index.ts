import process from 'process';

import dotenv from 'dotenv';

import { MissingEnvironmentVariableError, InvalidEnvironmentVariableError } from '../exceptions';
import StringUtils from '../utils/StringUtils';

dotenv.config();

/**
 * The config class is used to get environment variables, checking that they
 * exist and are in the correct format, and casting them to the correct type.
 */
class Config {
  mongoUri: string;
  port: number;

  constructor() {
    this.mongoUri = this.getEnvironmentVariable('MONGO_URI');
    this.port = this.getIntegerEnvironmentVariable('PORT');
  }

  private getEnvironmentVariable(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new MissingEnvironmentVariableError(key);
    }
    return value;
  }

  private getIntegerEnvironmentVariable(key: string): number {
    const value = this.getEnvironmentVariable(key);
    if (!StringUtils.isInteger(value)) {
      throw new InvalidEnvironmentVariableError(key, `Value '${value} is not an integer`);
    }
    return parseInt(value);
  }
}

const config = new Config();

export default config;
