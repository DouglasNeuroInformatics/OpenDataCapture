import axios from 'axios';

import { IdentificationFormData } from '@/components/core';

export class SubjectsAPI {
  static async addSubject(data: IdentificationFormData) {
    await axios.post('/api/subjects', data);
  }
}
