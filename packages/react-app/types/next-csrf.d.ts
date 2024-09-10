declare module 'next-csrf' {
    import { NextApiRequest, NextApiResponse } from 'next';

    interface CsrfOptions {
        secret: string;
    }

    interface CsrfToken {
        csrfToken: (req: NextApiRequest, res: NextApiResponse) => string;
    }

    export function csrf(options: CsrfOptions): CsrfToken;
}
