/** @format */

// #region Imports NPM
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { JwtService, JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { Scope } from '../ldap/interfaces/ldap.interface';
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { JwtServiceMock } from '../../__mocks__/jwt.service.mock';
import { ProfileEntity } from '../profile/profile.entity';
import { ProfileModule } from '../profile/profile.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { AuthServiceMock } from '../../__mocks__/auth.service.mock';
import { CookieSerializer } from '../auth/cookie.serializer';
import { CookieSerializerMock } from '../../__mocks__/cookie.serializer.mock';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
// #endregion

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        LoggerModule,

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
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forFeature([ProfileEntity]),

        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              ...configService.jwtModuleOptions,
            } as JwtModuleOptions;
          },
        }),

        LdapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get('LDAP_URL'),
              bindDN: configService.get('LDAP_BIND_DN'),
              bindCredentials: configService.get('LDAP_BIND_PW'),
              searchBase: configService.get('LDAP_SEARCH_BASE'),
              searchFilter: configService.get('LDAP_SEARCH_FILTER'),
              searchScope: 'sub' as Scope,
              searchAttributes: ['*'],
              reconnect: true,
            };
          },
        }),

        // AuthModule,
        ProfileModule,
      ],
      providers: [
        UserService,
        { provide: AuthService, useValue: AuthServiceMock },
        { provide: JwtService, useValue: JwtServiceMock },
      ],
    })
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
