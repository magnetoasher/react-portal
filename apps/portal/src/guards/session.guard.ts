/** @format */

//#region Imports NPM
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
//#endregion

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Express.Request>();

    if ((request?.session?.passport?.user as User)?.username) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
