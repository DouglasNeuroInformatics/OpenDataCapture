import { isPlainObject } from '@douglasneuroinformatics/libjs';

type SerializedSet = {
  __deserializedType: 'Set';
  __isOpenDataCaptureSerializedType: boolean;
  value: any[];
};

function isSerializedSet(value: unknown): value is SerializedSet {
  if (!isPlainObject(value)) {
    return false;
  }
  return Boolean(value.__isOpenDataCaptureSerializedType && value.__deserializedType === 'Set');
}

export function replacer(_: string, value: unknown) {
  if (value instanceof Set) {
    return {
      __deserializedType: 'Set',
      __isOpenDataCaptureSerializedType: true,
      value: Array.from(value)
    } satisfies SerializedSet;
  }
  return value;
}

export function reviver(_: string, value: unknown) {
  if (isSerializedSet(value)) {
    return new Set(value.value);
  }
  return value;
}
