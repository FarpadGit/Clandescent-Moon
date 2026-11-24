export function swapItems<T>(list: T[], index1: number, index2: number) {
  if (list[index1] == undefined || list[index2] == undefined) return list;
  let result = [...list];
  [result[index1], result[index2]] = [result[index2], result[index1]];

  return result;
}

export function reverseList<T>(list: T[]) {
  if (list.length < 2) return list;
  let result = [...list];
  for (let i = 0; i < list.length / 2; i++) {
    const j = list.length - 1 - i;
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sortList<T extends { text: string }>(list: T[]) {
  if (list.length < 2) return list;
  const result = [...list].sort((a, b) =>
    a.text < b.text ? -1 : a.text > b.text ? 1 : 0,
  );
  return result;
}

export function pushItemToTop<T>(list: T[], index: number) {
  if (list[index] == undefined) return list;
  const temp = list.filter((_, i) => i !== index);
  const result = [list[index], ...temp];

  return result;
}

export function pushItemToBottom<T>(list: T[], index: number) {
  if (list[index] == undefined) return list;
  const temp = list.filter((_, i) => i !== index);
  const result = [...temp, list[index]];

  return result;
}
