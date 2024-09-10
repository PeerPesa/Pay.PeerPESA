import React, { useState } from 'react';
import axios from 'axios';

interface TransferFormProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess, onError }) => {
  const [currency, setCurrency] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Processing transaction...');

    try {
      // Get the CSRF token from the meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      const response = await axios.post('http://127.0.0.1:8000/transfer', {
        currency,
        phoneNumber,
        amount,
      }, {
        headers: {
          'X-CSRF-TOKEN': csrfToken || '', // Add CSRF token to the request headers
        },
      });

      if (response.data.status === 'success') {
        setMessage('Transaction successful!');
        if (onSuccess) onSuccess(response.data.message);
      } else {
        setMessage(`Transaction failed: ${response.data.details}`);
        if (onError) onError(response.data.details);
      }
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      setMessage(`An error occurred: ${error.response?.data?.message || 'Please try again.'}`);
      if (onError) onError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Currency:</label>
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Phone Number:</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </div>
      <button type="submit">Send Money</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default TransferForm;
