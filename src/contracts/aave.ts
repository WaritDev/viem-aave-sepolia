import { publicClient } from "../clients/publicClient";
import poolAddressesProviderAbi from "../abis/PoolAddressesProvider.json" assert { type: "json" };

const POOL_ADDRESSES_PROVIDER = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A" as const;

export async function getPoolAddress() {
    const pool = await publicClient.readContract({
        address: POOL_ADDRESSES_PROVIDER,
        abi: poolAddressesProviderAbi,
        functionName: "getPool",
    });

    console.log("✅ Pool Address:", pool);
    return pool;
}