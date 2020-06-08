/** @format */

//#region Imports NPM
import http from 'http';
import https, { ServerOptions } from 'https';
import fs from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, HttpException } from '@nestjs/common';
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { RenderService, RenderModule } from 'nest-next';
import { ParsedUrlQuery } from 'querystring';
import Next from 'next';
// import { v4 as uuidv4 } from 'uuid';
import nextI18NextMiddleware from 'next-i18next/middleware';
import passport from 'passport';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Logger, PinoLogger } from 'nestjs-pino';
import 'reflect-metadata';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { nextI18next } from '@lib/i18n-client';
import sessionRedis from '@back/shared/session-redis';
import session from '@back/shared/session';
import { AppModule } from '@back/app.module';
import { pinoOptions } from './shared/pino.options';
//#endregion

async function bootstrap(config: ConfigService): Promise<void> {
  let httpsServer: boolean | ServerOptions = false;

  //#region NestJS options
  const logger = new Logger(new PinoLogger(pinoOptions(config.get<string>('LOGLEVEL'))), {});
  const nestjsOptions: NestApplicationOptions = {
    cors: {
      credentials: true,
    },
    logger,
  };
  //#endregion

  //#region Create NestJS app
  if (
    !!config.get<number>('PORT_SSL') &&
    fs.lstatSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure')).isDirectory()
  ) {
    const secureDirectory = fs.readdirSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure'));
    if (secureDirectory.filter((file) => file.includes('private.key') || file.includes('private.crt')).length > 0) {
      logger.log('Using HTTPS certificate', 'Bootstrap');

      httpsServer = {
        requestCert: false,
        rejectUnauthorized: false,
        key: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.key')),
        cert: fs.readFileSync(resolve(__dirname, __DEV__ ? '../../..' : '..', 'secure/private.crt')),
      };
    } else {
      logger.error(
        'There are not enough files "private.crt" and "private.key" in "secure" directory."',
        undefined,
        'Bootstrap',
      );
    }
  }
  const server = express();
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    nestjsOptions,
  );
  app.useLogger(logger);
  //#endregion

  //#region X-Response-Time
  // app.use(responseTime());
  //#endregion

  //#region Improve security
  // app.use(helmet.ieNoOpen());

  // TODO: Как сделать nonce ?
  // const nonce = (req: Request, res: Response): string => `'nonce-${res.locals.nonce}'`;

  const scriptSource = ["'self'", "'unsafe-inline'" /* , nonce */];
  const styleSource = ["'unsafe-inline'", "'self'"];
  const imgSource = ["'self'", 'data:', 'blob:'];
  const fontSource = ["'self'", 'data:'];
  const frameSource = ["'self'"];
  const defaultSource = ["'self'"];

  const mailUrl = config.get<string>('MAIL_URL');
  if (mailUrl.match(/^http/i)) {
    imgSource.push(mailUrl);
    fontSource.push(mailUrl);
    frameSource.push(mailUrl);
    defaultSource.push(mailUrl);
  }

  const newsUrl = config.get<string>('NEWS_URL');
  if (newsUrl.match(/^http/i)) {
    imgSource.push(newsUrl);
    fontSource.push(newsUrl);
    frameSource.push(newsUrl);
    defaultSource.push(newsUrl);
  }

  const newsApiUrl = config.get<string>('NEWS_API_URL');
  if (newsApiUrl.match(/^http/i)) {
    imgSource.push(newsApiUrl);
  }

  const meetingUrl = config.get<string>('MEETING_URL');
  if (meetingUrl.match(/^http/i)) {
    frameSource.push(meetingUrl);
  }

  scriptSource.push('https://storage.googleapis.com');

  // In dev we allow 'unsafe-eval', so HMR doesn't trigger the CSP
  if (__DEV__) {
    scriptSource.push("'unsafe-eval'");
    scriptSource.push('https://cdn.jsdelivr.net');
    styleSource.push('https://fonts.googleapis.com');
    styleSource.push('https://cdn.jsdelivr.net');
    imgSource.push('https://cdn.jsdelivr.net');
    imgSource.push('http://cdn.jsdelivr.net');
    fontSource.push('https://fonts.gstatic.com');
    frameSource.push(`https://localhost.portal.${config.get<string>('DOMAIN')}:${config.get<number>('PORT_SSL')}`);
    frameSource.push(`http://localhost.portal.${config.get<string>('DOMAIN')}:${config.get<number>('PORT')}`);
    frameSource.push(`https://localhost:${config.get<number>('PORT_SSL')}`);
    frameSource.push(`http://localhost:${config.get<number>('PORT')}`);
  }

  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: defaultSource,
        // TODO: production != development, will consider this
        // baseUri: ["'none'"],
        objectSrc: ["'none'"],
        imgSrc: imgSource,
        fontSrc: fontSource,
        scriptSrc: scriptSource,
        frameSrc: frameSource,
        styleSrc: styleSource,
        upgradeInsecureRequests: true,
      },
    }),
  );
  //#endregion

  //#region Enable json response
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  //#endregion

  //#region Enable cookie
  app.use(cookieParser());
  //#endregion

  //#region Session and passport initialization
  const store = sessionRedis(config, logger);
  app.use(session(config, logger, store));

  app.use(passport.initialize());
  app.use(passport.session());
  //#endregion

  //#region Static files
  app.useStaticAssets(resolve(__dirname, __DEV__ ? '../../..' : '../..', 'public/'));
  //#endregion

  //#region Locale I18n
  app.use(nextI18NextMiddleware(nextI18next));
  //#endregion

  //#region Next.JS locals
  app.use('*', (_request: Request, response: express.Response, next: () => void) => {
    // res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
    response.locals.nestLogger = logger;
    next();
    // res.set('X-Server-ID', res);
    // res.removeHeader('X-Powered-By');
  });
  //#endregion

  //#region Next
  const appNextjs = Next({
    dev: __DEV__,
    dir: __DEV__ ? 'apps/portal' : '',
    quiet: false,
  });
  await appNextjs.prepare();
  const renderer = app.get(RenderModule);
  renderer.register(app, appNextjs, { dev: __DEV__, viewsDir: '' });
  const service = app.get(RenderService);
  service.setErrorHandler(
    async (
      error: HttpException,
      request: express.Request,
      response: express.Response,
      _pathname: any,
      _query: ParsedUrlQuery,
    ): Promise<any> => {
      const status = error.getStatus();
      if (status === 403 || status === 401) {
        response.status(302);
        response.location(`/auth/login?redirect=${encodeURI(request.url)}`);
      }
    },
  );
  //#endregion

  //#region Start server
  await app.init();

  http.createServer(server).listen(config.get<number>('PORT'));
  logger.log(`HTTP running on port ${config.get('PORT')}`, 'Bootstrap');

  if (httpsServer) {
    https.createServer(httpsServer, server).listen(config.get<number>('PORT_SSL'));
    logger.log(`HTTPS running on port ${config.get('PORT_SSL')}`, 'Bootstrap');
  }
  //#endregion

  //#region Webpack-HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }
  //#endregion
}

const configService = new ConfigService(resolve(__dirname, __DEV__ ? '../../..' : '../..', '.env'));
bootstrap(configService);
