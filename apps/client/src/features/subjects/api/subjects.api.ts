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

  static async geAvailableInstrumentRecords(subjectId: string) {
    const response = await axios.get(`/api/instruments/records/available?subject=${subjectId}`);
    return response.data as Array<{ title: string; count: number }>;
  }

  static async getSubjectInstrumentRecords(subjectId: string) {
    const response = await axios.get(`/api/instruments/records?subject=${subjectId}`);
    return response.data as { dateCollected: string; data: Record<string, number> }[];
  }
}
