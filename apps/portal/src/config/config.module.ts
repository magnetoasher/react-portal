/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
// #endregion
// #region Imports Local
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(resolve(__dirname, dev ? (test ? '../../..' : '../../../..') : '../..', '.env')),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
