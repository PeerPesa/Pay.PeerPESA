import { SendCUSDComponent } from "@/components/SendCUSDComponent";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export default function Home() {
    const { address, getUserAddress, mintMinipayNFT, signTransaction, checkBalance } = useWeb3();
    const [cUSDLoading, setCUSDLoading] = useState(false);
    const [nftLoading, setNFTLoading] = useState(false);
    const [signingLoading, setSigningLoading] = useState(false);
    const [tx, setTx] = useState<any>(undefined);
    const [balance, setBalance] = useState<string>("");
    const [token, setToken] = useState<string>('cUSD');

    useEffect(() => {
        getUserAddress();
    }, [getUserAddress]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (address) {
                const tokenAddress = token === 'cUSD' ? STABLE_TOKEN_ADDRESS : process.env.NEXT_PUBLIC_USDT_TOKEN_ADDRESS as `0x${string}`;
                const balance = await checkBalance(address as `0x${string}`, tokenAddress);
                setBalance((parseFloat(formatEther(balance)).toFixed(2)).toString());
            }
        };
        fetchBalance();
    }, [address, token, checkBalance]);

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
        <div className="flex flex-col items-center justify-center min-h-screen py-8 bg-gray-100">
            <div className="flex items-center justify-between w-full px-4 py-2 bg-white shadow-md" style={{ marginTop: '-5px' }}>
                {address && (
                    <div className="flex items-center">
                        <Image
                            src="/icons8-account.gif"
                            width={40}
                            height={40}
                            alt="User Icon"
                            className="rounded-full"
                        />
                    </div>
                )}
                {address && (
                    <div className="text-right">
                        <h2 className="text-lg font-semibold">Balance:</h2>
                        <p className="text-sm font-bold text-gray-700">{balance} {token}</p>
                    </div>
                )}
            </div>

            {!address && (
                <div className="mt-8 text-center">
                    <p className="mb-4 text-lg font-bold">
                        Nothing will be visible until you run this on MiniPay. Alternatively, you can use the button above to connect your wallet.
                    </p>
                    <Image
                        className="block mx-auto"
                        src="/undraw_access_denied_re_awnf.png"
                        width={400}
                        height={300}
                        alt="peerpesa"
                        layout="responsive"
                    />
                </div>
            )}

            {address && (
                <>
                    {tx && (
                        <p className="mt-4 font-bold text-center text-green-600">
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
                        <label className="block mb-2 text-lg font-semibold text-gray-700">Select Token:</label>
                        <select
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 mb-6 font-bold text-black bg-white border border-gray-300 rounded-2xl"
                        >
                            <option value="cUSD">cUSD</option>
                            <option value="USDT">USDT</option>
                        </select>
                        <SendCUSDComponent token={token} />
                    </div>
                </>
            )}
        </div>
    );
}
