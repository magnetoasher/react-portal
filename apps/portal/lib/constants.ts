/** @format */

// #region Imports NPM
import { I18n } from 'next-i18next';
// #endregion
// #region Imports Local
import { LoginService, Gender } from '../src/shared/interfaces';
import { UserContext } from '../src/user/models/user.dto';
// #endregion

export const FIRST_PAGE = '/mail';
export const SESSION = 'session';
export const ADMIN_PAGES = ['/admin'];
export const ALLOW_REDIRECT_PAGES = [
  '/mail',
  '/phonebook',
  '/profile',
  '/services',
  '/calendar',
  '/faq',
  '/meetings',
  '/news',
  '/settings',
  '/admin',
];
export const LARGE_RESOLUTION = 1440;
export const AUTO_COLLAPSE_ROUTES = [
  /* '/mail' */
];

export const TICKET_STATUSES = [
  'Все заявки',
  'Принят к выполнению',
  'Эскалация',
  'Черновик',
  'Зарегистрирован',
  'Завершен',
];

export const ADMIN_GROUP = 'web master';
export const DATE_FORMAT = (i: I18n): string => (i.language !== 'ru' ? 'YYYY-MM-DD HH:mm' : 'DD.MM.YYYY г. HH:mm');

// TEST
export const MOCK_PROFILE: UserContext = {
  user: {
    isAdmin: true,
    username: '',
    disabled: false,
    settings: {},
    profile: {
      loginService: LoginService.LDAP,
      loginIdentificator: '',
      username: '',
      dn: '',
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      birthday: new Date(),
      gender: Gender.UNKNOWN,
      country: '',
      postalCode: '',
      region: '',
      town: '',
      street: '',
      room: '',
      company: '',
      title: '',
      telephone: '',
      workPhone: '',
      mobile: '',
      fax: '',
      companyeng: '',
      nameeng: '',
      departmenteng: '',
      otdeleng: '',
      positioneng: '',
      disabled: false,
      notShowing: false,
    },
  },
};

// ////////// PHONEBOOK ///////////
export const PHONEBOOK_HIDDEN_COLS = ['disabled', 'notShowing'];
export const PHONEBOOK_ROW_HEIGHT = 72;

// ////////////////////////////////
