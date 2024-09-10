import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { countryCurrencyMapping } from './CountryCurrencyMapping';

const CurrencyConverter = () => {
  const [selectedCountry, setSelectedCountry] = useState('United States'); 
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const currencyCode = countryCurrencyMapping[selectedCountry];
    setCurrency(currencyCode);
  }, [selectedCountry]);

  useEffect(() => {
    if (currency && amount) {
      axios.get(`https://openexchangerates.org/api/latest.json?app_id=`)
        .then(response => {
          const rates = response.data.rates;
          const usdToSelectedCurrency = rates[currency];
          const converted = amount * usdToSelectedCurrency;
          setConvertedAmount(converted);
        })
        .catch(error => {
          console.error('Error converting currency:', error);
        });
    }
  }, [currency, amount]);

  return (
    <div>
      <h2>Currency Converter</h2>

      <div>
        <label>Amount in USD:</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div>
        <label>Select Country:</label>
        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
        >
          {Object.keys(countryCurrencyMapping).map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {convertedAmount && (
        <p>
          {amount} USD is approximately {convertedAmount.toFixed(2)} {currency}.
        </p>
      )}
    </div>
  );
};

export default CurrencyConverter;
