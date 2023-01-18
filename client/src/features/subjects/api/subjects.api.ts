import axios from 'axios';
import { instrumentRecordSchema, subjectSchema } from 'common';
import { z } from 'zod';

import { SubjectFormSchema } from '../components/SubjectForm';

export class SubjectsAPI {
  static async addSubject(data: SubjectFormSchema) {
    await axios.post('/api/subjects', data);
  }

  static async getSubjects() {
    const response = await axios.get('/api/subjects');
    return z.array(subjectSchema).parseAsync(response.data);
  }

  static async getSubjectInstrumentRecords(id: string) {
    const response = await axios.get(`/api/instruments/records?subject=${id}`);
    return response.data as { instrument: string; subject: string; data: Record<string, string> };
    // return z.array(instrumentRecordSchema).parseAsync(response.data);
  }
}
