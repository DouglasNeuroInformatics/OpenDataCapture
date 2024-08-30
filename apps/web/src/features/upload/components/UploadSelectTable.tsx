import type { InstrumentInfo } from '@opendatacapture/schemas/instrument';

export type UploadSelectTableProps = {
  data: InstrumentInfo[];
  onSelect: (instrument: InstrumentInfo) => void;
};

export const UploadSelectTable = ({ data, onSelect }: UploadSelectTableProps) => {
  return <></>;
};
