/** @format */

//#region Imports NPM
//#endregion
//#region Imports Local
import { LoginService, Gender, UserContext } from '@lib/types';
//#endregion

export * from './app-bar';
export * from './ldap-sync';

export const FONT_SIZE_SMALL = 11;
export const FONT_SIZE_NORMAL = 16;
export const FONT_SIZE_BIG = 21;

export const MINIMAL_SUBJECT_LENGTH = 5;
export const MINIMAL_BODY_LENGTH = 5;
export const AUTH_PAGE = '/auth/login';
export const FIRST_PAGE = '/phonebook';
export const SESSION = 'session';
export const ADMIN_PAGES = [
  '/mail',
  // '/profile',
  // '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/files',
  // '/settings',
  '/admin',
];
export const HIDDEN_PAGES = [
  '/mail',
  // '/profile',
  // '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/files',
  // '/settings',
  '/admin',
];
// export const ADMIN_PAGES = ['/admin'];

export const ALLOW_REDIRECT_PAGES = [
  '/mail',
  '/phonebook',
  '/profile',
  '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/files',
  '/news',
  '/settings',
  '/admin',
];
export const LARGE_RESOLUTION = 1440;
export const AUTO_COLLAPSE_ROUTES = [
  /* '/mail' */
];

export const TASK_STATUSES = ['Все', 'Регистрация', 'В работе', 'Выполнено', 'Завершено'];

export const ADMIN_GROUP = 'web master';

/**
 * PHONEBOOK
 */
export const PHONEBOOK_HIDDEN_COLS = ['disabled', 'notShowing'];
export const PHONEBOOK_ROW_HEIGHT = 72;

/**
 * PROFILE
 */
export const PROFILE_AUTOCOMPLETE_FIELDS = [
  'company',
  'management',
  'department',
  'division',
  'country',
  'region',
  'town',
  'street',
  'postalCode',
  'manager',
];
