/** @format */

// #region Imports NPM
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Query, Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapAuthentication } from '@app/soap';
import { User } from '../../user/models/user.dto';
import { GqlAuthGuard } from '../../guards/gqlauth.guard';
import {
  OldService,
  OldTicket,
  OldTicketNewInput,
  OldTicketNew,
  OldTicketEditInput,
} from './models/old-service.interface';
import { OldTicketService } from './old-service.service';
// #endregion

@Resolver('OldTicketResolver')
export class OldTicketResolver {
  constructor(private readonly configService: ConfigService, private readonly ticketOldService: OldTicketService) {}

  /**
   * GraphQL query: GetService
   *
   * @returns {OldService[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTicketService(@Context('req') req: Request): Promise<OldService[]> {
    const user = req.user as User;

    if (user) {
      const authentication = {
        username: user.username,
        password: user.passwordFrontend as string,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketService(authentication).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: TicketNew
   *
   * @returns {OldTicketNew}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketNew(
    @Context('req') req: Request,
    @Args('ticket') ticket: OldTicketNewInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
  ): Promise<OldTicketNew> {
    const user = req.user as User;

    if (user) {
      const authentication = {
        username: user.username,
        password: user.passwordFrontend as string,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketNew(authentication, ticket, attachments).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL mutation: TicketEdit
   *
   * @returns {OldTicket}
   */
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async OldTicketEdit(
    @Context('req') req: Request,
    @Args('ticket') ticket: OldTicketEditInput,
    @Args('attachments') attachments: Promise<FileUpload>[],
  ): Promise<OldTicket> {
    const user = req.user as User;

    if (user) {
      const authentication = {
        username: user.username,
        password: user.passwordFrontend as string,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketEdit(authentication, ticket, attachments).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL query: GetTickets
   *
   * @returns {OldTicket[]}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTickets(@Context('req') req: Request, @Args('status') status: string): Promise<OldService[]> {
    const user = req.user as User;

    if (user) {
      const authentication = {
        username: user.username,
        password: user.passwordFrontend as string,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTickets(authentication, status).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }

  /**
   * GraphQL query: GetTicketDescription
   *
   * @returns {OldTicket}
   */
  @Query()
  @UseGuards(GqlAuthGuard)
  async OldTicketDescription(
    @Context('req') req: Request,
    @Args('code') code: string,
    @Args('type') type: string,
  ): Promise<OldService> {
    const user = req.user as User;

    if (user) {
      const authentication = {
        username: user.username,
        password: user.passwordFrontend as string,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      return this.ticketOldService.OldTicketDescription(authentication, code, type).catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
    }

    throw new UnauthorizedException();
  }
}
