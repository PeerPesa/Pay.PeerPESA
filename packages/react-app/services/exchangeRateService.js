import axios from 'axios';

const API_KEY = process.env.REACT_APP_EXCHANGE_RATE_API_KEY; // Ensure this key is in your .env file
const BASE_URL = 'https://openexchangerates.org/api/latest.json';

export const getExchangeRate = async (currency, baseCurrency = 'USD') => {
    try {
        const response = await axios.get(`${BASE_URL}latest.json`, {
            params: {
                app_id: API_KEY,
                base: baseCurrency, // Base currency set dynamically
                symbols: currency,  // Target currency set dynamically
            },
        });
        const rates = response.data.rates;
        return rates[currency];
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
};
