import { LoadingScreen } from '@opendatacapture/react-core';

export const SuspenseFallback = () => {
  return <LoadingScreen subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />;
};
