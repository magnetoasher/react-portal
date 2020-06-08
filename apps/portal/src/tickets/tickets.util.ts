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
  TkAuthorComments,
  TkComment,
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
export const userSOAP = (user: Record<string, any>, where: TkWhere): TkUser | undefined =>
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

export const filesSOAP = (files: Record<string, any>, where: TkWhere): TkFile[] | undefined =>
  files && Object.keys(files).length > 0
    ? files
        // .filter((file: Record<string, any>) => file['Код'])
        .map((file: Record<string, any>) => ({
          where: whereService(where),
          code: file['Код'],
          name: file['Наименование'],
          ext: file['РасширениеФайла'],
        }))
    : undefined;

/**
 * Услуга в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - СервисВладелец - Сервис (route) которому принадлежит данная услуга
 * - Аватар
 */
export const serviceSOAP = (service: Record<string, any>, where: TkWhere): TkService | undefined =>
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
export const routeSOAP = (route: Record<string, any>, where: TkWhere): TkRoute | undefined =>
  route && Object.keys(route).length > 0
    ? {
        where: whereService(where),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services: route['СписокУслуг']?.['Услуга']?.map((service: Record<string, any>) => serviceSOAP(service, where)),
      }
    : undefined;

/**
 * Комментарии в представлении 1C SOAP
 */
export const commentSOAP = (comment: Record<string, any>, where: TkWhere): TkComment | undefined =>
  comment && Object.keys(comment).length > 0
    ? {
        where: whereService(where),
        date: new Date(comment['Дата']),
        authorLogin: comment['ЛогинАвтора'],
        body: comment['Текст'],
        task: comment['Владелец'],
        code: comment['Код'],
        parentCode: comment['КодРодителя'],
      }
    : undefined;

/**
 * АвторКомментария и Комментарии в представлении 1C SOAP
 */
export const authorCommentsSOAP = (comments: Record<string, any>, where: TkWhere): TkAuthorComments | undefined =>
  comments && Object.keys(comments).length > 0
    ? {
        users: comments['Авторы']?.['АвторКомментария']?.map((user: Record<string, any>) => userSOAP(user, where)),
        comments: comments['Комментарии']?.['Комментарий']?.map((comment: Record<string, any>) =>
          commentSOAP(comment, where),
        ),
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
export const taskSOAP = (task: Record<string, any>, where: TkWhere): TkTask | undefined =>
  task && Object.keys(task).length > 0
    ? {
        where: whereService(where),
        id: task['Ref'],
        code: task['Код'],
        subject: task['Наименование'],
        body: clearHtml(task['Описание']),
        smallBody: clearHtml(task['Описание'], SMALL_BODY_STRING),
        status: task['Статус'],
        createdDate: task['Дата']?.toISOString() === '0000-12-31T21:29:43.000Z' ? undefined : new Date(task['Дата']),
        timeoutDate:
          task['СрокИсполнения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? undefined
            : new Date(task['СрокИсполнения']),
        endDate:
          task['ДатаЗавершения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? undefined
            : new Date(task['ДатаЗавершения']),
        executorUser: task['ТекущийИсполнитель'],
        initiatorUser: task['Инициатор'],
        route: routeSOAP(task['Сервис'], where),
        service: serviceSOAP(task['Услуга'], where),
        availableAction: task['ДоступноеДействие'],
        availableStages: task['ДоступныеЭтапы'],
        files: filesSOAP(task['СписокФайлов']?.['Файл'], where),
        comments: authorCommentsSOAP(task['КомментарииЗадачи'], where),
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
        code: file['Код'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
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
export const commentsOST = (comments: Record<string, any>, where: TkWhere, task: string): TkAuthorComments =>
  comments && Array.isArray(comments)
    ? comments.reduce(
        (accumulator: TkAuthorComments, comment: Record<string, any>) => {
          return {
            users: accumulator.users?.concat([
              {
                where: whereService(where),
                name: comment['user'],
                login: comment['user'],
                email: comment['email'],
              },
            ]),
            comments: accumulator.comments?.concat([
              {
                where: whereService(where),
                date: new Date(comment['created']),
                body: comment['body'],
                task,
                code: comment['id'],
                parentCode: '',
                authorLogin: comment['user'],
                files: [
                  ...comment['attachments']?.map((file: Record<string, any>) => ({
                    code: file['code'],
                    name: file['name'],
                    mime: file['mime'],
                    body: file['body'],
                  })),
                ],
              },
            ]),
          };
        },
        { users: [], comments: [] },
      )
    : undefined;

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
