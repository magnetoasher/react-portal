/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextModule } from '../next/next.module';
import { AuthController } from './auth/auth.controller';
import { HomeController } from './home/home.controller';
import { PhonebookController } from './phonebook/phonebook.controller';
// #endregion

@Module({
  imports: [NextModule],
  controllers: [HomeController, AuthController, PhonebookController],
})
export class HomeModule {}
