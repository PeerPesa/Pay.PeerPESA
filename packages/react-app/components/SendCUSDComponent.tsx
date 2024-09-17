import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countryCurrencyMapping } from '@/components/CountryCurrencyMapping';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from '@/contexts/useWeb3';
import { getCsrfToken } from '@/utils/csrf';

interface SendCUSDComponentProps {
  token: string;
  onModalOpen: (message: string, details: any) => void;
  step: number;
  setStep: (step: number) => void;
}

export const SendCUSDComponent = ({ token, onModalOpen, step, setStep }: SendCUSDComponentProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Kenya');
  const [amount, setAmount] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [mobileOperator, setMobileOperator] = useState<string>('');
  const [signingLoading, setSigningLoading] = useState<boolean>(false);
  const [tx, setTx] = useState<any>(null);
  const [currency, setCurrency] = useState<string>('KES');
  const [totalAmount, setTotalAmount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [operators, setOperators] = useState<{ name: string, code: string }[]>([]);

  const { sendToken, address, getUserAddress, checkTransactionStatus, getCountryPrefix, getMobileOperators } = useWeb3();

  useEffect(() => {
    getUserAddress();
  }, [getUserAddress]);

  useEffect(() => {
    const currencyCode = countryCurrencyMapping[selectedCountry];
    setCurrency(currencyCode);
    const operators = getMobileOperators(selectedCountry);
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
      const transactionFee = parseFloat(amount) * 0.02;
      const total = (parseFloat(amount) + transactionFee).toFixed(4);
      setTotalAmount(total); 
    } else {
      setTotalAmount(null);
    }
  }, [amount]);

  async function sendingToken() {
    setSigningLoading(true);
    setError(null);
    try {
      if (!address) {
        throw new Error('Address is null. Please make sure the user is connected.');
      }

      if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
        throw new Error('Invalid total amount. Please enter a valid amount.');
      }
      const txHash = await sendToken(totalAmount, token);
      setTx(txHash);
      const isSuccess = await checkTransactionStatus(txHash);
      setTxStatus(isSuccess ? "Transaction successful" : "Transaction failed");  
      if (isSuccess) {
        const csrfToken = await getCsrfToken();
        const response = await axios.post('/api/flutterwave-transfer', {
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

        const { data } = response;
        console.log('Transfer Response:', data);
        const modalData = {
          status: data.status,
          id: data.data.id,
          currency: data.data.currency,
          account_number: data.data.account_number,
          reference: data.data.reference,
          sender: data.data.meta && data.data.meta[0] ? data.data.meta[0].Sender : 'N/A',
          amount: convertedAmount, 
        };
        onModalOpen("Transaction Successful", modalData); 
        setStep(4); 
      } else {
        onModalOpen("Transaction Failed", null);
      }
    } catch (error) {
      console.error('Error sending token:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
      onModalOpen("Transaction Error", error); 
    } finally {
      setSigningLoading(false);
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <label className="text-lg font-semibold text-white ">Select Country You want to send {token}:</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
            >
              {Object.keys(countryCurrencyMapping).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <div className="pt-4">
              <PrimaryButton
                title="Next"
                onClick={() => setStep(2)}
                widthFull={true}
                disabled={!selectedCountry}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <label className="text-lg font-semibold text-white">Enter Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
              placeholder={`Amount in ${token}`}
            />
            <label className="text-lg font-semibold text-white">Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
              placeholder="Your phone number"
            />
            <label className="text-lg font-semibold text-white">Select Mobile Operator:</label>
            <select
              value={mobileOperator}
              onChange={(e) => setMobileOperator(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
            >
              <option value="" disabled>Select Operator</option>
              {operators.map(operator => (
                <option key={operator.code} value={operator.code}>
                  {operator.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => setStep(1)}
                widthFull={false}
              />
              <PrimaryButton
                title="Next"
                onClick={() => setStep(3)}
                widthFull={false}
                disabled={!amount || !phoneNumber || !mobileOperator}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-lg font-semibold text-white w-full min-w-[301px] px-4 py-3">
            {convertedAmount && (
              <p className="text-gray-200">
                Sending Amount: {convertedAmount} {currency}.
              </p>
            )}
            {totalAmount && (
              <p className="text-gray-200">
                Total Amount to Deduct: {totalAmount} {token}.
              </p>
            )}
            <p className="text-gray-200">
              Phone Number: {phoneNumber}
            </p>
            <p className="text-gray-200">
              Country: {selectedCountry}
            </p>
            <p className="text-gray-200">
              Mobile Operator: {mobileOperator}
            </p>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => setStep(2)}
                widthFull={false}
              />
              <PrimaryButton
                title="Send"
                onClick={sendingToken}
                widthFull={false}
                disabled={signingLoading || !address}
                loading={signingLoading}
                className={!address ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
            {txStatus && <p className="text-white">{txStatus}</p>}
            {!address && <p className="text-red-500">Address is null. Please make sure the user is connected.</p>}
          </div>
        );
      case 4:
        return (
          <div>
            <p className="text-lg font-semibold text-white w-full min-w-[301px] px-4 py-3">
              {txStatus}
            </p>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Finish"
                onClick={() => setStep(1)}
                widthFull={true}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white">Send</h2>
      {renderStepContent()}
    </div>
  );
};

export default SendCUSDComponent;
