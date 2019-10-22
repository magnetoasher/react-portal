/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
// #endregion
// #region Imports Local
// eslint-disable-next-line import/no-cycle
import { LoginService, Gender, Address } from '../../../lib/types';
// #endregion

export interface Profile {
  id?: string;

  loginService: LoginService;

  loginIdentificator: string;

  username?: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday: Date;

  gender: Gender;

  addressPersonal: Address;

  company: string;

  department: string;

  title: string;

  telephone: string;

  workPhone: string;

  mobile: string;

  companyEng: string;

  nameEng: string;

  departmentEng: string;

  otdelEng: string;

  positionEng: string;

  thumbnailPhoto?: Buffer;

  thumbnailPhoto40?: string | Promise<string>;

  createdAt?: Date;

  updatedAt?: Date;
}
