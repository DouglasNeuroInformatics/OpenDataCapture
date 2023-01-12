import { Subject, subjectSchema } from 'common';
import { z } from 'zod';

import BaseAPI from './base.api';

export default class SubjectsAPI extends BaseAPI {
  static register = (subject: Subject) => {
    console.log(subject);
  };

  static getAll = async () => {
    const response = await fetch(`${this.host}/api/subjects`);
    if (!response.ok) {
      throw response;
    }
    return z.array(subjectSchema).parse(await response.json());
  };
}
