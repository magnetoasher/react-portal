/** @format */

import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';
import { WinstonGraylog } from '@pskzcompany/winston-graylog';
import { ConfigService } from '@app/config/config.service';

export const winstonOptions = (configService: ConfigService): WinstonModuleOptions => {
  const level = configService.get<string>('LOG_LEVEL') || 'debug';
  const graylog = configService.get<string>('LOG_SERVER');

  const options = {
    level,
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        level,
        format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
      }) as winston.transport,
    ],
  };

  if (graylog) {
    options.transports.push(
      new WinstonGraylog({
        level,
        graylog,
        defaultMeta: {
          environment: __DEV__ ? 'development' : 'production',
        },
      }) as winston.transport,
    );
  }

  return options;
};
