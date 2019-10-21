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
        birthday
        gender
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

export const PROFILES = gql`
  query Profiles($take: Int, $skip: Int) {
    profiles(take: $take, skip: $skip) {
      firstName
      lastName
      middleName
      birthday
      gender
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
`;
