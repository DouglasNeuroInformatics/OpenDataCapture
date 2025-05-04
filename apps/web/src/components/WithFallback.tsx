/* eslint-disable react/function-component-definition */

import React, { useEffect, useState } from 'react';

import { LoadingFallback } from './LoadingFallback';

function isDataReady<TProps extends { data: unknown }>(
  props: TProps
): props is TProps & { data: NonNullable<TProps['data']> } {
  return !(props.data === null || props.data === undefined);
}

export function WithFallback<TProps extends { [key: string]: unknown }>({
  Component,
  minDelay = 300, // ms
  props
}: {
  Component: React.FC<TProps>;
  /** the minimum duration to suspend in ms */
  minDelay?: number;
  props: TProps extends { data: infer TData extends NonNullable<unknown> }
    ? Omit<TProps, 'data'> & { data: null | TData | undefined }
    : never;
}) {
  // if the data is not initially ready, set a min delay
  const [isMinDelayComplete, setIsMinDelayComplete] = useState(isDataReady(props));

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!isMinDelayComplete) {
      timeout = setTimeout(() => {
        setIsMinDelayComplete(true);
      }, minDelay);
    }
    return () => clearTimeout(timeout);
  }, []);

  return isMinDelayComplete && isDataReady(props) ? (
    <Component {...(props as unknown as TProps)} />
  ) : (
    <LoadingFallback />
  );
}
