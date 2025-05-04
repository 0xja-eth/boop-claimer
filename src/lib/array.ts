export function removeDuplicates<T>(arr: T[]) {
  // return [...new Set(arr)];
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
export function splitArray<T>(arr: T[], chunkSize: number) {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize)
    res.push(arr.slice(i, i + chunkSize));
  return res;
}
export function groupBy<T>(arr: T[], ...keys: (keyof T)[]) {
  return customGroupBy(arr, (e) => keys.map((k) => e[k]).join("-"));
  // return arr.reduce((res, e) => {
  //   const key = keys.map(k => e[k]).join("-");
  //   res[key] ||= [];
  //   res[key].push(e);
  //   return res;
  // }, {});
}
export function customGroupBy<T>(arr: T[], keyFunc: (e: T) => string) {
  return arr.reduce((res, e) => {
    const key = keyFunc(e);
    res[key] ||= [];
    res[key].push(e);
    return res;
  }, {} as Record<string, T[]>);
}
export function arraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;

  return true;
}

// export function intersection<T>(array1: T[], array2: T[]): T[] {
//   const set1 = new Set(array1);
//   const set2 = new Set(array2);
//   return [...set1].filter((x) => set2.has(x));
// }
