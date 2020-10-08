/** @format */

//#region Imports NPM
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
//#endregion
//#region Imports Local
import type { LoggerContext } from '@back/shared/types';
import { LDAP_SYNC } from '@back/shared/constants';
import { SyncService } from './app.service';
//#endregion

@Controller()
export class AppController {
  constructor(private readonly syncService: SyncService) {}

  @MessagePattern(LDAP_SYNC)
  async synchronization({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> {
    return this.syncService.synchronization({ loggerContext });
  }
}
