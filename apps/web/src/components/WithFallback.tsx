/* eslint-disable react/function-component-definition */

import { useEffect, useState } from 'react';

import { LoadingFallback } from './LoadingFallback';

const MIN_DELAY = 500; // ms

function isDataReady<TProps extends { data: unknown }>(
  props: TProps
): props is TProps & { data: NonNullable<TProps['data']> } {
  return !(props.data === null || props.data === undefined);
}

export function WithFallback<TProps extends { [key: string]: unknown }>({
  Component,
  props
}: {
  Component: React.FC<TProps>;
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
      }, MIN_DELAY);
    }
    return () => clearTimeout(timeout);
  }, []);

  return isMinDelayComplete && isDataReady(props) ? (
    <Component {...(props as unknown as TProps)} />
  ) : (
    <LoadingFallback />
  );
}
