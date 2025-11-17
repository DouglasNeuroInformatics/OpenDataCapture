import type { User } from '@opendatacapture/schemas/user';
import axios from 'axios';

export const userInfo = async (userId: string): Promise<null | User> => {
  try {
    const response = await axios.get(`/v1/users/${userId}`);
    return response.data ? (response.data as User) : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};
