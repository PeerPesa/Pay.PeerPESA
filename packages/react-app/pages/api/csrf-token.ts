import { NextApiRequest, NextApiResponse } from 'next';
import csurf from 'csurf';
import { promisify } from 'util';

const csrf = csurf({ cookie: true });
const csrfMiddleware = promisify(csrf);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await csrfMiddleware(req, res);
    res.status(200).json({ csrfToken: req.csrfToken() });
  } catch (error) {
    res.status(500).json({ error: 'CSRF token error' });
  }
}
