import { Fragment, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { config } from '@/config';

let ForceClearQueryCacheProvider: React.FC<{ children: React.ReactNode }>;

if (config.dev.isForceClearQueryCacheEnabled) {
  // eslint-disable-next-line react/function-component-definition
  ForceClearQueryCacheProvider = function ForceClearQueryCacheProvider({ children }) {
    const queryClient = useQueryClient();
    const location = useLocation();

    useEffect(() => {
      //queryClient.clear();
      queryClient.clear();
    }, [location.pathname]);

    return <>{children}</>;
  };
} else {
  ForceClearQueryCacheProvider = Fragment;
}

export { ForceClearQueryCacheProvider };
