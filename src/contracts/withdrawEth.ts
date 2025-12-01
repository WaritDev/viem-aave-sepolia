import { createWalletClient, http, parseEther, checksumAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { erc20Abi } from "viem";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.SEPOLIA_RPC_URL as string;

const account = privateKeyToAccount(PRIVATE_KEY);
const client = createWalletClient({
	account,
	chain: sepolia,
	transport: http(RPC_URL)
});

// Pool V3 (checksum)
const POOL = checksumAddress(
	"0x6ae43d3271ff6888e7fc43fd7321a503ff738951"
);

// WETH Gateway (checksum)
const WETH_GATEWAY = checksumAddress(
	"0x387d311e47e80b498169e6fb51d3193167d89f7D"
);

// aEthWETH token address (aToken)
const AETH_WETH = checksumAddress(
	"0x27b4692c93959048833f40702b22fe3578fe8fe8"
);

// ABI for withdrawETH
const wethGatewayAbi = [
	{
		name: "withdrawETH",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
		{ name: "pool", type: "address" },
		{ name: "amount", type: "uint256" },
		{ name: "to", type: "address" }
		],
		outputs: []
	}
] as const;

// Approve aEthWETH to Gateway
async function approveAToken(amountEth: string) {
	const amount = parseEther(amountEth);

	console.log(`🟣 Approving aEthWETH for ${amountEth} ETH withdraw...`);

	const tx = await client.writeContract({
		address: AETH_WETH,
		abi: erc20Abi,
		functionName: "approve",
		args: [WETH_GATEWAY, amount]
	});

	console.log("✅ approve() tx sent:", tx);
	console.log(`🔗 https://sepolia.etherscan.io/tx/${tx}`);
}

// Withdraw ETH via Gateway
export async function withdrawEthFromAave(amountEth: string) {
	await approveAToken(amountEth);

	const amount = parseEther(amountEth);

	console.log(`🚀 Withdrawing ${amountEth} ETH from Aave via WETH Gateway...`);

	const txHash = await client.writeContract({
		address: WETH_GATEWAY,
		abi: wethGatewayAbi,
		functionName: "withdrawETH",
		args: [POOL, amount, account.address]
	});

	console.log("✅ withdrawETH() tx sent:", txHash);
	console.log(`🔗 https://sepolia.etherscan.io/tx/${txHash}`);
}