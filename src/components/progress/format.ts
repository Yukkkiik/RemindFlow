/** 0..1 ratio as a percentage, or an em dash when there is nothing to measure. */
export function formatPercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}
