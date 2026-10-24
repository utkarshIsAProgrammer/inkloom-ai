export type DiffLine = { kind: "same" | "added" | "removed"; text: string };

/**
 * Line diff used by the review view. Drafts are small, but the guard keeps a
 * pathological paste from blocking the main thread.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\r\n/g, "\n").split("\n");
  const b = after.replace(/\r\n/g, "\n").split("\n");

  if (a.length * b.length > 120000) {
    return [
      { kind: "removed", text: before },
      { kind: "added", text: after },
    ];
  }

  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );

  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const output: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      output.push({ kind: "same", text: a[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      output.push({ kind: "removed", text: a[i] });
      i += 1;
    } else {
      output.push({ kind: "added", text: b[j] });
      j += 1;
    }
  }

  while (i < a.length) {
    output.push({ kind: "removed", text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    output.push({ kind: "added", text: b[j] });
    j += 1;
  }

  return output;
}
