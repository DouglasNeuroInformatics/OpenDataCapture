import type { Session } from '@opendatacapture/schemas/session';
import axios from 'axios';

export const sessionInfo = async (sessionId: string): Promise<null | Session> => {
  try {
    const response = await axios.get(`/v1/sessions/${sessionId}`);
    return response.data ? (response.data as Session) : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null; // ensures a resolved value instead of `void`
  }
};
