import { useContext } from 'react';

import AuthContext from '@/context/AuthContext';

export default function useAuth() {
  const authContext = useContext(AuthContext)!;
  return null;
}
