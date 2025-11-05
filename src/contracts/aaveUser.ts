import { publicClient } from "../clients/publicClient";
import { fromBaseCurrency, fromRay } from "../utils/format";

const poolAbi = [
    {
        name: "getUserAccountData",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [
            { name: "totalCollateralBase", type: "uint256" },
            { name: "totalDebtBase", type: "uint256" },
            { name: "availableBorrowsBase", type: "uint256" },
            { name: "currentLiquidationThreshold", type: "uint256" },
            { name: "ltv", type: "uint256" },
            { name: "healthFactor", type: "uint256" }
        ]
    }
] as const;

const POOL = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" as const;

export async function getUserData(user: `0x${string}`) {
    const [
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor
    ] = await publicClient.readContract({
        address: POOL,
        abi: poolAbi,
        functionName: "getUserAccountData",
        args: [user]
    });

    console.log("📊 Aave User Data (raw):", {
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor
    });

    console.log("📊 Aave User Data (formatted):", {
        totalCollateralUSD: fromBaseCurrency(totalCollateralBase),
        totalDebtUSD: fromBaseCurrency(totalDebtBase),
        availableBorrowsUSD: fromBaseCurrency(availableBorrowsBase),
        ltvPct: Number(ltv) / 100,
        liquidationThresholdPct: Number(currentLiquidationThreshold) / 100,
        healthFactor: fromRay(healthFactor)
    });

    return {
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor
    };
}