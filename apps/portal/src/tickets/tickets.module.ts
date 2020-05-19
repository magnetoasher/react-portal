/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { SoapModule } from '@app/soap';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';
//#endregion

@Module({
  imports: [
    SoapModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          url: configService.get<string>('SOAP_URL'),
          options: {
            wsdl_headers: {
              connection: 'keep-alive',
            },
            wsdl_options: {
              ntlm: true,
              domain: configService.get<string>('SOAP_DOMAIN'),
            },
          },
        };
      },
    }),

    HttpModule,
  ],

  providers: [TicketsService, TicketsResolver],
})
export class TicketsModule {}
