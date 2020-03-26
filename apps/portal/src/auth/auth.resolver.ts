/** @format */

// #region Imports NPM
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { GqlAuthGuard } from '@back/guards/gqlauth.guard';
import { UserResponse } from '@back/user/user.entity';
import { GQLError, GQLErrorCode } from '@back/shared/gqlerror';
import { AuthService } from './auth.service';
// #endregion

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * GraphQL query: me
   *
   * @returns {UserResponse} Response user
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async me(@Context('req') req: Request): Promise<UserResponse | null> {
    return req.user as UserResponse;
  }

  /**
   * GraphQL mutation: login
   *
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Promise<UserResponse>} User response from DB
   * @throws {GraphQLError}
   */
  @Mutation()
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
    @Context('req') req: Request,
    // FIX: в GraphQLModule.forRoot({ context: ({ req, res }) => ({ req, res }) })
    @Context('res') res: Response,
  ): Promise<UserResponse> {
    const user = await this.authService
      .login({ username: username.toLowerCase(), password }, req)
      .catch(async (error: Error) => {
        throw await GQLError({ code: GQLErrorCode.UNAUTHENTICATED_LOGIN, error, i18n: this.i18n });
      });

    // Чтобы в дальнейшем был пароль, в частности, в SOAP
    user.passwordFrontend = password;

    req.logIn(user, async (error: Error) => {
      if (error) {
        this.logService.error('Error when logging in:', error, 'AuthResolver');

        throw await GQLError({ code: GQLErrorCode.UNAUTHENTICATED_LOGIN, error, i18n: this.i18n });
      }
    });

    if (user.profile && user.profile.email) {
      await this.authService
        .loginEmail(user.profile.email, password)
        .then((response) => {
          if (response.data && response.data.sessid && response.data.sessauth) {
            const options = {
              // domain: '.portal.i-npz.ru',
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            res.cookie('roundcube_sessid', response.data.sessid, options);
            res.cookie('roundcube_sessauth', response.data.sessauth, options);

            user.mailSession = {
              sessid: response.data.sessid,
              sessauth: response.data.sessauth,
            };

            return true;
          }

          throw new Error('Undefined mailSession error.');
        })
        .catch((error: Error) => {
          this.logService.error('Unable to login in mail', error, 'AuthResolver');
        });
    }

    return user;
  }

  /**
   * GraphQL mutation: logout
   *
   * @returns {Promise<boolean>} The true/false of logout
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@Context('req') req: Request): Promise<boolean> {
    this.logService.debug('User logout', 'AuthResolver');

    if (req.session) {
      req.logOut();
      return true;
    }

    return false;
  }

  /**
   * GraphQL mutation: cacheReset
   *
   * @returns {Promise<boolean>} Cache reset true/false
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async cacheReset(): Promise<boolean> {
    this.logService.debug('Cache reset', 'AuthResolver');

    return this.authService.cacheReset();
  }
}
