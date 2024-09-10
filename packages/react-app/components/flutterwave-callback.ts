// pages/api/flutterwave-callback.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Handle the callback from Flutterwave
    const { status, data } = req.body;

    if (status === 'successful') {
        // Process the successful transaction
        console.log('Transaction successful:', data);
        return res.status(200).json({ message: 'Transaction processed successfully' });
    } else {
        // Handle other statuses or errors
        console.error('Transaction failed or pending:', data);
        return res.status(400).json({ message: 'Transaction failed or pending', data });
    }
}
