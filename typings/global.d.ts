/** @format */

declare let __DEV__: boolean;
declare let __SERVER__: boolean;

declare module 'cache-manager-redis';
declare module '@graphile-contrib/pgdbi';

declare namespace NodeJS {
  interface Global {
    fetch: any; // GlobalFetch;
  }
}
