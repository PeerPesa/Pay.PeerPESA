import { createPublicClient, http, formatEther } from "viem";
import { celo } from "viem/chains";
import { stableTokenABI } from "@celo/abis";

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a"; // cUSD token contract address

// Create a public client instance with HTTP transport
const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

export async function checkCUSDBalance(address: string): Promise<string> {
  try {
    // Fetch the balance of the given address using the public client
    const balanceInBigNumber = await publicClient.readContract({
      address: STABLE_TOKEN_ADDRESS,
      abi: stableTokenABI,
      functionName: 'balanceOf',
      args: [address],
    });

    // Convert the balance from BigNumber to a string and format it
    const balanceInWei = balanceInBigNumber.toString();
    return formatEther(balanceInWei);
  } catch (error) {
    console.error("Error fetching cUSD balance:", error);
    throw new Error("Failed to fetch cUSD balance.");
  }
}
