import { formatUnits } from 'viem';

const SECONDS_PER_YEAR = 31536000;

export function calculateAPY(rateInRay: bigint): string {
    const apr = Number(formatUnits(rateInRay, 27)); 
    if (apr === 0) return "0.00%";
    const apy = (1 + (apr / SECONDS_PER_YEAR)) ** SECONDS_PER_YEAR - 1;
    return `${(apy * 100).toFixed(2)}%`;
}

export function calculateUtilization(totalDebt: bigint, totalATokenSupply: bigint): number {
    if (totalATokenSupply === 0n) return 0;
    return Number((totalDebt * 10000n) / totalATokenSupply) / 100;
}