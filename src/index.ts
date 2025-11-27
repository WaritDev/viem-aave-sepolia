import "dotenv/config";
import { depositEthToAave } from "./contracts/depositEth";
import { withdrawEthFromAave } from "./contracts/withdrawEth";

async function main() {
	console.log("🚀 Starting Aave ETH deposit...");
	await depositEthToAave("0.02");
	await new Promise((resolve) => setTimeout(resolve, 10000));
	console.log("🚀 Starting Aave ETH withdrawal...");
	await withdrawEthFromAave("0.02");
}

main().catch(console.error);