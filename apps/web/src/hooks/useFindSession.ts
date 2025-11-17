import { type Session, $Session } from '@opendatacapture/schemas/session';
import axios from 'axios';

export const sessionInfo = async (sessionId: string): Promise<null | Session> => {
  try {
    const response = await axios.get(`/v1/sessions/${sessionId}`);
    const parsedResult = $Session.safeParse(response.data);
    return parsedResult.success ? parsedResult.data : null;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};
