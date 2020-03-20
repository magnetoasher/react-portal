/** @format */

// #region Imports NPM
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql';
// #endregion
// #region Imports Local
import { GQLError, GQLErrorCode } from '../shared/gqlerror';
// #endregion

@Injectable()
export class GqlAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    if (!!request?.session?.passport?.user) {
      return true;
    }

    throw await GQLError({ code: GQLErrorCode.UNAUTHENTICATED });
  }

  getResponse = (context: ExecutionContext): Express.Session => {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.res;
  };

  getRequest(context: ExecutionContext): Express.Session {
    const gqlContext: GraphQLExecutionContext = GqlExecutionContext.create(context);
    const gqlCtx = gqlContext.getContext();

    return gqlCtx.req;
  }
}
