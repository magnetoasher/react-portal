/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
// #endregion
// #region Imports Local
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// eslint-disable-next-line import/no-cycle
import { UserModule } from '../user/user.module';
import { LoggerModule } from '../logger/logger.module';
import { CookieSerializer } from './cookie.serializer';
import { LdapModule } from '../ldap/ldap.module';
import { Scope } from '../ldap/interfaces/ldap.interface';
import { AuthResolver } from './auth.resolver';
// #endregion

@Module({
  imports: [
    // #region Logger module, Config module, Next module
    LoggerModule,
    ConfigModule,
    // #endregion

    // #region LDAP Module
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
          cache: true,
        };
      },
    }),
    // #endregion

    // #region Passport module
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    // #endregion

    // #region Jwt module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ...configService.jwtModuleOptions,
        } as JwtModuleOptions;
      },
    }),
    // #endregion

    // #region Users module
    UserModule,
    // #endregion
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, CookieSerializer],
  exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
