export function formatBigInt(value: bigint, decimals = 18): string {
    const str = value.toString().padStart(decimals + 1, "0");
    const integer = str.slice(0, -decimals);
    const fraction = str.slice(-decimals).replace(/0+$/, "");
    return `${integer}.${fraction || "0"}`;
}