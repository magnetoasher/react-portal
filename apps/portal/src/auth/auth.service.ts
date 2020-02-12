/** @format */

// #region Imports NPM
import { Injectable, UnauthorizedException, HttpService } from '@nestjs/common';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { ConfigService } from '@app/config';
import { UserLogin } from '../user/models/user.dto';
import { UserService } from '../user/user.service';
import { UserEntity, UserResponse } from '../user/user.entity';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly logService: LogService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate a user
   *
   * @param {username} Username
   * @returns {UserRespone}
   * @throws {UnauthorizedException}
   */
  public validate = async (request: Express.Request): Promise<UserResponse> => {
    if (request && request.session && request.session.passport && request.session.passport.user) {
      return request.session.passport.user;
    }

    throw new UnauthorizedException();
  };

  /**
   * Login a user
   *
   * @param {UserLogin} data User login data transfer object
   * @returns {UserResponse} User response
   * @throws {UnauthorizedException} Http Exception
   */
  async login({ username, password }: UserLogin, req?: Express.Request): Promise<UserResponse> {
    this.logService.debug(`User login: username = "${username}"`, 'AuthService');

    return this.userLdapLogin({
      username,
      password,
      user: await this.userService.readByUsername(username, true, 'profile'),
    })
      .then((user) => user && user.toResponseObject((req && req.sessionID) || ''))
      .catch((error: UnauthorizedException) => {
        this.logService.error('Error: not found user', JSON.stringify(error), 'AuthService');

        throw error;
      });
  }

  /**
   * User LDAP login
   *
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

        this.logService.log('Reset database cache.', 'AuthService');

        databaseStoreReset = true;
      } catch (error) {
        this.logService.error('Unable to reset database cache:', error, 'AuthService');
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_URI')) {
      const redisLdap = Redis.createClient({
        url: this.configService.get<string>('LDAP_REDIS_URI'),
      });

      try {
        redisLdap.flushdb();

        this.logService.log('Reset LDAP cache.', 'AuthService');

        ldapCacheReset = true;
      } catch (error) {
        this.logService.error('Unable to reset LDAP cache:', error, 'AuthService');
      }

      redisLdap.quit();
    }

    if (this.configService.get<string>('HTTP_REDIS_URI')) {
      const redisHttp = Redis.createClient({
        url: this.configService.get<string>('HTTP_REDIS_URI'),
      });

      try {
        redisHttp.flushdb();

        this.logService.log('Reset HTTP cache.', 'AuthService');

        httpStoreReset = true;
      } catch (error) {
        this.logService.error('Unable to reset LDAP cache:', error, 'AuthService');
      }

      redisHttp.quit();
    }

    try {
      const redisSession = Redis.createClient({
        url: this.configService.get<string>('SESSION_REDIS_URI'),
      });

      try {
        redisSession.flushdb();

        this.logService.log('Reset session cache.', 'AuthService');
      } catch (error) {
        this.logService.error('Unable to reset session cache:', error, 'AuthService');
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      this.logService.error('Error in cache reset, session store', error, 'AuthService');
    }

    if (databaseStoreReset && sessionStoreReset && ldapCacheReset && httpStoreReset) {
      return true;
    }

    return false;
  };

  /**
   * User LDAP login
   *
   * @param {string, string, UserEntity} - User register data transfer object
   * @returns {UserEntity} User response DTO
   * @throws {UnauthorizedException}
   */
  userLdapLogin = async ({
    username,
    password,
    user,
  }: {
    username: string;
    password: string;
    user?: UserEntity;
  }): Promise<UserEntity> =>
    this.userService.createFromLdap(await this.ldapService.authenticate(username, password), user);

  /**
   * User Email login
   *
   * @param {email, password} - User Email, password
   * @returns {response} - User response
   */
  loginEmail = async (email: string, password: string): Promise<any> =>
    this.httpService
      .post(this.configService.get<string>('MAIL_LOGIN_URL'), {
        email,
        password,
      })
      .toPromise();
}
