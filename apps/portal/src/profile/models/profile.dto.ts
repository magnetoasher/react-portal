/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { LoginService, Gender } from '../../shared/interfaces';
// #endregion

// #region Profile
export interface Profile {
  id?: string;

  loginService: LoginService;

  // in ldap, we store a GUID entry
  loginIdentificator: string;

  username: string;

  dn: string;

  fullName?: string;

  firstName: string;

  lastName: string;

  middleName: string;

  email: string;

  birthday: Date;

  gender: Gender;

  country: string;

  postalCode: string;

  region: string;

  town: string;

  street: string;

  room: string;

  company: string;

  department?: string;

  otdel?: string;

  title: string;

  managerId?: string;

  manager?: Profile | undefined;

  telephone: string;

  workPhone: string;

  mobile: string;

  fax: string;

  companyeng: string;

  nameeng: string;

  departmenteng: string;

  otdeleng: string;

  positioneng: string;

  disabled: boolean;

  notShowing: boolean;

  thumbnailPhoto?: string | Promise<string | undefined>;

  thumbnailPhoto40?: string | Promise<string | undefined>;

  createdAt?: Date;

  updatedAt?: Date;
}
// #endregion
