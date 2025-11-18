import { $Session } from '@opendatacapture/schemas/session';
import type { Session } from '@opendatacapture/schemas/session';
import axios from 'axios';

export const sessionInfo = async (sessionId: string): Promise<null | Session> => {
  try {
    const response = await axios.get(`/v1/sessions/${sessionId}`);
    const parsedResult = await $Session.parseAsync(response.data);
    return parsedResult;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};
