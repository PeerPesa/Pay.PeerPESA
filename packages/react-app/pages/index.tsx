import { SendCUSDComponent } from "@/components/SendCUSDComponent";
import { useWeb3 } from "@/contexts/useWeb3";
import { useEffect, useState } from "react";
import { getContract, formatEther, createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { stableTokenABI } from "@celo/abis";

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
// Define types for the parameters
async function checkCUSDBalance(publicClient: ReturnType<typeof createPublicClient>, address: `0x${string}`): Promise<string> {
    const stableTokenContract = getContract({
        abi: stableTokenABI,
        address: STABLE_TOKEN_ADDRESS,
        client: publicClient,
    });
    const balanceInWei = await stableTokenContract.read.balanceOf([address]);
    const balanceInEthers = formatEther(balanceInWei);
    return parseFloat(balanceInEthers).toFixed(2);
}

const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
}); 
export default function Home() {
    const { address, getUserAddress, mintMinipayNFT, signTransaction } = useWeb3();
    const [cUSDLoading, setCUSDLoading] = useState(false);
    const [nftLoading, setNFTLoading] = useState(false);
    const [signingLoading, setSigningLoading] = useState(false);
    const [tx, setTx] = useState<any>(undefined);
    const [balance, setBalance] = useState<string>("");
    const [blockDifficulty, setBlockDifficulty] = useState<bigint | null>(null);

    useEffect(() => {
        getUserAddress();
    }, [getUserAddress]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (address) {
                const balance = await checkCUSDBalance(publicClient, address as `0x${string}`);
                setBalance(balance);
            }
        };
        fetchBalance();
    }, [address]);
    useEffect(() => {
        const fetchBlockData = async () => {
            try {
                const block = await publicClient.getBlock();
                const blockDifficulty = block.difficulty ?? BigInt(0);

                setBlockDifficulty(blockDifficulty);
            } catch (error) {
                console.error('Error fetching block data:', error);
            }
        };

        fetchBlockData();
    }, []);

    async function signMessage() {
        setCUSDLoading(true);
        try {
            await signTransaction();
        } catch (error) {
            console.log(error);
        } finally {
            setCUSDLoading(false);
        }
    }

    async function mintNFT() {
        setNFTLoading(true);
        try {
            const tx = await mintMinipayNFT();
            setTx(tx);
        } catch (error) {
            console.log(error);
        } finally {
            setNFTLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {!address && (
                <div className="h1">nothing will be visible untill you run this on minipay .</div>
            )}
            {<div>
                {/* <h1>Flutterwave Transfer</h1>
                <TransferForm
                    onSuccess={(message) => console.log('Success:', message)}
                    onError={(message) => console.log('Error:', message)}
                /> */}
            </div>}

            {address && (
                <>
                    <div className="text-center h2">
                        Your address:{" "}
                        <span className="text-sm font-bold">{address}</span>
                    </div>
                    <div className="text-center h2">
                        Your cUSD Balance:{" "}
                        <span className="text-sm font-bold">{balance} cUSD</span>
                    </div>
                    <div className="text-center h2">
                        Latest Block Difficulty:{" "}
                        <span className="text-sm font-bold">{blockDifficulty?.toString() || "Loading..."}</span>
                    </div>
                    {tx && (
                        <p className="mt-4 font-bold">
                            Tx Completed:{" "}
                            {(tx.transactionHash as string).substring(0, 6)}
                            ...
                            {(tx.transactionHash as string).substring(
                                tx.transactionHash.length - 6,
                                tx.transactionHash.length
                            )}
                        </p>
                    )}
                    <div className="w-full px-3 mt-7">
                        <SendCUSDComponent />
                    </div>
                </>
            )}
        </div>
    );
}
// pioneer jerry