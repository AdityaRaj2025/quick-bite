export function computeTax(
  subtotalJpy: number,
  taxRatePercent: number
): number {
  return Math.round(subtotalJpy * (taxRatePercent / 100));
}

export function computeTotal(
  subtotalJpy: number,
  taxJpy: number,
  serviceChargeJpy = 0
): number {
  return subtotalJpy + taxJpy + serviceChargeJpy;
}
