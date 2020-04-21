/** @format */

// #region Imports NPM
import Session from 'express-session';
import RedisSessionStore from 'connect-redis';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
// #endregion

export default (configService: ConfigService, logger: LogService): Session.Store => {
  try {
    const sess = new (RedisSessionStore(Session))({
      client: Redis.createClient({
        url: configService.get<string>('SESSION_REDIS_URI'),
      }),
    });

    logger.debug(`Redis: url="${configService.get<string>('SESSION_REDIS_URI')}"`, 'Session');

    return sess;
  } catch (error) {
    logger.error('Error when installing', error, 'Session');

    throw error;
  }
};
