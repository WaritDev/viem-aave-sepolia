import 'dotenv/config'; 

import { createPublicClient, http, parseAbi, getContract, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { calculateAPY, calculateUtilization } from './utils/utils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const rpcUrl = process.env.ALCHEMY_RPC_URL;
if (!rpcUrl) {
	throw new Error("❌ Missing ALCHEMY_RPC_URL in .env file");
}

const client = createPublicClient({
	chain: mainnet,
	transport: http(rpcUrl),
});

const POOL_ADDRESSES_PROVIDER_ADDR = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';

const AddressProviderABI = parseAbi([
    'function getPoolDataProvider() external view returns (address)',
    'function getPriceOracle() external view returns (address)'
]);

const DataProviderABI = parseAbi([
	'function getAllReservesTokens() external view returns ((string symbol, address tokenAddress)[])',
	'function getReserveConfigurationData(address asset) external view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
	'function getReserveData(address asset) external view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]);

const OracleABI = parseAbi([
    'function getAssetPrice(address asset) external view returns (uint256)'
]);

async function fetchAaveRiskData() {
	console.log("🔄 Connecting to Aave (via Alchemy)...");

	try {
		const addressProvider = getContract({
			address: POOL_ADDRESSES_PROVIDER_ADDR,
			abi: AddressProviderABI,
			client
		});
		
		const [dataProviderAddress, oracleAddress] = await Promise.all([
			addressProvider.read.getPoolDataProvider(),
			addressProvider.read.getPriceOracle()
		]);

		console.log(`📍 Data Provider: ${dataProviderAddress}`);
		console.log(`📍 Oracle:        ${oracleAddress}`);

		const dataProvider = getContract({ address: dataProviderAddress, abi: DataProviderABI, client });
		const oracle = getContract({ address: oracleAddress, abi: OracleABI, client });

		const reserves = await dataProvider.read.getAllReservesTokens();
		console.log(`✅ Fetched ${reserves.length} reserves.`);
		console.log(`-------------------------------------------`);

		const targetReserves = reserves.slice(0, 20); 

		for (const reserve of targetReserves) {
			const { symbol, tokenAddress } = reserve;

			await sleep(100); 

			try {
				const [config, data, price] = await Promise.all([
					dataProvider.read.getReserveConfigurationData([tokenAddress]),
					dataProvider.read.getReserveData([tokenAddress]),
					oracle.read.getAssetPrice([tokenAddress])
				]);

				const [decimals, ltv, liquidationThreshold, liquidationBonus] = config;
				const [, , totalAToken, totalStableDebt, totalVariableDebt, liquidityRate, variableBorrowRate] = data;

				const totalDebt = totalStableDebt + totalVariableDebt;
				const utilization = calculateUtilization(totalDebt, totalAToken);
				const supplyAPY = calculateAPY(liquidityRate);
				const borrowAPY = calculateAPY(variableBorrowRate);

				console.log(`\n🪙  Asset: ${symbol}`);
				console.log(`   Price: $${Number(formatUnits(price, 8)).toLocaleString()}`);
				console.log(`   [Risk] LTV: ${Number(ltv)/100}% | LT: ${Number(liquidationThreshold)/100}%`);
				console.log(`   [Health] Util: ${utilization.toFixed(2)}% | Supply: ${Number(formatUnits(totalAToken, Number(decimals))).toLocaleString()}`);
				console.log(`   [APY] Supply: ${supplyAPY} | Borrow: ${borrowAPY}`);

			} catch (error) {
				console.error(`❌ Error ${symbol}:`, error);
			}
		}
	} catch (err) {
		console.error("🚨 Critical Error connecting to Alchemy:", err);
	}
}

fetchAaveRiskData();