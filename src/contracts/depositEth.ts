import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL as string;

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
	account,
	chain: sepolia,
	transport: http(RPC_URL)
});

const WRAPPED_GATEWAY = "0x387d311e47e80b498169e6fb51d3193167d89F7D" as `0x${string}`;
const POOL = "0x6ae43d3271ff6888e7fc43fd7321a503ff738951" as `0x${string}`;

const depositEthAbi = [
	{
		name: "depositETH",
		type: "function",
		stateMutability: "payable",
		inputs: [
			{ name: "pool", type: "address" },
			{ name: "onBehalfOf", type: "address" },
			{ name: "referralCode", type: "uint16" }
		],
		outputs: []
	}
] as const;

export async function depositEthToAave(amountEth: string) {
	console.log(`🚀 Depositing ${amountEth} ETH to Aave V3 Sepolia...`);

	const txHash = await client.writeContract({
		address: WRAPPED_GATEWAY,
		abi: depositEthAbi,
		functionName: "depositETH",
		args: [POOL, account.address, 0],
		value: parseEther(amountEth)
	});

	console.log("✅ Transaction sent:", txHash);
	console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);
}