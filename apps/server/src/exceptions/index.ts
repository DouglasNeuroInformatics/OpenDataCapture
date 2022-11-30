// BaseError is inherited by all other errors defined here
abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// General Errors
export class ValueError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

// Config Errors
export class MissingEnvironmentVariableError extends BaseError {
  constructor(variableName: string) {
    super(`Environment variable '${variableName}' is undefined`);
  }
}

export class InvalidEnvironmentVariableError extends BaseError {
  constructor(variableName: string, value: string) {
    super(`Invalid value '${value}' for environment variable '${variableName}'`);
  }
}

// Utility errors
