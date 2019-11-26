/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LdapService } from './ldap.service';
import { LdapModule } from './ldap.module';
import { LdapModuleOptions, Scope, ldapADattributes } from './ldap.interface';
// #endregion

jest.mock('cache-manager');
jest.mock('cache-manager-redis-store', () => ({
  create: jest.fn(),
}));
jest.mock('ldapjs', () => ({
  createClient: () => ({
    on: jest.fn(),
  }),
}));

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

describe('LdapService', () => {
  let ldap: LdapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(env),

        LdapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get<string>('LDAP_URL'),
              bindDN: configService.get<string>('LDAP_BIND_DN'),
              bindCredentials: configService.get<string>('LDAP_BIND_PW'),
              searchBase: configService.get<string>('LDAP_SEARCH_BASE'),
              searchFilter: configService.get<string>('LDAP_SEARCH_FILTER'),
              searchScope: 'sub' as Scope,
              searchAttributes: ldapADattributes,
              searchBaseAllUsers: configService.get<string>('LDAP_SEARCH_BASE_ALL_USERS'),
              searchFilterAllUsers: configService.get<string>('LDAP_SEARCH_FILTER_ALL_USERS'),
              searchScopeAllUsers: 'sub' as Scope,
              searchAttributesAllUsers: ldapADattributes,
              queueSize: 100,
              reconnect: true,
              cache: true,
            } as LdapModuleOptions;
          },
        }),
      ],
      providers: [],
    }).compile();

    ldap = module.get<LdapService>(LdapService);
  });

  it('should be defined', () => {
    expect(ldap).toBeDefined();
  });
});
