import { Subject } from '@douglasneuroinformatics/common';
import axios from 'axios';

import { IdentificationFormData } from '@/components';

export class SubjectsAPI {
  static async addSubject(data: IdentificationFormData) {
    await axios.post('/subjects', data);
  }

  static async lookupSubject(data: IdentificationFormData) {
    return axios.post<Subject>('/subjects/lookup', data);
  }
}
