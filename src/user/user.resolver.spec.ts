/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
// import { UserEntity } from './user.entity';
import { UserResolver } from './user.resolver';
// import { ProfileEntity } from '../profile/profile.entity';
import { UserService } from './user.service';
// #endregion

jest.mock('./user.entity');
jest.mock('../profile/profile.module');
jest.mock('../ldap/ldap.service');
jest.mock('./user.service');

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LdapModule.registerAsync({
          useFactory: () => {
            return {} as LdapModuleOptions;
          },
        }),

        // #region TypeORM
        TypeOrmModule.forRoot({}),
        // #endregion

        ProfileModule,
      ],
      providers: [UserService, UserResolver, LdapService],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
