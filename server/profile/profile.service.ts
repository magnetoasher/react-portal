/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileEntity } from './profile.entity';
import { Gender, LoginService } from '../../lib/types';
import { Profile } from './models/profile.dto';
import { LogService } from '../logger/logger.service';
import { LdapService } from '../ldap/ldap.service';
import { UserEntity } from '../user/user.entity';
// #endregion

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
  ) {}

  async profiles(take: number, skip: number): Promise<Profile[] | null> {
    // TODO: группы к которым имеет доступ текущий пользователь, согласно username

    const profiles = await this.profileRepository.find({
      cache: true,
      take,
      skip,
    });

    return profiles;
  }

  async create(ldapUser: LdapResponeUser, user?: UserEntity): Promise<ProfileEntity | undefined> {
    let comment;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }
    const {
      companyeng: companyEng = undefined,
      nameeng: nameEng = undefined,
      departmenteng: departmentEng = undefined,
      otdeleng: otdelEng = undefined,
      positioneng: positionEng = undefined,
      gender = undefined,
    } = comment;

    let { birthday } = comment;
    if (!birthday || birthday === '') {
      birthday = undefined;
    } else {
      birthday = new Date(Date.parse(birthday)).toLocaleDateString();
    }

    let profile: Profile = {
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID.toString(),
      username: ldapUser.sAMAccountName,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName: ldapUser.middleName,
      birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      addressPersonal: {
        country: ldapUser.co,
        postalCode: ldapUser.postalCode,
        region: ldapUser.st,
        street: ldapUser.streetAddress,
      },
      company: ldapUser.company,
      title: ldapUser.title,
      email: ldapUser.mail,
      telephone: ldapUser.telephoneNumber,
      workPhone: ldapUser.otherTelephone,
      mobile: ldapUser.mobile,
      companyEng,
      nameEng,
      departmentEng,
      otdelEng,
      positionEng,
      thumbnailPhoto: ldapUser.thumbnailPhoto,
    };

    if (user && user.profile) {
      profile.id = user.profile.id;
      profile.createdAt = user.profile.createdAt;
      profile.updatedAt = user.profile.updatedAt;
    } else {
      const profileSave = await this.profileRepository.findOne({
        where: { loginIdentificator: ldapUser.objectGUID.toString() },
      });

      if (profileSave) {
        profile.id = profileSave.id;
        profile.createdAt = profileSave.createdAt;
        profile.updatedAt = profileSave.updatedAt;
      }
    }

    try {
      profile = this.profileRepository.create(profile);
    } catch (error) {
      this.logService.error('Unable to create data in `profile`', error, 'ProfileService');

      throw error;
    }

    try {
      return await this.profileRepository.save(profile);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error, 'ProfileService');

      throw error;
    }
  }
}
