import { Subject } from '@douglasneuroinformatics/common';
import axios from 'axios';

import { IdentificationFormData } from '@/components';

export class SubjectsAPI {
  static async addSubject(data: IdentificationFormData) {
    await axios.post('/v1/subjects', data);
  }

  static async lookupSubject(data: IdentificationFormData) {
    return axios.post<Subject>('/v1/subjects/lookup', data);
  }
}
