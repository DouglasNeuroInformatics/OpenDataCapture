export default class Validation {
  static isObjKey(key: PropertyKey, obj: object): key is keyof object {
    return key in obj;
  }

  static allUniqueElements(arr: unknown[]) {
    return new Set(arr).size === arr.length;
  }

  static allUniqueValuesForKey(arr: object[], key: string) {
    const values: unknown[] = [];
    arr.forEach((obj) => {
      if (!this.isObjKey(key, obj)) {
        throw new Error('Object does not contain key: ' + key);
      }
      values.push(obj[key]);
    });
    return this.allUniqueElements(values);
  }
}
