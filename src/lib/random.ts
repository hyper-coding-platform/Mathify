export type RandomSource = () => number;

export const randomInt = (min: number, max: number, random: RandomSource = Math.random) =>
  min + Math.floor(random() * (max - min + 1));

export function shuffle<T>(values: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
