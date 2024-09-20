import { SendCUSDComponent } from "@/components/SendCUSDComponent";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from '@/components/ouma'; 
import { formatEther } from "viem";
import { BuyComponent } from "@/components/BuyComponent";

const STABLE_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

export default function Home() {
    const { address, getUserAddress, mintMinipayNFT, signTransaction, checkBalance } = useWeb3();
    const [cUSDLoading, setCUSDLoading] = useState(false);
    const [nftLoading, setNFTLoading] = useState(false);
    const [signingLoading, setSigningLoading] = useState(false);
    const [tx, setTx] = useState<any>(undefined);
    const [balance, setBalance] = useState<string>("");
    const [token, setToken] = useState<string>('cUSD');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalDetails, setModalDetails] = useState<any>(null);
    const [mode, setMode] = useState<string>('send'); // Add state for mode
    const [step, setStep] = useState<number>(1); // Add state for step

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

    const handleModalOpen = (message: string, details: any) => {
        setModalMessage(message);
        setModalDetails(details);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setModalDetails(null);
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
        setStep(1); // Reset step to 1 when mode changes
    };

    const getProgressBarWidth = () => {
        if (mode === 'send') {
            return `${(step - 1) / 3 * 100}%`; // For SendCUSDComponent, 4 steps
        } else {
            return `${(step - 1) / 4 * 100}%`; // For BuyComponent, 5 steps
        }
    };

    const formatAddress = (address: string) => {
        return `${address.substring(0, 5)}***${address.substring(address.length - 4)}`;
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-200 font-harmony">
 {/* Card Container with blog */}
{!address && (
    <div className="w-full max-w-sm px-6 py-2 mt-4 bg-white shadow-xl rounded-3xl sm:w-1/3 lg:w-1/4">
        <div className="flex flex-row items-start">
            {/* Description */}
            <div className="w-1/2 pr-4">
                <p className="mt-2 text-sm font-bold text-black-600">
                    Send Stablecoins from MiniPay to <span className="text-green-600">Mobile money</span>, Buy Stablecoins on the Go!
                </p>
            </div>
            
            {/* Image */}
            <div className="w-1/2">
                <Image
                    src="/blog.png"
                    width={400}
                    height={400}
                    alt="New Image"
                    layout="responsive"
                    className="rounded-lg"
                />
            </div>
        </div>

        {/* Icon and Balance Information */}
        <div className="flex items-center justify-between mt-4">
            {/* User Icon */}
            <div className="flex flex-col items-center">
                <Image
                    src="/system-regular-8-account-hover-account.gif"
                    width={40}
                    height={40}
                    alt="User Icon"
                    className="rounded-full"
                />
                {address && (
                    <p className="mt-2 text-sm font-bold text-gray-700">
                        {formatAddress(address)}
                    </p>
                )}
            </div>

            {/* Balance Information */}
            <div className="text-right">
                <h2 className="text-lg font-bold text-black">Balance:</h2>
                <p className="text-sm font-bold text-gray-700">{balance} {token}</p>
            </div>
        </div>
    </div>
)}


            {address && (
                <div className="mt-8 text-center font-harmony">
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

            {! address && (
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
                    <div className="w-full px-3 mt-4">
                        {mode === 'send' && (
                            <>
                               <label className="block mb-2 text-lg font-semibold text-gray-700">Select Stablecoin:</label>
                                <select
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-4 py-3  font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c] focus:border-transparent mb-4"
                                >
                                    <option value="cUSD">cUSD</option>
                                    <option value="USDT">USDT</option>
                                </select>
                                
                            </>
                        )}

                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => handleModeChange('send')}
                                className={`px-4 py-2 font-bold text-white rounded-2xl flex items-center ${mode === 'send' ? 'bg-[#39a96c]' : 'bg-gray-500'}`}
                            >
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none" className="w-6 h-6 mr-2">
                    <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                                Send
                            </button>
                            <button
                                onClick={() => handleModeChange('buy')}
                                className={`px-4 py-2 ml-4 font-bold text-white rounded-2xl flex items-center ${mode === 'buy' ? 'bg-[#39a96c]' : 'bg-gray-500'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
                                </svg>
                                Buy
                            </button>
                        </div>
                        {/* Steps for BuyComponent */}
                        <div className="relative w-full pb-2 mb-4">
                            <div className="flex justify-between mb-2">
                                <div className="sr-only">Step 1</div>
                                <div className="sr-only">Step 2</div>
                                <div className="sr-only">Step 3</div>
                                {mode === 'buy' && <div className="sr-only">Step 4</div>}
                            </div>
                            <div className="absolute w-full h-3 bg-gray-200 rounded-full top-2"></div>
                            <div
                                className="absolute h-3 duration-300 bg-[#39a96c] rounded-full top-2 transition-width"
                                style={{ width: getProgressBarWidth() }}
                            ></div>
                        </div>
                        {mode === 'send' ? (
                            <SendCUSDComponent token={token} onModalOpen={handleModalOpen} step={step} setStep={setStep} />
                        ) : (
                            <BuyComponent step={step} setStep={setStep} />
                        )}
                    </div>
                </>
            )}

            <Modal isOpen={isModalOpen} onClose={handleModalClose} message={modalMessage} details={modalDetails} />

            {/* Floating Send Message Button */}
            <button
                className="fixed p-4 text-white bg-[#39a96c] rounded-full shadow-lg bottom-4 right-4 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={() => window.open('https://wa.me/<your-phone-number>?text=Hello%20there!', '_blank')}
            >   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
            <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
            </button>

        </div>
    );
}
