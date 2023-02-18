export function range(end: number): readonly number[];

export function range(start: number, end: number): readonly number[];

export function range(...args: number[]): readonly number[] {
  const start = args.length === 2 ? args[0] : 0;
  const end = args.length === 2 ? args[1] : args[0];

  if (start >= end) {
    throw new Error(`End of range '${end}' must be greater than start '${start}'`);
  }

  const values: number[] = [];
  for (let i = start; i < end; i++) {
    values.push(i);
  }
  return values;
}
