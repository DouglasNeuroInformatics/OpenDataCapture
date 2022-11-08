export class HttpError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = 'ServerError';
    this.code = code;
  }
}

export class InvalidCharacterError extends Error {
  constructor(invalidChars: string[]) {
    super(`The following characters are invalid: ${invalidChars}`);
  }
}