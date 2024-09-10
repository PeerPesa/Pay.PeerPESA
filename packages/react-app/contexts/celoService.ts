import { useState } from "react";
import StableTokenABI from "./cusd-abi.json"; // Ensure you have the correct ABI for cUSD
import MinipayNFTABI from "./minipay-nft.json"; // Ensure you have the correct ABI for the NFT contract
import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
    http,
    parseEther,
} from "viem";
import { celo } from "viem/chains"; // Using Celo mainnet

const publicClient = createPublicClient({
    chain: celo, // Use Celo mainnet
    transport: http(),
});

const cUSDTokenAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a"; // Mainnet cUSD token address
const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Mainnet NFT contract (verify if correct)
const MY_MINIPAY_WALLET_ADDRESS = "0x1251135a426Acd6169Eb5a93f500dB79dE1D83fc"; // Your wallet address

export const useWeb3 = () => {
    const [address, setAddress] = useState<`0x${string}` | null>(null);

    const getUserAddress = async () => {
        try {
            if (typeof window !== "undefined" && window.ethereum) {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celo, // Use Celo mainnet
                });

                const [address] = await walletClient.getAddresses();
                setAddress(address as `0x${string}`);
            } else {
                throw new Error("Ethereum wallet is not available.");
            }
        } catch (error) {
            console.error("Error getting user address:", error);
        }
    };

    const checkBalance = async (address: `0x${string}`) => {
        try {
            const stableTokenContract = getContract({
                address: cUSDTokenAddress,
                abi: StableTokenABI.abi,
                client: publicClient,
            });

            const balance = await stableTokenContract.read.balanceOf([address]) as bigint;
            return balance;
        } catch (error) {
            console.error("Error checking balance:", error);
            throw new Error("Failed to check balance.");
        }
    };

    const sendCUSD = async (amount: string, fee: string) => {
        if (!address) {
            throw new Error("Address is null. Please make sure the user is connected.");
        }

        try {
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo, // Use Celo mainnet
                account: address,
            });

            const amountInWei = BigInt(parseEther(amount));
            const feeInWei = BigInt(parseEther(fee));
            const totalAmountInWei = amountInWei + feeInWei;

            const balance = await checkBalance(address);
            console.log(`Balance: ${balance.toString()}`);
            console.log(`Total Amount (including fee): ${totalAmountInWei.toString()}`);

            if (balance < totalAmountInWei) {
                throw new Error("Insufficient balance to cover the amount and fee.");
            }

            // Estimate gas
            const gasEstimate = await publicClient.estimateGas({
                to: MY_MINIPAY_WALLET_ADDRESS,
                value: totalAmountInWei,
                account: address,
                feeCurrency: cUSDTokenAddress,
            });

            const gasPrice = await publicClient.getGasPrice();
            const totalCost = gasEstimate * gasPrice + totalAmountInWei;
            console.log(`Gas Estimate: ${gasEstimate.toString()}`);
            console.log(`Gas Price: ${gasPrice.toString()}`);
            console.log(`Total Cost (Gas + Amount): ${totalCost.toString()}`);

            if (balance < totalCost) {
                throw new Error(`Insufficient funds for transfer (after fees). Required: ${totalCost.toString()}, Available: ${balance.toString()}`);
            }

            // Send amount to MiniPay wallet
            const txAmount = await walletClient.writeContract({
                address: cUSDTokenAddress,
                abi: StableTokenABI.abi,
                functionName: "transfer",
                account: address,
                args: [MY_MINIPAY_WALLET_ADDRESS, amountInWei],
                feeCurrency: cUSDTokenAddress,
            });

            // Send transaction fee
            const txFee = await walletClient.writeContract({
                address: cUSDTokenAddress,
                abi: StableTokenABI.abi,
                functionName: "transfer",
                account: address,
                args: [MY_MINIPAY_WALLET_ADDRESS, feeInWei],
                feeCurrency: cUSDTokenAddress,
            });

            const receiptAmount = await publicClient.waitForTransactionReceipt({
                hash: txAmount,
            });

            const receiptFee = await publicClient.waitForTransactionReceipt({
                hash: txFee,
            });

            return {
                receiptAmount,
                receiptFee,
                totalAmount: totalAmountInWei,
                fee: feeInWei,
            };
        } catch (error) {
            console.error("Error sending cUSD:", error);
            throw new Error("Failed to send cUSD.");
        }
    };

    return {
        address,
        getUserAddress,
        sendCUSD,
    };
};
