import { LoadingScreen } from '@open-data-capture/react-core';

export const SuspenseFallback = () => {
  return (
    <LoadingScreen
      subtitle="Please Be Patient, This May Take a While"
      title="Loading Editor and Toolchain"
    />
  );
};
