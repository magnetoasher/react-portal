/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapResonseGroup, LdapResponseUser } from '@app/ldap';
import { GroupEntity } from './group.entity';
import { Group } from './models/group.dto';
import { LoginService } from '../shared/interfaces';
// #endregion

@Injectable()
export class GroupService {
  constructor(
    private readonly logService: LogService,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async createFromUser(ldap: LdapResponseUser): Promise<GroupEntity[]> {
    const groups: GroupEntity[] = [];

    if (ldap.groups) {
      /* eslint-disable no-restricted-syntax */
      /* eslint-disable no-await-in-loop */
      for (const ldapGroup of ldap.groups as LdapResonseGroup[]) {
        const updateAt = await this.groupByIdentificator(ldapGroup.objectGUID, false);

        const group: Group = {
          ...updateAt,
          loginIdentificator: ldapGroup.objectGUID,
          name: ldapGroup.sAMAccountName,
          dn: ldapGroup.dn,
          loginService: LoginService.LDAP,
        };

        groups.push(this.groupRepository.create(group));
      }

      await this.bulkSave(groups);
      /* eslint-enable no-restricted-syntax */
      /* eslint-enable no-await-in-loop */
    }

    return groups;
  }

  /**
   * Group by Identificator
   *
   * @param {string} loginIdentificator - group object GUID
   * @param {boolean} cache - cache true/false
   * @return {GroupEntity | undefined} - Group
   */
  groupByIdentificator = async (loginIdentificator: string, cache = true): Promise<GroupEntity | undefined> =>
    this.groupRepository.findOne({ where: { loginIdentificator }, cache });

  /**
   * Create
   *
   * @param {Group} - The group
   * @returns {GroupEntity} - The group entity
   */
  create = (group: Group): GroupEntity => this.groupRepository.create(group);

  /**
   * Bulk Save
   *
   * @param {GroupEntity[]} - The groups
   * @returns {GroupEntity[]} - The groups
   */
  bulkSave = async (group: GroupEntity[]): Promise<GroupEntity[]> =>
    this.groupRepository.save(group).catch((error) => {
      this.logService.error('Unable to save data in `groups`', JSON.stringify(error), 'GroupService');

      throw error;
    });

  /**
   * Save
   *
   * @param {GroupEntity} - The group
   * @returns {GroupEntity} - The group
   */
  save = async (group: GroupEntity): Promise<GroupEntity> =>
    this.groupRepository.save(group).catch((error) => {
      this.logService.error('Unable to save data in `group`', JSON.stringify(error), 'GroupService');

      throw error;
    });
}
