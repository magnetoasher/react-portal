/** @format */

// #region Imports NPM
import { Module, forwardRef } from '@nestjs/common';
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
import { NextModule } from '../next/next.module';
// import { LoggerModule } from '../logger/logger.module';
// #endregion

@Module({
  imports: [
    // #region Config module, Next module
    ConfigModule,
    // LoggerModule,
    NextModule,
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
    forwardRef(() => UserModule),
    // #endregion
  ],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
