/** @format */

//#region Imports NPM
import { Injectable, Inject, HttpService, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LdapService, InvalidCredentialsError } from 'nestjs-ldap';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Redis from 'redis';
//#endregion
//#region Imports Local
import { LoginEmail, EmailSession } from '@lib/types/auth';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { UserEntity } from '@back/user/user.entity';
import { PortalError } from '@back/shared/errors';
//#endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate a user
   *
   * @async
   * @function validate
   * @param {Request} request
   * @returns {Promise<User>} Validated user
   * @throws {UnauthorizedException}
   */
  public validate = async (request: Request): Promise<User> => {
    if (request.user?.id) {
      const user = await this.userService.byId(request.user.id);

      return user;
    }

    throw new UnauthorizedException();
  };

  /**
   * Login a user
   *
   * @async
   * @method login
   * @param {string} username User login
   * @param {string} password User password
   * @param {Express.Request} req Request where the user comes from
   * @returns {UserEntity} User entity
   * @throws {Error} Exception
   */
  async login({ username, password }: { username: string; password: string }): Promise<UserEntity> {
    this.logger.info(`User login: username = "${username}"`, { context: AuthService.name });

    const ldapUser = await this.ldapService.authenticate(username, password).catch((error) => {
      this.logger.error(`LDAP login: ${error.toString()}`, { error, context: AuthService.name });

      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(__DEV__ ? error : undefined);
      }

      throw new BadRequestException(__DEV__ ? error : undefined);
    });

    return this.userService
      .fromLdap(ldapUser)
      .then((user) => {
        if (user.disabled) {
          this.logger.error(`User is Disabled: ${user.username}`, { error: 'User is Disabled', context: AuthService.name });

          throw new BadRequestException(PortalError.USER_DISABLED);
        }

        return user;
      })
      .catch((error: Error) => {
        this.logger.error(`Error: not found user: ${error.toString()}`, { error, context: AuthService.name });

        throw new InternalServerErrorException(__DEV__ ? error : undefined);
      });
  }

  /**
   * Cache reset. Returns true/false if successful cache reset.
   *
   * @async
   * @function cacheReset
   * @returns {boolean} The true/false if successful cache reset
   */
  cacheReset = async (): Promise<boolean> => {
    let sessionStoreReset = false;
    let databaseStoreReset = false;
    let ldapCacheReset = false;
    let httpStoreReset = false;

    if (this.configService.get<string>('DATABASE_REDIS_URI')) {
      const redisDatabase = Redis.createClient({
        url: this.configService.get<string>('DATABASE_REDIS_URI'),
      });

      try {
        redisDatabase.flushdb();

        this.logger.info('Reset database cache');

        databaseStoreReset = true;
      } catch (error) {
        this.logger.error(`Unable to reset database cache: ${error.toString()}`, { context: AuthService.name });
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_URI')) {
      const redisLdap = Redis.createClient({
        url: this.configService.get<string>('LDAP_REDIS_URI'),
      });

      try {
        redisLdap.flushdb();

        this.logger.info('Reset LDAP cache');

        ldapCacheReset = true;
      } catch (error) {
        this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`, { context: AuthService.name });
      }

      redisLdap.quit();
    }

    if (this.configService.get<string>('HTTP_REDIS_URI')) {
      const redisHttp = Redis.createClient({
        url: this.configService.get<string>('HTTP_REDIS_URI'),
      });

      try {
        redisHttp.flushdb();

        this.logger.info('Reset HTTP cache');

        httpStoreReset = true;
      } catch (error) {
        this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`, { context: AuthService.name });
      }

      redisHttp.quit();
    }

    try {
      const redisSession = Redis.createClient({
        url: this.configService.get<string>('SESSION_REDIS_URI'),
      });

      try {
        redisSession.flushdb();

        this.logger.info('Reset session cache', { context: AuthService.name });
      } catch (error) {
        this.logger.error(`Unable to reset session cache: ${error.toString()}`, { context: AuthService.name });
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      this.logger.error(`Error in cache reset, session store: ${error.toString()}`, { context: AuthService.name });
    }

    if (databaseStoreReset && sessionStoreReset && ldapCacheReset && httpStoreReset) {
      return true;
    }

    return false;
  };

  /**
   * User Email login
   *
   * @async
   * @method loginEmail
   * @param {string} email User Email
   * @param {string} password User Password
   * @returns {AxiosResponse<MainSession>}
   */
  loginEmail = async (email: string, password: string, request: Request, response: Response): Promise<LoginEmail> =>
    this.httpService
      .post<EmailSession>(this.configService.get<string>('MAIL_LOGIN_URL'), {
        email,
        password,
      })
      .toPromise()
      .then(
        (axiosResponse) => {
          const { sessid, sessauth } = axiosResponse.data;
          if (sessid && sessauth && sessauth !== '-del-') {
            const options = {
              domain: `.${this.configService.get<string>('DOMAIN')}`,
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            response.cookie('roundcube_sessid', sessid, options);
            response.cookie('roundcube_sessauth', sessauth, options);

            if (request.session) {
              request.session.mailSession = {
                sessid,
                sessauth,
              };
            }

            return { login: true };
          }

          throw new Error(PortalError.MAIL_NOT_AUTHORIZED);
        },
        (error: Error) => {
          throw error;
        },
      );
}
