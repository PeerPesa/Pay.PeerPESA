
import { NextApiRequest, NextApiResponse } from 'next';
import csurf from 'csurf';
import { promisify } from 'util';

const csrf = csurf({ cookie: true });
const csrfMiddleware = promisify(csrf);

interface ExtendedNextApiRequest extends NextApiRequest {
  csrfToken: () => string;
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  try {
    await csrfMiddleware(req, res);
    res.status(200).json({ csrfToken: req.csrfToken() });
  } catch (error) {
    console.error('CSRF token error:', error);
    res.status(500).json({ error: 'CSRF token error' });
  }
}
