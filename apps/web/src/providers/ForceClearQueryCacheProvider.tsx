import React, { Fragment, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';

import { config } from '@/config';

type ForceClearQueryCacheProviderProps = {
  children: React.ReactNode;
};

const ClearQueryCacheOnNavigation = ({ children }: ForceClearQueryCacheProviderProps) => {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    //queryClient.clear();
    queryClient.clear();
  }, [location.pathname]);

  return <>{children}</>;
};

const { isForceClearQueryCacheEnabled } = config.dev;

export const ForceClearQueryCacheProvider: React.FC<ForceClearQueryCacheProviderProps> = isForceClearQueryCacheEnabled
  ? ClearQueryCacheOnNavigation
  : Fragment;
