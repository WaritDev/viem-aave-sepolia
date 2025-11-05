import { publicClient } from "../clients/publicClient";
import poolAddressesProviderAbi from "../abis/PoolAddressesProvider.json" assert { type: "json" };

const POOL_ADDRESSES_PROVIDER = "0x0496275d34753A48320CA58103d5220d394FF77F" as const;

export async function getPoolAddress() {
    const pool = await publicClient.readContract({
        address: POOL_ADDRESSES_PROVIDER,
        abi: poolAddressesProviderAbi,
        functionName: "getPool",
    });

    console.log("✅ Pool Address:", pool);
    return pool;
}