import type { Session } from '@opendatacapture/schemas/session';
import axios from 'axios';

//Change this query to into a hook method and name it useFindSessionQuery

//Change the api call to have an include tag which includes the username from users

//Change the return type to

export const sessionInfo = async (sessionId: string): Promise<Session> => {
  try {
    const response = await axios.get(`/v1/sessions/${encodeURIComponent(sessionId)}`);
    if (!response.data) {
      throw new Error('Session data does not exist');
    }
    return response.data as Session;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};
