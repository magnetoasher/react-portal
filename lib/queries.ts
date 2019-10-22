/** @format */

// #region Imports NPM
import gql from 'graphql-tag';
// #endregion

export const CURRENT_USER = gql`
  {
    me {
      token
      id
      username
      updatedAt
      createdAt
      profile {
        firstName
        lastName
        middleName
        nameEng
        birthday
        gender
        company
        companyEng
        department
        departmentEng
        otdelEng
        positionEng
        title
        telephone
        workPhone
        mobile
        addressPersonal {
          country
          postalCode
          region
          street
        }
        thumbnailPhoto
        updatedAt
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout @client
  }
`;

export const PROFILE = (_columns: string): any => gql`
  query Profiles($take: Int, $skip: Int) {
    profiles(take: $take, skip: $skip) {
      ${_columns}
    }
  }
`;
