/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import {
  TkRoutes,
  TkTasks,
  TkWhere,
  TkUserOST,
  TkTaskNewInput,
  TkTaskNew,
  TkTaskEditInput,
  TkTask,
} from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { taskSOAP, AttachesSOAP, taskOST, routesOST, routeSOAP } from './tickets.util';
import { TkTaskDescriptionInput } from '../../lib/types/tickets';
// #endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class TicketsService {
  constructor(
    @InjectPinoLogger(TicketsService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @method TicketsRoutes
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {TkRoutes[]} Services
   */
  TicketsRoutes = async (user: User, password: string): Promise<TkRoutes[]> => {
    const promises: Promise<TkRoutes>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error: Error) => {
        promises.push(Promise.resolve({ error: error.toString() }));
      });

      if (client) {
        promises.push(
          client
            .GetRoutesAsync({ Log: user.username })
            .then((result: any) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`);

              if (result?.[0]?.['return']) {
                if (typeof result[0]['return']['Сервис'] === 'object') {
                  const routes = result[0]['return']['Сервис'];

                  if (Array.isArray(routes)) {
                    return {
                      routes: [...routes.map((route: Record<string, any>) => routeSOAP(route, TkWhere.SOAP1C))],
                    };
                  }
                }
                return {};
              }

              this.logger.info(`TicketsRoutes: [Response] ${client.lastResponse}`);
              return {
                error: 'Not connected to SOAP',
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`);
              this.logger.info(`TicketsRoutes: [Response] ${client.lastResponse}`);
              this.logger.error(error);

              return { error: SoapError(error) };
            }),
        );
      }
    }

    if (!!this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        Object.keys(OSTicketURL).forEach((where) => {
          const osTicketService = this.httpService
            .post<TicketsService[]>(`${OSTicketURL[where]}?req=routes`, {})
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                if (typeof response.data === 'object') {
                  return {
                    routes: [...response.data.map((route: Record<string, any>) => routesOST(route, where as TkWhere))],
                  };
                }

                return { error: `Not found the OSTicket data in "${where}"` };
              }

              return { error: response.statusText };
            });
          promises.push(osTicketService);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises).then((values) =>
      values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { error: promise.reason?.message })),
    );
  };

  /**
   * Tasks list
   *
   * @async
   * @method TicketsTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @param {string} Status The status
   * @param {string} Find The find string
   * @returns {TkTasks[]}
   */
  TicketsTasks = async (user: User, password: string, Status: string, Find: string): Promise<TkTasks[]> => {
    const promises: Promise<TkTasks>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .GetTaskAsync({
              Log: user.username,
              Dept: '',
              Status,
              Executor: false,
              AllTask: false,
            })
            .then((result: any) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`);

              if (result?.[0]?.['return']) {
                if (typeof result[0]['return']['Задача'] === 'object') {
                  const tasks = Array.isArray(result[0]['return']['Задача'])
                    ? result[0]['return']['Задача']
                    : [result[0]['return']['Задача']];

                  return {
                    tasks: [...tasks.map((task: any) => taskSOAP(task, TkWhere.SOAP1C))],
                  };
                }
                return {};
              }

              this.logger.info(`TicketsTasks: [Response] ${client.lastResponse}`);
              return {
                error: 'Not connected to SOAP',
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`);
              this.logger.info(`TicketsTasks: [Response] ${client.lastResponse}`);
              this.logger.error(error);

              return { error: SoapError(error) };
            }),
        );
      }
    }

    if (!!this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;

        const userOST = {
          company: user.profile.company,
          email: user.profile.email,
          fio,
          function: user.profile.title,
          manager: '',
          phone: user.profile.telephone,
          phone_ext: user.profile.workPhone,
          subdivision: user.profile.department,
          Аватар: user.profile.thumbnailPhoto,
        } as TkUserOST;

        Object.keys(OSTicketURL).forEach((where) => {
          const osTickets = this.httpService
            .post<Record<string, any>>(`${OSTicketURL[where]}?req=tasks`, {
              login: user.username,
              user: JSON.stringify(userOST),
              msg: JSON.stringify({ login: fio, departament: '', opened: true }),
            })
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                if (typeof response.data === 'object') {
                  return {
                    tasks: [
                      ...response.data.tasks?.map((task: Record<string, any>) => taskOST(task, where as TkWhere)),
                    ],
                  };
                }

                return { error: `Not found the OSTicket data in ${where}` };
              }

              return { error: response.statusText };
            });
          promises.push(osTickets);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises).then((values) =>
      values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { error: promise.reason?.message })),
    );
  };

  /**
   * New task
   *
   * @async
   * @method TicketsTaskNew
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskNewInput} ticket Ticket object
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {TkTaskNew} New ticket creation
   */
  TicketsTaskNew = async (
    user: User,
    password: string,
    task: TkTaskNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkTaskNew> => {
    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });

      const Attaches: AttachesSOAP = { Вложение: [] };

      if (attachments) {
        await constructUploads(attachments, ({ filename, file }) =>
          Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
        ).catch((error: Error) => {
          this.logger.error(error);

          throw error;
        });
      }

      return client
        .NewTaskAsync({
          Log: user.username,
          Title: task.title,
          Description: task.body,
          Service: task.service,
          Executor: task.executorUser ? task.executorUser : '',
          Attaches,
        })
        .then((result: any) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);

          if (result && result[0] && result[0]['return']) {
            return {
              code: result[0]['return']['Код'],
              name: result[0]['return']['Наименование'],
              requisiteSource: result[0]['return']['РеквизитИсточника'],
              category: result[0]['return']['КатегорияУслуги'],
              organization: result[0]['return']['Организация'],
              status: result[0]['return']['ТекущийСтатус'],
              createdDate: result[0]['return']['ВремяСоздания'],
            };
          }

          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw SoapError(error);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia) {
      return {
        error: 'Cannot connect to OSTicket',
      };
    }

    return {
      error: '"where" is not exists in task',
    };
  };

  /**
   * Edit task
   *
   * @async
   * @method TicketsTaskEdit
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskEditInput} task The task which will be editing
   * @param {FileUpload} attachments Attachments object
   * @returns {TkTask} Ticket for editing
   */
  TicketsTaskEdit = async (
    user: User,
    password: string,
    task: TkTaskEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkTask> => {
    const authentication: SoapAuthentication = {
      username: user?.username,
      password,
      domain: this.configService.get<string>('SOAP_DOMAIN'),
    };

    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    const Attaches: AttachesSOAP = { Вложение: [] };

    if (attachments) {
      await constructUploads(attachments, ({ filename, file }) =>
        Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
      ).catch((error: SoapFault) => {
        this.logger.error(error);
        throw SoapError(error);
      });
    }

    return client
      .EditTaskAsync({
        TaskId: task.code,
        NewComment: task.comment,
        Executor: '',
        Attaches,
        AutorComment: user.username,
      })
      .then((result: any) => {
        this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`);

        if (result && result[0] && result[0]['return']) {
          return taskSOAP(result[0]['return'], TkWhere.SOAP1C);
        }

        this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`);
        return {
          error: 'Not connected to SOAP',
        };
      })
      .catch((error: SoapFault) => {
        this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`);
        this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`);
        this.logger.error(error);

        throw SoapError(error);
      });
  };

  /**
   * Task description
   *
   * @async
   * @method TicketsTaskDescription
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskDescriptionInput} task Task description
   * @returns {TkTask}
   */
  TicketsTaskDescription = async (user: User, password: string, task: TkTaskDescriptionInput): Promise<TkTask> => {
    if (task.where === TkWhere.SOAP1C) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });

      return client
        .GetTaskDescriptionAsync({
          TaskId: task.code,
        })
        .then((result: any) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);

          if (result && result[0] && result[0]['return'] && typeof result[0]['return'] === 'object') {
            return taskSOAP(result[0]['return'], TkWhere.SOAP1C);
          }

          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw SoapError(error);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia) {
      throw new Error('Not implemented');
    }

    throw new Error('Can not use a default route');
  };
}
