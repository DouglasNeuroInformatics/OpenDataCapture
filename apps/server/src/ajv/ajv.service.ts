import { Injectable } from '@nestjs/common';

import Ajv from 'ajv';

@Injectable()
export class AjvService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ strict: true });
  }
}
