/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
// #endregion

jest.mock('@app/logger');
jest.mock('@app/ldap');
jest.mock('../shared/session-redis');
jest.mock('../user/user.service');

describe('AuthService', () => {
  let service: AuthService;
  // let repositoryMock: MockType<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(resolve(__dirname, '../../../..', '.env')),

        I18nModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            path: configService.i18nPath,
            filePattern: configService.i18nFilePattern,
            fallbackLanguage: configService.fallbackLanguage,
            resolvers: [new QueryResolver(['lang', 'locale', 'l']), new HeaderResolver()],
          }),
        }),

        TypeOrmModule.forRoot({}),

        AuthModule,
        UserModule,
      ],
      providers: [AuthService, UserService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // repositoryMock = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
