/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '../../portal/src/user/user.service';
import { ProfileService } from '../../portal/src/profile/profile.service';
// #endregion

@Injectable()
export class SyncService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  synchronization = async (): Promise<boolean> => {
    // TODO: profiles that not in AD but in DB

    const ldapUsers = await this.ldapService.synchronization();

    if (ldapUsers) {
      ldapUsers.forEach(async (ldapUser) => {
        if (ldapUser.sAMAccountName) {
          const user = await this.userService.byLoginIdentificator(ldapUser.objectGUID, false, false, false);
          try {
            await this.userService.fromLdap(ldapUser, user, true);
          } catch (error) {
            this.logService.error(`Error with "${ldapUser.sAMAccountName}"`, error, 'Synch');
          }
        } else {
          await this.profileService.fromLdap(ldapUser, undefined, 1, true);
        }
      });

      this.logService.log('--- End of synchronization: true ---', 'Synch');
      return true;
    }

    this.logService.log('--- End of synchronization: false ---', 'Synch');
    return false;
  };
}
