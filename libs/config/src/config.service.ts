/** @format */

// #region Imports NPM
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as Joi from '@hapi/joi';
import { Inject } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

export interface EnvConfig<T> {
  [key: string]: T;
}

export class ConfigService {
  private readonly envConfig: EnvConfig<any>;

  constructor(@Inject('CONFIG_OPTIONS') private readonly filePath: string) {
    const config = dotenv.parse(readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Language
   */
  public i18nPath = 'apps/portal/src/i18n';

  public fallbackLanguage = 'ru';

  i18nFilePattern = '*.json';

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig<any>): EnvConfig<any> {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.any()
        .default('development')
        .optional()
        .empty(),
      PORT: Joi.number()
        .integer()
        .default(4000)
        .optional()
        .empty(),
      PORT_DEBUGGER: Joi.number()
        .integer()
        .default(9229)
        .optional()
        .empty(),
      HOST: Joi.string()
        .default('0.0.0.0')
        .optional()
        .empty(),
      DATABASE_URI: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      DATABASE_URI_RD: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      DATABASE_SCHEMA: Joi.string()
        .default('public')
        .optional()
        .empty(),
      DATABASE_SYNCHRONIZE: Joi.boolean()
        .default(true)
        .optional()
        .empty(),
      DATABASE_DROP_SCHEMA: Joi.boolean()
        .default(true)
        .optional()
        .empty(),
      DATABASE_LOGGING: Joi.string()
        .default(true)
        .optional()
        .empty(),
      DATABASE_MIGRATIONS_RUN: Joi.boolean()
        .default(false)
        .optional()
        .empty(),
      DATABASE_REDIS_URI: Joi.string()
        .default('redis://localhost:6379/0')
        .optional()
        .empty(),
      DATABASE_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),

      HTTP_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      HTTP_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      HTTP_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),
      HTTP_REDIS_MAX_OBJECTS: Joi.number()
        .default(10000)
        .optional()
        .empty(),
      HTTP_REDIS_DB: Joi.number()
        .default(1)
        .optional()
        .empty(),
      HTTP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),
      HTTP_REDIS_PREFIX: Joi.string()
        .allow('')
        .optional()
        .empty(),

      SESSION_SECRET: Joi.string()
        .default('portal')
        .optional()
        .empty(),
      SESSION_REDIS_URI: Joi.string()
        .default('redis://localhost:6379/2')
        .optional()
        .empty(),
      SESSION_COOKIE_TTL: Joi.number()
        .default(24)
        .optional()
        .empty(),

      LDAP_REDIS_HOST: Joi.string()
        .default('localhost')
        .optional()
        .empty(),
      LDAP_REDIS_PORT: Joi.number()
        .default(6379)
        .optional()
        .empty(),
      LDAP_REDIS_TTL: Joi.number()
        .default(300)
        .optional()
        .empty(),
      LDAP_REDIS_DB: Joi.number()
        .default(3)
        .optional()
        .empty(),
      LDAP_REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .empty(),

      LDAP_URL: Joi.string()
        .default('ldap://activedirectory:389')
        .optional()
        .empty(),
      LDAP_BIND_DN: Joi.string()
        .default('CN=Administrator,DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_BIND_PW: Joi.string()
        .default('PaSsWoRd123')
        .optional()
        .empty(),
      LDAP_SEARCH_BASE: Joi.string()
        .default('DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER: Joi.string()
        .default('(sAMAccountName={{username}})')
        .optional()
        .empty(),
      LDAP_SEARCH_GROUP: Joi.string()
        .default('(&(objectClass=group)(member={{dn}}))')
        .optional()
        .empty(),
      LDAP_SEARCH_BASE_ALL_USERS: Joi.string()
        .default('DC=example,DC=local')
        .optional()
        .empty(),
      LDAP_SEARCH_FILTER_ALL_USERS: Joi.string()
        .default('(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))')
        .optional()
        .empty(),

      MICROSERVICE_URL: Joi.string()
        .default('nats://nats-cluster.production:4222')
        .optional()
        .empty(),
      MICROSERVICE_USER: Joi.string()
        .default('admin')
        .optional()
        .empty(),
      MICROSERVICE_PASS: Joi.string()
        .default('supersecret')
        .optional()
        .empty(),

      SOAP_URL: Joi.string()
        .default('https://server1c')
        .optional()
        .empty(),
      SOAP_USER: Joi.string()
        .default('admin')
        .optional()
        .empty(),
      SOAP_PASS: Joi.string()
        .default('supersecret')
        .optional()
        .empty(),

      NEWS_URL: Joi.string()
        .default('https://news')
        .optional()
        .empty(),
      NEWS_API_URL: Joi.string()
        .default('https://news/api')
        .optional()
        .empty(),

      MAIL_URL: Joi.string()
        .default('https://portal')
        .optional()
        .empty(),
      MAIL_LOGIN_URL: Joi.string()
        .default('https://roundcube.production/login/index.php')
        .optional()
        .empty(),

      MEETING_URL: Joi.string()
        .default('https://meeting')
        .optional()
        .empty(),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get<T>(key: string): T {
    return this.envConfig[key] as T;
  }
}
