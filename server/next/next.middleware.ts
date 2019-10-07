/** @format */

// #region Imports NPM
import { Injectable, NestMiddleware, Header } from '@nestjs/common';
import { Request, Response } from 'express';
// import nextI18NextMiddleware from 'next-i18next/middleware';
// #endregion
// #region Imports Local
// import { nextI18next } from '../lib/i18n-client';
import { NextService } from './next.service';
// #endregion

@Injectable()
export class NextMiddleware implements NestMiddleware {
  constructor(private readonly nextService: NextService) {}

  public async use(req: Request, res: Response, next: Function): Promise<void> {
    const app = await this.nextService.getApp();

    // eslint-disable-next-line no-debugger
    debugger;

    // #region Locale I18n
    // app.use(nextI18NextMiddleware(nextI18next));
    // #endregion

    res.render = (page: string, data?: any) => {
      return app.render(req, res, page, data);
    };

    next();
  }
}
