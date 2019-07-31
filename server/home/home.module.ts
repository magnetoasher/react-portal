/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextModule } from '../next/next.module';
import { HomeController } from './home.controller';
// #endregion

@Module({
  imports: [NextModule],
  controllers: [HomeController],
})
export class HomeModule {}
