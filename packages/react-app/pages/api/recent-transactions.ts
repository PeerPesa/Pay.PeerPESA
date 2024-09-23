// pages/api/recent-transactions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end(); 
    }

    const { userAddress } = req.query;
    if (!userAddress) {
        return res.status(400).json({ message: 'User address is required' });
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('transactions');
        console.log('Querying transactions for userAddress:', userAddress);

        const transactions = await collection.find({ userAddress }).toArray();
        console.log('Fetched transactions:', transactions);

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
