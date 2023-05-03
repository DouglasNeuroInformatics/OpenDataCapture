/** A subset of other things used to generate visitorId */
export type Fingerprint = {
  visitorId: string;
  language: string;
  screenResolution?: [number | null, number | null];
};
