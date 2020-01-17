/** @format */
/* eslint max-len:0 */

// #region Imports NPM
import gql from 'graphql-tag';
// #endregion

const PROFILE_FRAGMENT = gql`
  fragment ProfileProps on Profile {
    username
    firstName
    lastName
    middleName
    nameeng
    birthday
    gender
    company
    companyeng
    department
    otdel
    departmenteng
    otdeleng
    positioneng
    title
    telephone
    workPhone
    email
    mobile
    manager {
      id
      firstName
      lastName
      middleName
      disabled
      notShowing
    }
    country
    postalCode
    region
    town
    street
    updatedAt
    createdAt
    disabled
    notShowing
  }
`;

export const CURRENT_USER = gql`
  query Me {
    me {
      id
      username
      updatedAt
      createdAt
      isAdmin
      settings {
        lng
        drawer
      }
      profile {
        ...ProfileProps
        thumbnailPhoto40
        thumbnailPhoto
      }
      groups {
        id
        name
        dn
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const SYNC = gql`
  mutation Synchronization {
    synchronization
  }
`;

export const CACHE = gql`
  mutation CacheReset {
    cacheReset
  }
`;

export const SOAP1CSYNCH = gql`
  mutation Soap1cSynch {
    soap1csynch
  }
`;

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      session
      mailSession {
        error
        sessid
        sessauth
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout @client
  }
`;

export const PROFILES = (_columns: string): any => gql`
  query Profiles($first: Int, $after: String, $orderBy: ProfileOrder, $search: String, $disabled: Boolean, $notShowing: Boolean) {
    profiles(first: $first, after: $after, orderBy: $orderBy, search: $search, disabled: $disabled, notShowing: $notShowing) {
      totalCount
      edges {
        node {
          id
          disabled
          notShowing
          ${_columns}
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// export const PROFILES_SEARCH = (_columns: string): any => gql`
//   query Profiles($search: String, $orderBy: ProfileOrder) {
//     profilesSearch(search: $search, orderBy: $orderBy) {
//       id
//       ${_columns}
//     }
//   }
// `;

export const PROFILE = gql`
  query Profile($id: ID) {
    profile(id: $id) {
      ...ProfileProps
      id
      thumbnailPhoto
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const CHANGE_PROFILE = gql`
  mutation ChangeProfile($profile: ProfileSettingsInput) {
    changeProfile(profile: $profile)
  }
`;

export const USER_SETTINGS = gql`
  mutation UserSettings($value: UserSettingsInput) {
    userSettings(value: $value) {
      id
      settings {
        lng
        drawer
      }
    }
  }
`;

/**
 * ADDRESSBOOK
 */
export const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($search: String) {
    searchSuggestions(search: $search) {
      firstName
      lastName
      middleName
      department
      company
      title
    }
  }
`;

/**
 * NEWS
 */
export const NEWS = gql`
  query News {
    news {
      id
      updatedAt
      createdAt
      title
      content
      excerpt
    }
  }
`;

export const NEWS_EDIT = gql`
  mutation editNews($title: String, $excerpt: String, $content: String, $id: ID) {
    editNews(title: $title, excerpt: $excerpt, content: $content, id: $id) {
      id
      title
      excerpt
      content
      user {
        id
        username
      }
      updatedAt
      createdAt
    }
  }
`;

export const NEWS_DELETE = gql`
  mutation deleteNews($id: ID) {
    deleteNews(id: $id)
  }
`;

/**
 * MEDIA
 */
export const MEDIA = gql`
  query Media {
    media {
      id
      updatedAt
      createdAt
      file
      title
      content
    }
  }
`;

export const MEDIA_EDIT = gql`
  mutation editMedia($title: String, $content: String, $id: ID) {
    editMedia(title: $title, content: $content, id: $id) {
      id
      updatedAt
      createdAt
      file
      title
      content
      user {
        id
        username
      }
    }
  }
`;

export const MEDIA_DELETE = gql`
  mutation deleteMedia($id: ID) {
    deleteMedia(id: $id)
  }
`;
