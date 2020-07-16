/** @format */

//#region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
//#endregion
//#region Imports Local
import { Login, LoginEmail, User, UserSettingsTaskFavorite } from '@lib/types';
import { ConfigService } from '@app/config';
import { CurrentUser, PasswordFrontend } from '@back/user/user.decorator';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { AuthService } from './auth.service';
//#endregion

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectPinoLogger(AuthResolver.name) private readonly logger: PinoLogger,
  ) {}

  /**
   * Login user with password provided. True if login successful. Throws error if login is incorrect.
   *
   * @async
   * @method login
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Login} The login response
   * @throws {GraphQLError}
   */
  @Query()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') request: Request,
    // @Context('res') response: Response,
  ): Promise<Login> {
    const email: LoginEmail = { login: false };

    const user = await this.authService
      .login({ username: username.toLowerCase(), password })
      .catch(async (error: Error) => {
        throw new UnauthorizedException(error);
      });

    request.logIn(user, async (error: Error) => {
      if (error) {
        const message = error.toString();
        this.logger.error(`Error when logging in: ${message}`, message);

        throw new UnauthorizedException(error);
      }
    });

    if (typeof request.session !== 'undefined') {
      request.session.password = password;
    }

    return { user, email };
  }

  /**
   * Login user in a email software. Throws error if login is incorrect.
   *
   * @async
   * @method loginEmail
   * @returns {boolean} True if a login successful
   * @throws {GraphQLError}
   */
  @Query()
  async loginEmail(
    @Context('req') request: Request,
    @Context('res') response: Response,
    @CurrentUser() user?: User,
    @PasswordFrontend() password?: string,
  ): Promise<LoginEmail> {
    return this.authService
      .loginEmail(user?.profile.email || '', password || '', request, response)
      .catch((error: Error) => {
        this.logger.error('Unable to login in mail', error);

        return {
          login: false,
          error: error.toString(),
        };
      });
  }

  /**
   * Logout a user.
   *
   * @async
   * @method logout
   * @returns {boolean} The true/false of logout
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') request: Request): Promise<boolean> {
    this.logger.debug('User logout');

    if (request.session) {
      request.logOut();

      return true;
    }

    return false;
  }

  /**
   * Cache reset.
   *
   * @async
   * @method cacheReset
   * @returns {boolean} Cache reset true/false
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async cacheReset(): Promise<boolean> {
    this.logger.debug('Cache reset');

    return this.authService.cacheReset();
  }
}
