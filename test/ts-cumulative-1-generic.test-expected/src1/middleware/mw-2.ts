import { RequestHandler } from 'express';

// tslint:disable-next-line no-unused-variable
export default function (options: any = {}): RequestHandler {
  return function mw2(req, res, next) {
    // tslint:disable-next-line no-console
    console.log('mw2 middleware is running');
    next();
  };
}
