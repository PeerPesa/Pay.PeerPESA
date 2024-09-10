import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import Cors from 'cors';
const cors = Cors({
    methods: ['POST', 'GET', 'HEAD'],
});
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

    const { amount, receiver, currency, country, operator } = req.body;

    try {
        const account_bank = operator|| "MPS";
        const account_number = receiver;
        console.log('Initiating Flutterwave transfer:', { amount, account_number, currency, country, account_bank });

        const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
            account_bank: account_bank, 
            account_number: account_number,
            beneficiary_name: "jerry ouma",    //my name is just here temporary
            amount: amount,
            currency: currency,
            reference: `transfer_${Date.now()}`,
            callback_url:"https://2613-197-232-61-238.ngrok-free.app/api/flutterwave-callback",
            debit_currency: "NGN",
            meta: {
                sender:"peerpesa",
                sender_country: "ZA",
                mobile_number: "23457558595"
            }
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