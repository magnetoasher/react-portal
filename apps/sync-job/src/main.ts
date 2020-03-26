/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { ClientRedis } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { LDAP_SYNC } from '@lib/constants';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const logger = new LogService();

async function bootstrap(configService: ConfigService): Promise<boolean> {
  const client = new ClientRedis({
    url: configService.get<string>('MICROSERVICE_URL'),
  });

  await client.connect();

  return client.send<boolean>(LDAP_SYNC, []).toPromise();
}

const configService = new ConfigService(resolve(__dirname, dev ? '../../..' : '../../..', '.env'));
bootstrap(configService)
  .then((result) => {
    logger.log(`Microservice returns: ${result}`, 'syncJob');

    return process.exit(result ? 0 : 1);
  })
  .catch((error) => {
    throw new Error(`Synch job: Result: ${JSON.stringify(error)}`);
  });
