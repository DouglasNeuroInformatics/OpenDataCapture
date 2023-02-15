import axios from 'axios';
import { subjectSchema } from 'common';
import { z } from 'zod';

import { IdentificationFormData } from '@/components/core';

export class SubjectsAPI {
  static async addSubject(data: IdentificationFormData) {
    await axios.post('/api/subjects', data);
  }

  static async getSubjects() {
    const response = await axios.get('/api/subjects');
    return z.array(subjectSchema).parseAsync(response.data);
  }

  static async getSubjectInstrumentRecords(id: string) {
    const response = await axios.get(`/api/instruments/records?subject=${id}`);
    return response.data as { dateCollected: string; data: Record<string, number> }[];
  }
}
