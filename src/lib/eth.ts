const ETH_DECIMALS = 18;
const ETH_BASE = 10n ** BigInt(ETH_DECIMALS);

export function parseEth(value: string) {
  const trimmed = value.trim();
  const isNegative = trimmed.startsWith('-');
  const normalized = trimmed.replace(/^[+-]/, '');
  const [integer = '0', fraction = ''] = normalized.split('.');
  const paddedFraction = fraction.padEnd(ETH_DECIMALS, '0').slice(0, ETH_DECIMALS);
  const parsed = BigInt(integer || '0') * ETH_BASE + BigInt(paddedFraction || '0');
  return isNegative ? -parsed : parsed;
}

export function formatEth(value: bigint, minimumFractionDigits = 0) {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const integer = absolute / ETH_BASE;
  const rawFraction = (absolute % ETH_BASE).toString().padStart(ETH_DECIMALS, '0');
  const trimmedFraction = rawFraction.replace(/0+$/, '');
  const fraction = trimmedFraction.padEnd(minimumFractionDigits, '0');
  return fraction ? `${sign}${integer}.${fraction}` : `${sign}${integer}`;
}

export function addEth(...values: string[]) {
  return formatEth(values.reduce((total, value) => total + parseEth(value), 0n));
}

export function multiplyEth(value: string, quantity: number) {
  return formatEth(parseEth(value) * BigInt(quantity));
}

export function percentageEth(value: string, percentage: number) {
  return formatEth((parseEth(value) * BigInt(percentage)) / 100n);
}

export function displayEth(value: string, minimumFractionDigits = 2) {
  return formatEth(parseEth(value), minimumFractionDigits);
}
