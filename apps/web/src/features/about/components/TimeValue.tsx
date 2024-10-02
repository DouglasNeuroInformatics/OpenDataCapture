import { useCallback, useRef, useState } from 'react';

import { parseDuration } from '@douglasneuroinformatics/libjs';
import { useInterval } from '@douglasneuroinformatics/libui/hooks';

export type TimeValueProps = {
  value: number;
};

export const TimeValue = ({ value }: TimeValueProps) => {
  const format = useCallback((uptime: number) => {
    let { days, hours, minutes, seconds } = parseDuration(uptime * 1000);
    hours += days * 24;
    return [hours, minutes, seconds].map((value) => (value < 10 ? '0' + value : value)).join(':');
  }, []);
  const valueRef = useRef<number>(value);

  const [state, setState] = useState(format(value));

  useInterval(() => {
    valueRef.current = valueRef.current + 1;
    setState(format(valueRef.current + 1));
  }, 1000);

  return <span>{state}</span>;
};
