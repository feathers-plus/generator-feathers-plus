import { RequestHandler } from 'express';

// tslint:disable-next-line no-unused-variable
export default function (options: any = {}): RequestHandler {
  return function mw1(req, res, next) {
    // tslint:disable-next-line no-console
    console.log('mw1 middleware is running');
    next();
  };
}
