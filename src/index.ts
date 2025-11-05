import "dotenv/config";
import { getPoolAddress } from "./contracts/aave";

async function main() {
    console.log("🚀 Connecting to Aave V3 on Sepolia...");
    await getPoolAddress();
}

main().catch(console.error);