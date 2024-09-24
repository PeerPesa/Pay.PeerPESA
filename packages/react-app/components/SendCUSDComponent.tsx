import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from "next/image";
import { countryCurrencyMapping } from '@/components/CountryCurrencyMapping';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from '@/contexts/useWeb3';
import { getCsrfToken } from '@/utils/csrf';
import { Countries } from '@celo/phone-utils';
import { mobileOperators } from './mobileOperators';

interface SendCUSDComponentProps {
  token: string;
  onModalOpen: (message: string, details: any) => void;
  step: number;
  setStep: (step: number) => void;
}

export const SendCUSDComponent = ({ token, onModalOpen, step, setStep }: SendCUSDComponentProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Kenya');
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [mobileOperator, setMobileOperator] = useState<string>('');
  const [signingLoading, setSigningLoading] = useState<boolean>(false);
  const [tx, setTx] = useState<any>(null);
  const [currency, setCurrency] = useState<string>('KES');
  const [totalAmount, setTotalAmount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [operators, setOperators] = useState<{ name: string, code: string, logo: string }[]>([]);
  const [transition, setTransition] = useState<boolean>(false);
  const [direction, setDirection] = useState<string>('right');
  const [phoneError, setPhoneError] = useState<string>('');

  const { sendToken, address, getUserAddress, checkTransactionStatus, getCountryPrefix, getMobileOperators } = useWeb3();

  const countries = new Countries('en-us');

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

  const validatePhoneNumber = (number: string) => {
    const phoneNumberLength = number.replace(/\D/g, '').length;
    return phoneNumberLength >= 7 && phoneNumberLength <= 15;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPhoneNumber(input);

    if (validatePhoneNumber(input)) {
      setPhoneError('');
    } else {
      setPhoneError('Phone number must be between 7 and 15 digits.');
    }
  };

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
          name: name,
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
  
        // Updated status logic to treat 'NEW' and 'COMPLETED' as successful
        const status = (data.status === 'success' || data.status === 'NEW' || data.status === 'COMPLETED')
          ? 'COMPLETED'
          : 'PENDING';
        
        await axios.post('/api/save-transaction', {
          txHash: txHash,
          amount: convertedAmount,
          receiver: `${getCountryPrefix(selectedCountry)}${phoneNumber}`,
          currency: currency,
          country: selectedCountry,
          operator: mobileOperator,
          status: status, // Updated status
          userAddress: address,
        }, {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true,
        });
  
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
    
  const handleStepChange = (newStep: number, direction: string) => {
    setDirection(direction);
    setTransition(true);
    setTimeout(() => {
      setStep(newStep);
      setTransition(false);
    }, 150); // Duration of the transition
  };


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className={` font-harmony w-full transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'}`}>
           <label className="text-base font-semibold text-gray-500">Choose destination</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
            >
              {Object.keys(countryCurrencyMapping).map((country) => {
                const countryData = countries.getCountry(country);
                return (
                  <option key={country} value={country}>
                    {countryData?.emoji} {country}
                  </option>
                );
              })}
            </select>
            <p className="text-sm text-green-600">country you want to send {token}</p>
            <label className="text-base font-semibold text-gray-500">Enter Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder={`Amount in ${token}`}
            />
            <p className="text-sm text-green-600">The value of above {token} is : {convertedAmount} {currency}</p>
            <div className="pt-4">
              <PrimaryButton
                title="Next"
                onClick={() => handleStepChange(2, 'right')}
                widthFull={true}
                disabled={!selectedCountry || !amount}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'}`}>
             <label className="text-base font-semibold text-gray-500">Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder={`Names`}
            />
            <p className="text-sm text-green-600">Receiver's name</p>
           
            <label className="text-base font-semibold text-gray-500">Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder="Your phone number"
            />
            {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
            <p className="text-sm text-green-600">Recipient phone number.</p>
            <label className="text-base font-semibold text-gray-500">Select Mobile Operator:</label>
            <div className="grid grid-cols-2 gap-4 pl-5">
              {operators.map(operator => (
                <div
                  key={operator.code}
                  className={`flex items-center justify-center w-16  h-12 rounded-xl cursor-pointer ${mobileOperator === operator.code ? 'border-2 border-green-600' : 'border-0'}`}
                  onClick={() => setMobileOperator(operator.code)}
                >
                  <img
                    src={operator.logo}
                    alt={`${operator.name} logo`}
                    className="object-contain w-16 h-18 rounded-2xl" // Adjusted to fit within the container
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => handleStepChange(1, 'left')}
                widthFull={false}
                className="w-1/3 mr-4" // Adjust width and margin
              />
              <PrimaryButton
                title="Next"
                onClick={() => handleStepChange(3, 'right')}
                widthFull={false}
                className="w-1/3 ml-4" // Adjust width and margin
                disabled={!amount || !phoneNumber || !mobileOperator || phoneError  ? true : false}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className={`max-w-sm font-harmony relative transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'} w-full py-3 text-base font-semibold text-gray-800`}>
  <div className="absolute top-0 right-0 mr-0">
    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M16 14C16 14.8284 16.6716 15.5 17.5 15.5C18.3284 15.5 19 14.8284 19 14C19 13.1716 18.3284 12.5 17.5 12.5C16.6716 12.5 16 13.1716 16 14Z" color="#000000" fill="none" strokeWidth="1.5" />
      <path d="M18.9 8C18.9656 7.67689 19 7.34247 19 7C19 4.23858 16.7614 2 14 2C11.2386 2 9 4.23858 9 7C9 7.34247 9.03443 7.67689 9.10002 8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7.99324H16C18.8284 7.99324 20.2426 7.99324 21.1213 8.87234C22 9.75145 22 11.1663 22 13.9961V15.9971C22 18.8269 22 20.2418 21.1213 21.1209C20.2426 22 18.8284 22 16 22H10C6.22876 22 4.34315 22 3.17157 20.8279C2 19.6557 2 17.7692 2 13.9961V11.9952C2 8.22211 2 6.33558 3.17157 5.16344C4.11466 4.2199 5.52043 4.03589 8 4H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
  
  {convertedAmount && (
    <p className="-ml-2 text-base text-gray-600 break-words">
      Sending Amount: <span className="text-green-600">{parseFloat(convertedAmount).toFixed(2)} {currency}</span>
    </p>
  )}
  
  {totalAmount && (
    <p className="-ml-2 text-base text-gray-600 break-words">
      Deducted Amount: <span className="text-green-600">{parseFloat(totalAmount).toFixed(2)} {token}</span>
    </p>
  )}
  
  <p className="-ml-2 text-base text-gray-600 break-words">
    Phone Number: <span className="text-green-600">{phoneNumber}</span>
  </p>
  
  <p className="-ml-2 text-base text-gray-600 break-words">
    Country: <span className="text-green-600">{selectedCountry}</span>
  </p>
  
  <p className="-ml-2 text-base text-gray-600 break-words">
    Mobile Operator: <span className="text-green-600">{mobileOperator}</span>
  </p>
  
  {error && <p className="-ml-2 text-red-500 break-words">{error}</p>}
  
  <div className="flex justify-between pt-6">
    <PrimaryButton
      title="Previous"
      onClick={() => handleStepChange(2, 'left')}
      widthFull={false}
      className="w-1/3 mr-2"
      style={{ minWidth: '80px' }}
    />
    
    <PrimaryButton
      title="Send"
      onClick={sendingToken}
      widthFull={false}
      className={`w-1/3 ml-2 ${!address || signingLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={signingLoading || !address} // Button disabled during loading
      style={{ minWidth: '80px' }} 
    />
  </div>
  
  {/* Loader below the button */}
  {signingLoading && (
    <div className="flex justify-center mt-4">
      <img
        src="/icons8-loading-circle.gif" // Replace with your loader GIF path
        alt="Loading..."
        className="w-8 h-8"
      />
    </div>
  )}
  
  {!address && <p className="-ml-2 text-red-500 break-words">Address is null. Please make sure the user is connected.</p>}
</div>        
        );
      case 4:
        return (
          <div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'} w-full `}>
            <p className="w-full px-0 py-3 text-lg font-semibold text-gray-800">
              {txStatus}
            </p>
            <div className="flex justify-center pt-6">
                 <Image
                   src="/wired-flat-37-approve-checked-simple-hover-pinch.gif" // Replace with your image path
                   alt="Success"
                   width={120} 
                   height={200} 
                  className="object-cover"
                 />
               </div>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Finish"
                onClick={() => handleStepChange(1, 'left')}
                widthFull={true}
                style={{ minWidth: '80px' }}
                disabled={false}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col max-w-sm p-8 space-y-4 bg-white rounded-2xl shadow-3xl shadow-black/50 font-harmony">
    <h2 className="text-lg font-bold text-gray-500">Send Money</h2>
    {renderStepContent()}
  </div>
  
  );
};
export default SendCUSDComponent;