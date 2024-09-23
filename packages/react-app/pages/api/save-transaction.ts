
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(); 
    }

    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
        return res.status(403).json({ message: 'CSRF token missing' });
    }
    console.log('Request Body:', req.body);

    const { txHash, amount, receiver, currency, country, operator, status, userAddress } = req.body;
    if (!userAddress) {
        return res.status(400).json({ message: 'userAddress is missing' });
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('transactions');

        const result = await collection.insertOne({
            txHash,
            amount,
            receiver,
            currency,
            country,
            operator,
            status,
            userAddress,
            timestamp: new Date(),
        });

        res.status(200).json({ message: 'Transaction saved successfully', result });
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
