// components/flutterwave-transfer.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
    methods: ['POST', 'GET', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { amount, receiver, currency, country } = req.body;

    try {
        console.log('Initiating Flutterwave transfer:', { amount, receiver, currency, country });

        const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
            account_bank: "MOBILEMONEY",
            account_number: receiver,
            amount: amount,
            currency: currency,
            reference: `transfer_${Date.now()}`,
            callback_url: "https://yourdomain.com/api/flutterwave-callback",
            debit_currency: "USD"
        }, {
            headers: {
                'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Flutterwave transfer response:', response.data);

        return res.status(200).json(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error initiating Flutterwave transfer:', error.response ? error.response.data : error.message);
            return res.status(500).json({ message: 'Internal server error', error: error.response ? error.response.data : error.message });
        } else {
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'Internal server error', error: String(error) });
        }
    }
}
