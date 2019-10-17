/** @format */

// #region Imports NPM
import session from 'express-session';
import redisSessionStore from 'connect-redis';
import redis from 'redis';
import genuuid from 'uuid/v1';
// #endreion
// #region Imports Local
import { ConfigService } from '../config/config.service';
// #endregion

export const sessionRedis = (configService: ConfigService): any =>
  session({
    secret: configService.get('SESSION_SECRET'),
    store: new (redisSessionStore(session))({
      client: redis.createClient({
        host: configService.get('SESSION_REDIS_HOST'),
        port: parseInt(configService.get('SESSION_REDIS_PORT'), 10),
        db: parseInt(configService.get('SESSION_REDIS_DB'), 10),
      }),
    }),
    resave: true,
    rolling: true,
    saveUninitialized: false,
    name: 'portal',
    genid: () => genuuid(),
    cookie: {
      path: '/',
      // domain: '',
      // secure: process.env.PROTOCOL === 'https',
      // expires: false,
      httpOnly: false,
      maxAge: parseInt(configService.get('SESSION_COOKIE_TTL'), 10), // msec, 1 hour
    },
  });
