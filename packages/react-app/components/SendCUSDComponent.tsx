import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/useWeb3';
import axios from 'axios';
import { countryCurrencyMapping } from '@/components/CountryCurrencyMapping';
import { getCsrfToken } from '@/utils/csrf';

interface PrimaryButtonProps {
    title: string;
    onClick: () => void;
    widthFull?: boolean;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}
export function PrimaryButton({
    title,
    onClick,
    widthFull = false,
    disabled,
    loading,
    className = ""
}: PrimaryButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled ?? loading}
            className={`${widthFull ? "w-full" : "px-4"} ${className} font-bold bg-blue-600 rounded-2xl text-white py-3 flex justify-center items-center transition duration-300 hover:bg-blue-700`}
        >
            {loading ? <>Loading...</> : title}
        </button>
    );
}
export function SendCUSDComponent() {
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [amount, setAmount] = useState<string>("");
    const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [mobileOperator, setMobileOperator] = useState<string>("");
    const [signingLoading, setSigningLoading] = useState<boolean>(false);
    const [tx, setTx] = useState<any>(null);
    const [currency, setCurrency] = useState<string>('');
    const [totalAmount, setTotalAmount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const [operators, setOperators] = useState<{ name: string, code: string }[]>([]);

    const { sendCUSD, address, getUserAddress, checkTransactionStatus, getCountryPrefix, getMobileOperators } = useWeb3();

    useEffect(() => {
        getUserAddress();
    }, [getUserAddress]);

    useEffect(() => {
        const currencyCode = countryCurrencyMapping[selectedCountry];
        setCurrency(currencyCode);
        const operators = getMobileOperators(selectedCountry);
        console.log('Operators:', operators);
        setOperators(operators);
    }, [selectedCountry, getMobileOperators]);

    useEffect(() => {
        if (currency && amount) {
            axios.get(`https://openexchangerates.org/api/latest.json?app_id=${process.env.NEXT_PUBLIC_OPENEXCHANGERATES_APP_ID}`)
                .then(response => {
                    const rates = response.data.rates;
                    const usdToSelectedCurrency = rates[currency];
                    const converted = (parseFloat(amount) * usdToSelectedCurrency).toFixed(2);
                    setConvertedAmount(converted);
                })
                .catch(error => {
                    console.error('Error converting currency:', error);
                    setError('Failed to fetch conversion rates.');
                });
        } else {
            setConvertedAmount(null);
        }
    }, [currency, amount]);

    useEffect(() => {
        if (amount) {
            const transactionFee = parseFloat(amount) * 0.002;
            const total = (parseFloat(amount) + transactionFee).toFixed(2);
            setTotalAmount(total);
        } else {
            setTotalAmount(null);
        }
    }, [amount]);

    async function sendingCUSD() {
        setSigningLoading(true);
        setError(null);
        try {
            if (!address) {
                throw new Error('Address is null. Please make sure the user is connected.');
            }

            if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
                throw new Error('Invalid amount. Please enter a positive number.');
            }

            const txHash = await sendCUSD(amount);
            setTx(txHash);
            const isSuccess = await checkTransactionStatus(txHash);
            setTxStatus(isSuccess ? "Transaction successful" : "Transaction failed");

            if (isSuccess) {
                const csrfToken = await getCsrfToken();
                await axios.post('/api/flutterwave-transfer', {
                    amount: convertedAmount,
                    receiver: `${getCountryPrefix(selectedCountry)}${phoneNumber}`,
                    currency: currency,
                    country: selectedCountry,
                    operator: mobileOperator,
                }, {
                    headers: {
                        'X-CSRF-Token': csrfToken,
                    },
                    withCredentials: true,
                });
            }
        } catch (error) {
            console.error('Error sending cUSD:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setSigningLoading(false);
        }
    }

    const isFormValid = selectedCountry && amount && phoneNumber && mobileOperator;

    return (
        <div className="flex flex-col p-4 space-y-4 bg-gray-800 rounded-lg shadow-lg">
            <label className="text-lg font-semibold text-white">Select Country:</label>
            <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
                required
            >
                <option value="" disabled>Select Country</option>
                {Object.keys(countryCurrencyMapping).map(country => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>

            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to send in cUSD"
                className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
                min="0"
                required
            />

            <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
                required
            />

            <label className="text-lg font-semibold text-white">Select Mobile Operator:</label>
            <select
                value={mobileOperator}
                onChange={(e) => setMobileOperator(e.target.value)}
                className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
                required
            >
                <option value="" disabled>Select Operator</option>
                {operators.map(operator => (
                    <option key={operator.code} value={operator.code}>
                        {operator.name}
                    </option>
                ))}
            </select>

            {convertedAmount && (
                <p className="text-gray-200">
                    Sending Amount: {convertedAmount} {currency}.
                </p>
            )}

            {totalAmount && (
                <p className="text-gray-200">
                    Total Amount to Deduct: {totalAmount} cUSD.
                </p>
            )}

            {error && <p className="text-red-500">{error}</p>}

            <PrimaryButton
                title="Send"
                onClick={sendingCUSD}
                widthFull={true}
                disabled={signingLoading || !address || !isFormValid}
                loading={signingLoading}
                className={!address ? "opacity-50 cursor-not-allowed" : ""}
            />

            {txStatus && <p className="text-white">{txStatus}</p>}

            {!address && <p className="text-red-500">Address is null. Please make sure the user is connected.</p>}
        </div>
    );
}
