/** @format */
/* eslint no-confusing-arrow:0 */

import clearHtml from '@lib/clear-html';
import {
  TkTaskNew,
  TkWhere,
  TkRoute,
  TkService,
  TkTask,
  TkUser,
  TkFile,
  TkComment,
  TicketsTaskSOAP,
  TicketsCommentSOAP,
  TicketsFileSOAP,
  TicketsRouteSOAP,
  TicketsServiceSOAP,
  TicketsUserSOAP,
} from '@lib/types';

export const SMALL_BODY_STRING = 250;

export interface AttachesSOAPFile {
  NFile: string;
  DFile: string;
}

export interface AttachesSOAP {
  Вложение: AttachesSOAPFile[];
}

/**
 * На какой сервис отправлять сообщения.
 */
export const whereService = (where: string | TkWhere): TkWhere => {
  switch (where) {
    case TkWhere.SOAP1C:
    case '1Citil':
      return TkWhere.SOAP1C;
    case TkWhere.OSTaudit:
    case 'auditors':
      return TkWhere.OSTaudit;
    case TkWhere.OSTmedia:
    case 'media':
      return TkWhere.OSTmedia;
    default:
      return TkWhere.Default;
  }
};

/** *******************************************************************************************
 * SOAP1C
 */

/**
 * User в представлении 1C SOAP:
 * - ФИО
 * - Аватар
 * - ОсновнойEmail
 * - ОсновнойТелефон
 * - Организация
 * - Подразделение
 * - Должность
 * - РуководительНаименование
 * - КоличествоАктивных - ?
 * - Логин
 * - КаналТелефонии
 */
export const userSOAP = (user: TicketsUserSOAP, where: TkWhere): TkUser | undefined =>
  user && Object.keys(user).length > 0
    ? {
        where: whereService(where),
        id: user['Ref'],
        name: user['ФИО'],
        avatar: user['Аватар'] || '',
        email: user['ОсновнойEmail'],
        telephone: user['ОсновнойТелефон'],
        company: user['Организация'],
        department: user['Подразделение']?.split(', ')[0],
        division: user['Подразделение']?.split(', ')[1],
        manager: user['РуководительНаименование'],
        title: user['Должность'],
      }
    : undefined;

export const fileSOAP = (file: TicketsFileSOAP, where: TkWhere): TkFile | undefined =>
  file && Object.keys(file).length > 0 && file['Наименование']
    ? {
        where: whereService(where),
        id: file['Ref'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
        mime: file['MIME'],
        body: file['ФайлХранилище'],
      }
    : undefined;

/**
 * Услуга в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - СервисВладелец - Сервис (route) которому принадлежит данная услуга
 * - Аватар
 */
export const serviceSOAP = (service: TicketsServiceSOAP, where: TkWhere): TkService | undefined =>
  service && Object.keys(service).length > 0
    ? {
        where: whereService(where),
        code: service['Код'],
        name: service['Наименование'],
        description: service['Описание'],
        route: service['СервисВладелец'],
        avatar: service['Аватар'],
      }
    : undefined;

/**
 * Сервис в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - Аватар
 */
export const routeSOAP = (route: TicketsRouteSOAP, where: TkWhere): TkRoute | undefined =>
  route && Object.keys(route).length > 0
    ? {
        where: whereService(where),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services: route['СписокУслуг']?.['Услуга']
          ? route['СписокУслуг']['Услуга'].reduce((accumulator, element) => {
              const service = serviceSOAP(element, where);
              if (service) {
                return [...accumulator, service];
              }
              return accumulator;
            }, [])
          : undefined,
      }
    : undefined;

/**
 * Комментарии в представлении 1C SOAP
 */
export const commentSOAP = (comment: TicketsCommentSOAP, where: TkWhere): TkComment | undefined =>
  comment && Object.keys(comment).length > 0
    ? {
        where: whereService(where),
        date: new Date(comment['Дата']),
        authorLogin: comment['Автор'],
        body: comment['Текст'],
        code: comment['Код'],
        parentCode: comment['КодРодителя'],
        files:
          comment['Файлы'] &&
          Object.keys(comment['Файлы']).length > 0 &&
          comment['Файлы']['Файл']?.map((file: TicketsFileSOAP) => fileSOAP(file, where)),
      }
    : undefined;

/**
 * Задача в представлении 1C SOAP:
 * - ТипОбращения
 * - Код
 * - Наименование
 * - Описание
 * - Статус
 * - СрокИсполнения
 * - ДатаЗавершения
 * - ТекущийИсполнитель
 * - Инициатор
 * - Сервис - ?
 * - Услуга
 */
export const taskSOAP = (task: TicketsTaskSOAP, where: TkWhere): TkTask | undefined =>
  task && Object.keys(task).length > 0
    ? {
        where: whereService(where),
        id: task['Ref'],
        code: task['Код'],
        subject: task['Наименование'],
        body: task['Описание'] && clearHtml(task['Описание']),
        smallBody: task['Описание'] && clearHtml(task['Описание'], SMALL_BODY_STRING),
        status: task['Статус'],
        createdDate:
          !task['Дата'] || task['Дата']?.toISOString() === '0000-12-31T21:29:43.000Z' ? undefined : task['Дата'],
        timeoutDate:
          !task['СрокИсполнения'] || task['СрокИсполнения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? undefined
            : task['СрокИсполнения'],
        endDate:
          !task['ДатаЗавершения'] || task['ДатаЗавершения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? undefined
            : task['ДатаЗавершения'],
        executorUser: task['ТекущийИсполнитель'],
        initiatorUser: task['Инициатор'],
        route: routeSOAP(task['Сервис'], where),
        service: serviceSOAP(task['Услуга'], where),
        availableAction: task['ДоступноеДействие'],
        availableStages: task['ДоступныеЭтапы'],
        files:
          task['Файлы'] && Object.keys(task['Файлы']).length > 0
            ? task['Файлы']['Файл'].reduce((accumulator, element) => {
                const file = fileSOAP(element, where);
                if (file) {
                  return [...accumulator, file];
                }
                return accumulator;
              }, [])
            : undefined,
        comments:
          task['Комментарии'] && Object.keys(task['Комментарии']).length > 0
            ? task['Комментарии']['Комментарий'].reduce((accumulator, element) => {
                const comment = commentSOAP(element, where);
                if (comment) {
                  return [...accumulator, comment];
                }
                return accumulator;
              }, [])
            : undefined,
      }
    : undefined;

/** *******************************************************************************************
 * OSTicket
 */

/**
 * Файлы в представлении OSTicket:
 * - Код
 * - Наименование
 * - РасширениеФайла
 */
export const filesOST = (files: Record<string, any>, where: TkWhere): TkFile[] => {
  if (files) {
    const filesArray = Array.isArray(files) ? files : [files];

    return filesArray
      .filter((file) => file['Код'])
      .map((file) => ({
        where: whereService(where),
        id: file['Код'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
        body: file['Файл'],
      }));
  }

  return [];
};

/**
 * Услуга в представлении OSTicket:
 * - Код
 * - Наименование
 * - descr
 * - group - ?
 * - avatar
 */
export const serviceOST = (service: Record<string, any>, where: TkWhere): TkService | undefined =>
  service && Object.keys(service).length > 0
    ? {
        where: whereService(where),
        code: service['code'],
        name: service['name'],
        description: service['description'],
        avatar: service['avatar'],
      }
    : undefined;

/**
 * Сервис в представлении OSTicket:
 * - Код
 * - Наименование
 * - descr
 * - group - ?
 * - avatar
 */
export const routesOST = (route: Record<string, any>, where: TkWhere): TkRoute | undefined =>
  route && Object.keys(route).length > 0
    ? {
        where: whereService(where),
        code: route['code'],
        name: route['name'],
        description: route['description'],
        avatar: route['avatar'],
        services: route['services']?.map((service: Record<string, any>) => serviceOST(service, where)),
      }
    : undefined;

/**
 * Описание в представлении OSTicket:
 */
export const commentsOST = (comments: Record<string, any>, where: TkWhere, task: string): TkComment[] | undefined => [];
// comments && Array.isArray(comments)
//   ? comments.reduce(
//       (accumulator: TkComment[], comment: Record<string, any>) => {
//         return {
//           users: accumulator.users?.concat([
//             {
//               where: whereService(where),
//               name: comment['user'],
//               login: comment['user'],
//               email: comment['email'],
//             },
//           ]),
//           comments: accumulator.comments?.concat([
//             {
//               where: whereService(where),
//               date: new Date(comment['created']),
//               body: comment['body'],
//               code: comment['id'],
//               parentCode: '',
//               authorLogin: comment['user'],
//               files: [
//                 ...comment['attachments']?.map((file: Record<string, any>) => ({
//                   code: file['code'],
//                   name: file['name'],
//                   mime: file['mime'],
//                   body: file['body'],
//                 })),
//               ],
//             },
//           ]),
//         };
//       },
//       { users: [], comments: [] },
//     )
//   : undefined;

/**
 * Задача в представлении OSTicket:
 * - number: Код
 * - subject - Наименование
 * - description - Описание
 * - status - Статус
 * - created - Дата создания
 * - user_name - Кто создал заявку
 * - assignee_user_name - Исполнитель
 * - topic - Услуга
 * - ТекущийИсполнитель
 * - Инициатор
 * - Сервис - ?
 * - Услуга
 */
export const taskOST = (task: Record<string, any>, where: TkWhere): TkTask | undefined =>
  task && Object.keys(task).length > 0
    ? {
        where: whereService(where),
        code: task['number'],
        subject: task['subject'],
        smallBody:
          typeof task['description'] === 'string'
            ? task['description']?.substring(0, SMALL_BODY_STRING)
            : task['description']?.[0]?.body?.substring(0, SMALL_BODY_STRING),
        body: typeof task['description'] === 'string' ? task['description'] : task['description']?.[0]?.body,
        status: task['status_name'],
        createdDate: new Date(task['created']),
        timeoutDate: new Date(task['dateOfCompletion']),
        endDate: undefined,
        initiatorUser: '',
        // {
        //   where: whereService(where),
        //   name: task['owner_user_name'],
        //   company: task['owner_company'],
        //   department: task['owner_dept'],
        //   email: task['owner_email'],
        //   telephone: task['owner_phone'],
        // },
        executorUser: '',
        // {
        //   where: whereService(where),
        //   name: task['assignee_user_name'],
        //   email: task['assignee_email'],
        //   company: task['assignee_company'],
        //   department: task['assignee_dept'],
        //   telephone: task['assignee_phone'],
        // },
        route: undefined,
        service: {
          where: whereService(where),
          code: '',
          name: task['topic'],
        },
        availableAction: undefined,
        availableStages: undefined,
        files: undefined,
        comments: commentsOST(task['description'], where, task['number']),
      }
    : undefined;

/**
 * Новая задача в представлении OSTicket:
 * - number: Код
 * - name - Наименование
 * - route - Сервис
 * - service - Услуга
 * - company - Компания
 * - status - Статус
 * - creationDateTime - Дата создания
 */
export const newOST = (task: Record<string, any>, where: TkWhere): TkTaskNew | undefined =>
  task && Object.keys(task).length > 0
    ? {
        where: whereService(where),
        // id: task['ticket'],
        code: task['number'],
        subject: task['name'],
        route: task['route'] || '000000001',
        service: task['service'],
        organization: task['company'],
        status: task['status'] || 'New',
        createdDate: new Date(task['creationDateTime']),
      }
    : undefined;

/**
 * Новый user в представлении OSTicket:
 */
export const userOST = (user: Record<string, any>, where: TkWhere): TkUser | undefined =>
  user && Object.keys(user).length > 0
    ? {
        where: whereService(where),
        id: user['Ref'],
        name: user['ФИО'],
        avatar: user['Аватар'] || '',
        email: user['ОсновнойEmail'],
        telephone: user['ОсновнойТелефон'],
        company: user['Организация'],
        department: user['Подразделение']?.split(', ')[0],
        division: user['Подразделение']?.split(', ')[1],
        manager: user['РуководительНаименование'],
        title: user['Должность'],
      }
    : undefined;
