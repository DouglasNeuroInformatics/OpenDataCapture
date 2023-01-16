import axios from 'axios';
import { Instrument, instrumentSchema } from 'common';
import { z } from 'zod';

import { DemographicsFormSchema } from '../components/DemographicsForm';
import { InstrumentRecordFormSchema } from '../components/InstrumentRecordForm';

export class InstrumentsAPI {
  static async getAllSchemas(): Promise<Instrument[]> {
    const response = await axios.get('/api/instruments/schemas');
    return z.array(instrumentSchema).parseAsync(response.data);
  }

  static async getSchema(id: string): Promise<Instrument> {
    const response = await axios.get(`/api/instruments/schemas/${id}`);
    return instrumentSchema.parseAsync(response.data);
  }

  static async submitRecord(
    id: string,
    subjectDemographics: DemographicsFormSchema,
    responses: InstrumentRecordFormSchema
  ) {
    await axios.post(`/api/instruments/records/${id}`, {
      subjectDemographics,
      responses: responses
    });
  }
}
