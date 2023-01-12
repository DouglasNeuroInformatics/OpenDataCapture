import { useQuery } from 'react-query';

import useAuth from './useAuth';

export default function useFetch(key: string, endpoint: string) {
  const auth = useAuth();
  console.log(auth);

  return useQuery(key, async () => {
    const response = await fetch(import.meta.env.VITE_API_HOST + endpoint, {
      headers: {
        Authorization: `Bearer ${auth.accessToken!}`
      }
    });
    return response.json();
  });
}
