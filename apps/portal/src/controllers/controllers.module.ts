/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth/auth.controller';
import { CalendarController } from './calendar/calendar.controller';
import { FaqController } from './faq/faq.controller';
import { HomeController } from './home/home.controller';
import { ServicesController } from './services/services.controller';
import { MailController } from './mail/mail.controller';
import { MeetingsController } from './meetings/meetings.controller';
import { NewsController } from './news/news.controller';
import { PhonebookController } from './phonebook/phonebook.controller';
import { ProfileController } from './profile/profile.controller';
import { MediaController } from './media/media.controller';
import { SettingsController } from './settings/settings.controller';
// #endregion

@Module({
  imports: [],
  controllers: [
    AdminController,
    AuthController,
    CalendarController,
    FaqController,
    HomeController,
    ServicesController,
    MailController,
    MeetingsController,
    NewsController,
    PhonebookController,
    ProfileController,
    MediaController,
    SettingsController,
  ],
})
export class HomeModule {}
