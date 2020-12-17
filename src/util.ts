export const isDefined = (o: unknown) => o != null;

export const findIndex = <T>(array: T[], predicate: (value: T, index: number, obj: T[]) => unknown): number => {
  'worklet';
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (predicate(value, index, array) === true) return index;
  }
  return -1;
};

export const every = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => unknown): boolean => {
  'worklet';
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (predicate(value, index, array) !== true) return false;
  }
  return true;
};

export const some = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => unknown): boolean => {
  'worklet';
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (predicate(value, index, array) === true) return true;
  }
  return false;
};
