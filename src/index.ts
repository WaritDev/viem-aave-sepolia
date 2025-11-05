import "dotenv/config";
import { getUserData } from "./contracts/aaveUser";
import { getPoolAddress } from "./contracts/aave";

const USER = process.env.PUBLIC_ADDRESS as `0x${string}`;

async function main() {
	console.log("🚀 Fetching Aave user data...");

	if (!USER) {
		throw new Error("Missing PUBLIC_ADDRESS in .env file");
	}

    await getPoolAddress();
	await getUserData(USER);
}

main().catch(console.error);