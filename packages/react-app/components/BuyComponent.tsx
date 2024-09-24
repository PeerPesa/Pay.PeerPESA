import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countryCurrencyMapping } from '@/components/CountryCurrencyMapping';
import PrimaryButton from '@/components/Button';
import Image from "next/image";
import { useWeb3 } from '@/contexts/useWeb3';
import { getCsrfToken } from '@/utils/csrf';
import { Countries } from '@celo/phone-utils';
declare const FlutterwaveCheckout: any;
export const BuyComponent = ({ step, setStep }: { step: number, setStep: (step: number) => void }) => {
  const [buyToken, setBuyToken] = useState<string>('cUSD');
  const [amount, setAmount] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('Kenya');
  const [localCurrencyAmount, setLocalCurrencyAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('KES');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getUserAddress, sendTokenFromMyWallet, address } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);
  const [transition, setTransition] = useState<boolean>(false);
  const [direction, setDirection] = useState<string>('right');

  const countries = new Countries('en-us');

  useEffect(() => {
    const loadFlutterwaveScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.head.appendChild(script);
    };

    loadFlutterwaveScript();
    getUserAddress(); 
  }, [getUserAddress]);

  useEffect(() => {
    const currencyCode = countryCurrencyMapping[selectedCountry];
    setCurrency(currencyCode);
  }, [selectedCountry]);

  useEffect(() => {
    if (currency && amount) {
      axios.get(`https://openexchangerates.org/api/latest.json?app_id=${process.env.NEXT_PUBLIC_OPENEXCHANGERATES_APP_ID}`)
        .then(response => {
          const rates = response.data.rates;
          const usdToSelectedCurrency = rates[currency];
          const converted = parseFloat(amount) * usdToSelectedCurrency;
          setLocalCurrencyAmount(converted);
        })
        .catch(error => {
          console.error('Error converting currency:', error);
        });
    }
  }, [currency, amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (value.length < 7 || value.length > 15) {
      setPhoneError("Phone number must be between 7 and 15 digits.");
    } else {
      setPhoneError("");
    }
  };

  const verifyTransactionOnBackend = async (transactionId: string) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await axios.post('/api/verifyTransaction', {
        transactionId,
        amount,
        currency,
      }, {
        headers: {
          'CSRF-Token': csrfToken,
        },
      });

      if (response.data.success) {
        const txHash = await sendTokenFromMyWallet(amount, buyToken, address as `0x${string}`);
        console.log(`Transaction successful with hash: ${txHash}`);
        setErrorMessage(null);
        setStep(5); 
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setErrorMessage("Flutterwave account needs verification. Please contact support.");
    } finally {
      setLoading(false); 
    }
  };

  const makePayment = () => {
    if (localCurrencyAmount === null) return;

    setLoading(true); 

    const totalAmount = localCurrencyAmount * 1.005; // have 0.5% to the localCurrencyAmount

    const modal = FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-02b9b5fc6406bd4a41c3ff141cc45e93-X",
      tx_ref: `txref-${Date.now()}`,
      amount: totalAmount,
      currency: currency,
      payment_options: "card, banktransfer, ussd",
      meta: {
        source: "docs-inline-test",
        consumer_mac: "92a3-912ba-1192a",
      },
      customer: {
        email: email,
        phone_number: phoneNumber,
      },
      customizations: {
        title: "PeerPesa",
        description: "Buy Stable Coin",
        color: "#FF5733",
        logo: "https://peerpesa.co/assets/images/logoIcon/favicon.png",
      },
      callback: async function (payment: any) {
        await verifyTransactionOnBackend(payment.transaction_id);
        modal.close();
      },
      onclose: async function (incomplete: any) {
        if (incomplete) {
          setErrorMessage("Payment was not successful. Please try again.");
          setLoading(false); 
        }
      }
    });
  };

  const handleStepChange = (newStep: number, direction: string) => {
    setDirection(direction);
    setTransition(true);
    setTimeout(() => {
      setStep(newStep);
      setTransition(false);
    }, 150); 
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'}`}>
            <label className="text-base font-semibold text-gray-500">Select Token to Buy:</label>
            <select
              value={buyToken}
              onChange={(e) => setBuyToken(e.target.value)}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
            >
              <option value="cUSD">cUSD</option>
              <option value="USDT">USDT</option>
            </select>
            <p className="text-sm text-green-600">select token to buy </p>
            <div className="pt-4">
              <PrimaryButton
                title="Next"
                onClick={() => handleStepChange(2, 'right')}
                widthFull={true}
                disabled={!buyToken}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'}`}>
            <label className="text-base font-semibold text-gray-500">Enter Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder={`Amount in ${buyToken}`}
            />
            <p className="text-sm text-green-600">The of {buyToken} you want to buy</p>
            <label className="text-base font-semibold text-gray-500">Select Country:</label>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
            >
              {Object.keys(countryCurrencyMapping).map(country => {
                const countryData = countries.getCountry(country);
                return (
                  <option key={country} value={country}>
                    {countryData?.emoji} {country}
                  </option>
                );
              })}
            </select>
            <p className="text-sm text-green-600">choose your country</p>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => handleStepChange(1, 'left')}
                widthFull={false}
                className="w-1/3 mr-4" 
              />
              <PrimaryButton
                title="Next"
                onClick={() => handleStepChange(3, 'right')}
                widthFull={false}
                className="w-1/3 ml-4" 
                disabled={!amount || !selectedCountry}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'}`}>
            <label className="text-base font-semibold text-gray-500">Email:</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder="Your email"
            />
            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            <p className="text-sm text-green-600">Provide a valid email</p>
            <label className="text-base font-semibold text-gray-500">Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#39a96c]"
              placeholder="Your phone number"
            />
            {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
            <p className="text-sm text-green-600">We will send you an ussd or stk</p>
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => handleStepChange(2, 'left')}
                widthFull={false}
                className="w-1/3 mr-4" 
              />
              <PrimaryButton
                title="Next"
                onClick={() => handleStepChange(4, 'right')}
                widthFull={false}
                className="w-1/3 ml-4" 
                disabled={!email || !phoneNumber || emailError || phoneError ? true : false}
              
              />
            </div>
          </div>
        );
      case 4:
        return (<div className={`font-harmony transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'} w-full`}>
        {localCurrencyAmount !== null && (
          <p className="w-full py-3 -ml-2 font-bold text-gray-500">  {/* Removed px-4 and added negative margin */}
            You will pay: <span className="text-green-600">{(localCurrencyAmount * 1.005).toFixed(2)} {currency}.</span> 
          </p>
        )}
        <p className="w-full py-3 -ml-2 font-bold text-gray-500">  {/* Removed px-4 and added negative margin */}
          Email: <span className="text-green-600">{email}</span> 
        </p>
        <p className="w-full py-3 -ml-2 font-bold text-gray-500">  {/* Removed px-4 and added negative margin */}
          Phone Number: <span className="text-green-600">{phoneNumber}</span> 
        </p>
        {errorMessage && (
          <p className="-ml-2 text-red-500"> {/* Added negative margin */}
            {errorMessage}
          </p>
        )}
        <div className="flex justify-between pt-6">
          <PrimaryButton
            title="Previous"
            onClick={() => handleStepChange(3, 'left')}
            widthFull={false}
            className="w-1/3 mr-4" 
          />
          <PrimaryButton
            title={`Buy`}
            onClick={makePayment}
            widthFull={false}
            className="w-1/3 ml-4" 
            loading={loading}
          />
        </div>
        <p className="mt-3 -ml-2 text-sm font-bold text-black"> {/* Added negative margin */}
          Note:
        </p>
        <p className="-ml-2 text-sm text-green-600"> {/* Added negative margin */}
          You will be redirected to Flutterwave to make your payment.
        </p>
      </div>
      
        );
      case 5:
        return (
          <div className={`transition-transform duration-150 ease-in-out ${transition ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : 'translate-x-0 opacity-100'} w-full  px-4 py-3 font-harmony`}>
            <p className="text-lg font-semibold text-gray-800">Transaction Complete!</p>
            <div className="flex justify-center pt-6">
                 <Image
                   src="/wired-flat-37-approve-checked-simple-hover-pinch.gif"
                   alt="Success"
                   width={160} 
                   height={200} 
                  className="object-cover"
                 />
               </div>
            <p className="text-gray-600">Thank you for your purchase.</p>
            <div className="pt-4">
              <PrimaryButton
                title="Finish"
                onClick={() => handleStepChange(1, 'left')}
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
    <div className="flex flex-col max-w-sm p-6 space-y-4 bg-white rounded-2xl shadow-3xl shadow-black/50 font-harmony">
      <h2 className="text-lg font-bold text-gray-500">Buy {buyToken}</h2>
      {renderStepContent()}
    </div>
  );
};

export default BuyComponent;
