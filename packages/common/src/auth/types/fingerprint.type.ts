/** A subset of other things used to generate visitorId */
export type Fingerprint = {
  visitorId: string;
  languages?: string[][];
  screenResolution?: [number | null, number | null];
};
