/** @format */
/* eslint max-len:0, no-underscore-dangle:0, @typescript-eslint/ban-types:0, @typescript-eslint/no-explicit-any:0, @typescript-eslint/no-empty-interface:0 */

// declare module 'apollo-cache-instorage';
// declare module 'css-mediaquery';

declare let __DEV__: boolean;
declare let __PRODUCTION__: boolean;
declare let __TEST__: boolean;
declare let __SERVER__: boolean;

declare module 'cache-manager-redis-store';
declare module 'next-i18next/dist/commonjs/utils';

declare namespace NodeJS {
  interface GlobalFetch {}
  interface Global extends NodeJS.Global, GlobalFetch {
    fetch: Function;
    __SERVER__?: boolean;
    __DEV__?: boolean;
    __PRODUCTION__?: boolean;
    __TEST__?: boolean;
  }
}

declare module '*.woff2' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.svg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.svg?inline' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.png' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.png?inline' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.webp' {
  const content: any;
  const className: any;
  export = content;
}
declare module '*.jpg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.jpeg' {
  const content: any;
  const className: any;
  export = content;
}

declare module '*.gif' {
  const content: any;
  const className: any;
  export default content;
}
