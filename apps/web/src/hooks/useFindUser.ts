import { $User } from '@opendatacapture/schemas/user';
import type { User } from '@opendatacapture/schemas/user';
import axios from 'axios';

export const userInfo = async (userId: string): Promise<null | User> => {
  try {
    const response = await axios.get(`/v1/users/${encodeURIComponent(userId)}`);
    const parsedResult = $User.safeParse(response.data);
    return parsedResult.success ? parsedResult.data : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
