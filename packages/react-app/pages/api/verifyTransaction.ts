// pages/api/verifyTransaction.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Flutterwave from 'flutterwave-node-v3';
import csurf from 'csurf';
import { promisify } from 'util';

const csrf = csurf({ cookie: true });
const csrfMiddleware = promisify(csrf);

const flw = new Flutterwave(process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY, process.env.NEXT_PUBLIC_FLW_SECRET_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await csrfMiddleware(req, res);
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  const { transactionId, amount, currency } = req.body;

  try {
    console.log(`Verifying transaction: ${transactionId}`);
    const response = await flw.Transaction.verify({ id: transactionId });
    console.log('Verification response:', response);

    if (response && response.data) {
      if (
        response.data.status === 'successful' &&
        response.data.amount === parseFloat(amount) &&
        response.data.currency === currency
      ) {
        res.status(200).json({ success: true });
      } else {
        console.log('Verification failed:', response.data);
        res.status(400).json({ success: false, message: 'Payment verification failed.' });
      }
    } else if (response && response.status === 'error' && response.message === 'No transaction was found for this id') {
      console.log('No transaction found for this ID:', transactionId);
      res.status(404).json({ success: false, message: 'No transaction found for this ID.' });
    } else {
      console.log('Invalid response structure:', response);
      res.status(500).json({ success: false, message: 'Invalid response from payment gateway.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing your payment.' });
  }
}
