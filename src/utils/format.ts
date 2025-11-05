export function formatBigInt(value: bigint, decimals = 18): string {
    const str = value.toString().padStart(decimals + 1, "0");
    const integer = str.slice(0, -decimals);
    const fraction = str.slice(-decimals).replace(/0+$/, "");
    return `${integer}.${fraction || "0"}`;
}

export function fromBaseCurrency(value: bigint, decimals = 8) {
  return Number(value) / 10 ** decimals;
}

export function fromRay(value: bigint, decimals = 18) {
  return Number(value) / 10 ** decimals;
}