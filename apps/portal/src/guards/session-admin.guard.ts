/** @format */

//#region Imports NPM
import { Request } from 'express';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
//#endregion

@Injectable()
export class SessionAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if ((request?.session?.passport?.user as User)?.isAdmin) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
