/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { LoginService, Group } from '@lib/types';
import { ConfigService } from '@app/config';
import { LdapResponseGroup, LdapResponseUser } from '@app/ldap';
import { GroupEntity } from './group.entity';
// #endregion

@Injectable()
export class GroupService {
  dbCacheTtl = 10000;

  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(GroupService.name) private readonly logger: PinoLogger,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {
    this.dbCacheTtl = this.configService.get<number>('DATABASE_REDIS_TTL');
  }

  /**
   * Group by Identificator
   *
   * @async
   * @method byIdentificator
   * @param {string} loginIdentificator Group object GUID
   * @param {boolean} [cache = true] Cache true/false
   * @return {Promise<GroupEntity | undefined>} Group
   */
  byIdentificator = async (loginIdentificator: string, cache = true): Promise<GroupEntity | undefined> =>
    this.groupRepository.findOne({
      where: { loginIdentificator },
      cache: cache ? { id: 'group_loginIdentificator', milliseconds: this.dbCacheTtl } : false,
    });

  /**
   * Create or Update user groups
   *
   * @param {LdapResponseUser} ldapUser The LDAP user
   * @returns {Promise<GroupEntity[]>} The group entity
   * @throws {Error} Exception
   */
  async fromLdap(ldap: LdapResponseUser): Promise<GroupEntity[]> {
    const groups: any[] = [];

    if (ldap.groups) {
      ldap.groups.forEach((ldapGroup: LdapResponseGroup) => {
        groups.push(
          this.byIdentificator(ldapGroup.objectGUID, false)
            .then((updated) => {
              const group: Group = {
                ...updated,
                loginService: LoginService.LDAP,
                loginIdentificator: ldapGroup.objectGUID,
                name: ldapGroup.sAMAccountName,
                dn: ldapGroup.dn,
              };

              return this.groupRepository.save(this.groupRepository.create(group));
            })
            .catch((error: Error) => {
              this.logger.error('Unable to save data in `group`', error);
            }),
        );
      });
    }

    return Promise.all(groups);
  }

  /**
   * Create
   *
   * @param {Group} group The group object
   * @returns {GroupEntity} The group entity after create
   */
  create = (group: Group): GroupEntity => this.groupRepository.create(group);

  /**
   * Bulk Save
   *
   * @param {GroupEntity[]} group The groups entity
   * @returns {Promise<GroupEntity[]>} The groups after save
   */
  bulkSave = async (group: GroupEntity[]): Promise<GroupEntity[]> =>
    this.groupRepository.save(group).catch((error) => {
      this.logger.error('Unable to save data in `group`', error);

      throw error;
    });

  /**
   * Save the group
   *
   * @param {GroupEntity} group The group entity
   * @returns {Promise<GroupEntity>} The group after save
   */
  save = async (group: GroupEntity): Promise<GroupEntity> =>
    this.groupRepository.save(group).catch((error) => {
      this.logger.error('Unable to save data in `group`', error);

      throw error;
    });
}
