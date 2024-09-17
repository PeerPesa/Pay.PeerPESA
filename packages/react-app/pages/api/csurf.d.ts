declare module 'csurf' {
    import { RequestHandler } from 'express';
  
    interface Options {
      value?: (req: Request) => string;
      cookie?: boolean | { [key: string]: any };
      ignoreMethods?: string[];
      sessionKey?: string;
    }
  
    function csurf(options?: Options): RequestHandler;
  
    export = csurf;
  }
 