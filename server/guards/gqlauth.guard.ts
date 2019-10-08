/** @format */

// #region Imports NPM
import { IncomingMessage } from 'http';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
// #endregion
// #region Imports Local
import { AuthService } from '../auth/auth.service';
// #endregion

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly authService: AuthService) {
    super({ session: true });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx: any = gqlContext.getContext();

    // eslint-disable-next-line no-debugger
    // debugger;

    if (gqlCtx.user) {
      return true;
    }

    gqlContext.switchToHttp = () => (this as unknown) as HttpArgumentsHost;

    const canActivate = await super.canActivate(gqlContext);
    await super.logIn(gqlCtx.req);

    return canActivate instanceof Observable ? canActivate.toPromise() : canActivate;
  }

  handleRequest(err: Error, user: any /* , info: any, context: any */): any {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }

  getResponse = (): any => undefined;

  getRequest(context: ExecutionContext): IncomingMessage {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    // eslint-disable-next-line no-debugger
    // debugger;

    return gqlCtx.req;
  }
}
