import { useState } from "react";
import StableTokenABI from "./cusd-abi.json";
import MinipayNFTABI from "./minipay-nft.json";
import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
    http,
    parseEther,
    stringToHex,
} from "viem";
import { celo } from "viem/chains";

const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
});

const cUSDTokenAddress = process.env.NEXT_PUBLIC_CUSD_TOKEN_ADDRESS as `0x${string}`;
const usdtTokenAddress = process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS as `0x${string}`;
const MINIPAY_NFT_CONTRACT = process.env.NEXT_PUBLIC_MINIPAY_NFT_CONTRACT as `0x${string}`;
const MINIPAY_WALLET_ADDRESS = process.env.NEXT_PUBLIC_MINIPAY_WALLET_ADDRESS as `0x${string}`;

export const useWeb3 = () => {
    const [address, setAddress] = useState<`0x${string}` | null>(null);

    const getUserAddress = async () => {
        try {
            if (typeof window !== "undefined" && window.ethereum) {
                const walletClient = createWalletClient({
                    transport: custom(window.ethereum),
                    chain: celo,
                });

                const [userAddress] = await walletClient.getAddresses();
                setAddress(userAddress as `0x${string}`);
            } else {
                throw new Error("Ethereum wallet is not available.");
            }
        } catch (error) {
            console.error("Error getting user address:", error);
        }
    };

    const checkBalance = async (userAddress: `0x${string}`, tokenAddress: `0x${string}`) => {
        try {
            const stableTokenContract = getContract({
                address: tokenAddress,
                abi: StableTokenABI.abi,
                client: publicClient,
            });

            const balance = await stableTokenContract.read.balanceOf([userAddress]) as bigint;
            return balance;
        } catch (error) {
            console.error("Error checking balance:", error);
            throw new Error("Failed to check balance.");
        }
    };
    const sendToken = async (amount: string, token: string) => {
        if (!address) {
            throw new Error("Address is null. Please make sure the user is connected.");
        }
    
        const tokenAddress = token === 'cUSD' ? cUSDTokenAddress : usdtTokenAddress;
    
        try {
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo,
                account: address,
            });
    
            const balance = await checkBalance(address, tokenAddress);
            const amountInWei = BigInt(parseEther(amount)); // The amount you want to transfer
            
            // here we  calculate the transaction fee
            const transactionFee = BigInt(Math.floor(parseFloat(amount) * 0.005 * 1e18)); // 0.5% fee
    
            // then add to the amountInWei total amount to deduct (amount + transaction fee)
            const totalAmountToDeduct = amountInWei + transactionFee;
    
            console.log(`Balance: ${balance.toString()}`);
            console.log(`Total amount to deduct: ${totalAmountToDeduct.toString()}`);
    
            // Check if balance covers both the amount and the fee
            if (balance < totalAmountToDeduct) {
                throw new Error("Insufficient balance to cover the amount and transaction fee.");
            }
    
            // Deduct the total amount from the user's balance
            const tx = await walletClient.writeContract({
                address: tokenAddress,
                abi: StableTokenABI.abi,
                functionName: "transfer",
                account: address,
                args: [MINIPAY_WALLET_ADDRESS, totalAmountToDeduct], 
            });
    
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx,
            });
    
            return receipt.transactionHash;
        } catch (error) {
            console.error("Error sending token:", error);
            throw new Error("Failed to send token.");
        }
    };
    
    const sendTokenFromMyWallet = async (amount: string, token: string, userAddress: `0x${string}`) => {
        const tokenAddress = token === 'cUSD' ? cUSDTokenAddress : usdtTokenAddress;

        try {
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo,
                account: MINIPAY_WALLET_ADDRESS, // our MiniPay wallet address as the sender
            });

            const amountInWei = BigInt(parseEther(amount));

            const tx = await walletClient.writeContract({
                address: tokenAddress,
                abi: StableTokenABI.abi,
                functionName: "transfer",
                account: MINIPAY_WALLET_ADDRESS, // our  MiniPay wallet address as the sender
                args: [userAddress, amountInWei], // Send tokens to the user's address
            });

            console.log(`Transaction hash: ${tx}`);

            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx,
            });

            if (receipt.status !== "success") {
                throw new Error("Transaction failed");
            }

            console.log(`Transaction receipt: ${JSON.stringify(receipt)}`);

            return receipt.transactionHash; 
        } catch (error) {
            console.error("Error sending token from my wallet:", error);
            throw new Error("Failed to send token from my wallet.");
        }
    };

    const mintMinipayNFT = async () => {
        if (!address) {
            throw new Error("Address is null. Please make sure the user is connected.");
        }

        try {
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo,
                account: address,
            });

            const tx = await walletClient.writeContract({
                address: MINIPAY_NFT_CONTRACT,
                abi: MinipayNFTABI.abi,
                functionName: "safeMint",
                account: address,
                args: [
                    address,
                    "https://cdn-production-opera-website.operacdn.com/staticfiles/assets/images/sections/2023/hero-top/products/minipay/minipay__desktop@2x.a17626ddb042.webp",
                ],
            });

            const receipt = await publicClient.waitForTransactionReceipt({
                hash: tx,
            });

            return receipt;
        } catch (error) {
            console.error("Error minting MiniPay NFT:", error);
            throw new Error("Failed to mint MiniPay NFT.");
        }
    };

    const signTransaction = async () => {
        if (!address) {
            throw new Error("Address is null. Please make sure the user is connected.");
        }

        try {
            const walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo,
                account: address,
            });

            const res = await walletClient.signMessage({
                account: address,
                message: stringToHex("peerpesa"),
            });

            return res;
        } catch (error) {
            console.error("Error signing transaction:", error);
            throw new Error("Failed to sign the transaction.");
        }
    };

    const checkTransactionStatus = async (txHash: string) => {
        try {
            const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
            return receipt.status === "success";
        } catch (error) {
            console.error("Error checking transaction status:", error);
            throw new Error("Failed to check transaction status.");
        }
    };

    const getCountryPrefix = (country: string) => {
        const countryCodes = {
            "Nigeria": "234",
            "cote d'Ivoire": "225",
            "Kenya": "254",
            "Ghana": "233",
            "Uganda": "256",
            "Tanzania": "255",
            "Rwanda": "250",
            "cameroon": "237",
            "Ethiopia": "251",
            "Malawi": "265",
            "senegal": "221",
            "Zambia": "260",
        };
        return countryCodes[country] || "";
    };

    const getMobileOperators = (country: string) => {
        const operators = {
            "cameroon": [{ name: "FMM", code: "FMM" }],
            "Cote d'Ivoire": [{ name: "FMM", code: "FMM" }, { name: "WAVE", code: "WAVE" }],
            "Ethiopia": [{ name: "AMOLEMONEY", code: "AMOLEMONEY" }],
            "Ghana": [{ name: "AIRTEL", code: "AIRTEL" }, { name: "MTN", code: "MTN" }, { name: "TIGO", code: "TIGO" }, { name: "VODAFONE", code: "VODAFONE" }],
            "Kenya": [{ name: "M-Pesa", code: "MPS" },{ name: "Airtel Kenya", code: "MPX" }],
            "Malawi": [{ name: "AIRTELMW", code: "AIRTELMW" }],
            "Senegal": [{ name: "EMONEY", code: "EMONEY" }, { name: "FREEMONEY", code: "FREEMONEY" }, { name: "ORANGEMONEY", code: "ORANGEMONEY" }, { name: "WAVE", code: "WAVE" }],
            "Rwanda": [{ name: "M-Pesa", code: "MPS" }],
            "Tanzania": [{ name: "M-Pesa", code: "MPS" }],
            "Uganda": [{ name: "M-Pesa", code: "MPS" }],
            "Zambia": [{ name: "MPS", code: "MPS" }],
        };
        return operators[country] || [];
    };

    return {
        address,
        getUserAddress,
        sendToken,
        sendTokenFromMyWallet,
        mintMinipayNFT,
        signTransaction,
        checkTransactionStatus,
        getCountryPrefix,
        getMobileOperators,
        checkBalance, 
    };
};
