import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countryCurrencyMapping } from '@/components/CountryCurrencyMapping';
import PrimaryButton from '@/components/Button';
import { useWeb3 } from '@/contexts/useWeb3';
import { getCsrfToken } from '@/utils/csrf';

// Declare FlutterwaveCheckout to avoid TypeScript errors
declare const FlutterwaveCheckout: any;

export const BuyComponent = ({ step, setStep }: { step: number, setStep: (step: number) => void }) => {
  const [buyToken, setBuyToken] = useState<string>('cUSD');
  const [amount, setAmount] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('Kenya');
  const [localCurrencyAmount, setLocalCurrencyAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('KES');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getUserAddress, sendTokenFromMyWallet, address } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadFlutterwaveScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.head.appendChild(script);
    };

    loadFlutterwaveScript();
    getUserAddress(); // Get the user's address when the component mounts
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
    setEmail(e.target.value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
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
        // Initiate token transfer
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
        // Send AJAX verification request to backend
        await verifyTransactionOnBackend(payment.transaction_id);
        modal.close();
      },
      onclose: async function (incomplete: any) {
        if (incomplete) {
          setErrorMessage("Payment was not successful. Please try again.");
          setLoading(false); // Set loading to false if payment was not successful
        }
      }
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <label className="text-lg font-semibold text-white">Select Token to Buy:</label>
            <select
              value={buyToken}
              onChange={(e) => setBuyToken(e.target.value)}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white rounded-2xl"
            >
              <option value="cUSD">cUSD</option>
              <option value="USDT">USDT</option>
            </select>
            <div className="pt-4">
              <PrimaryButton
                title="Next"
                onClick={() => setStep(2)}
                widthFull={true}
                disabled={!buyToken}
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
              onChange={handleAmountChange}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white rounded-2xl"
              placeholder={`Amount in ${buyToken}`}
            />
            <label className="text-lg font-semibold text-white">Select Country:</label>
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full min-w-[200px] px-4 py-3 font-bold text-black border border-gray-300 bg-white rounded-2xl"
            >
              {Object.keys(countryCurrencyMapping).map(country => (
                <option key={country} value={country}>
                  {country}
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
                disabled={!amount || !selectedCountry}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <label className="text-lg font-semibold text-white">Email:</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
              placeholder="Your email"
            />
            <label className="text-lg font-semibold text-white">Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full px-4 py-3 font-bold text-black bg-white border border-gray-300 rounded-2xl"
              placeholder="Your phone number"
            />
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => setStep(2)}
                widthFull={false}
              />
              <PrimaryButton
                title="Next"
                onClick={() => setStep(4)}
                widthFull={false}
                disabled={!email || !phoneNumber}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            {localCurrencyAmount !== null && (
              <p className="text-gray-200 w-full min-w-[301px] px-4 py-3 font-bold">
                You will pay {(localCurrencyAmount * 1.005).toFixed(2)} {currency}.
              </p>
            )}
            <p className="text-gray-200 w-full min-w-[301px] px-4 py-3 font-bold">
              Email: {email}
            </p>
            <p className="text-gray-200 w-full min-w-[301px] px-4 py-3 font-bold">
              Phone Number: {phoneNumber}
            </p>
            {errorMessage && (
              <p className="text-red-500">{errorMessage}</p>
            )}
            <div className="flex justify-between pt-6">
              <PrimaryButton
                title="Previous"
                onClick={() => setStep(3)}
                widthFull={false}
              />
              <PrimaryButton
                title={`Buy ${buyToken}`}
                onClick={makePayment}
                widthFull={false}
                loading={loading}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <p className="text-lg font-semibold text-white">Transaction Complete!</p>
            <p className="text-gray-200">Thank you for your purchase.</p>
            <div className="pt-4">
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
      <h2 className="text-2xl font-bold text-white">Buy {buyToken}</h2>
      {renderStepContent()}
    </div>
  );
};
export default BuyComponent;
