/** @format */

//#region Imports NPM
import React from 'react';
import { NextComponentType } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { ApolloClient, ApolloError } from 'apollo-client';
import { concat, ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import { createUploadLink } from 'apollo-upload-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { Request, Response } from 'express';
// import { InStorageCache } from 'apollo-cache-instorage';
// import { PersistentStorage, PersistedData } from 'apollo-cache-persist/types';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { isMobile as checkMobile } from 'is-mobile';
import { Logger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { User, UserContext } from '@lib/types';
import { GQLErrorCode } from '@back/shared/gqlerror';
// import { nextI18next } from './i18n-client';
import stateResolvers from './state-link';
import getRedirect from './get-redirect';
import { ApolloAppProps, ApolloInitialProps } from './types';
import { AUTH_PAGE } from './constants';
//#endregion

interface CreateClientProps {
  initialState?: any;
  cookie?: string;
}

let logger: Console | Logger = console;
let browserApolloClient: ApolloClient<NormalizedCacheObject>;

const createClient = ({ initialState, cookie }: CreateClientProps): ApolloClient<NormalizedCacheObject> => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Cookie: cookie,
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError /* , response, operation */ }) => {
    if (__SERVER__) {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message /* , path, locations, extensions */ }): void => {
          logger!.error(message, message.toString(), 'GraphQL error');
        });
      }
      if (networkError) {
        logger!.error(networkError, networkError.toString(), 'Network error');
      }
    } else {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions /* , locations, path, */ }): void => {
          logger!.error(message, message.toString(), 'GraphQL error');

          if (extensions?.code === GQLErrorCode.UNAUTHENTICATED) {
            Router.push({ pathname: AUTH_PAGE, query: { redirect: getRedirect(window.location.pathname) } });
          }
        });
      }
      if (networkError) {
        logger!.error(networkError, networkError.toString(), 'Network error');
      }
    }
  });

  let clientParams = {};
  let httpLink: ApolloLink;
  let cache: InMemoryCache;

  if (__SERVER__) {
    // eslint-disable-next-line global-require
    global.fetch = require('node-fetch');

    httpLink = createHttpLink({
      uri: `http://localhost:${process.env.PORT}/graphql`,
      credentials: 'same-origin',
    });

    cache = new InMemoryCache().restore(initialState);
  } else {
    httpLink = createUploadLink({
      uri: `/graphql`,
      credentials: 'same-origin',
    });

    clientParams = {
      resolvers: stateResolvers,
    };

    // TODO: Протестить без него, так как он дает ошибку
    cache = new InMemoryCache().restore(initialState);
    // TODO: улучшенный контроль за кешем (продумать)
    // cache = new InStorageCache({
    // storage: window.sessionStorage as PersistentStorage<PersistedData<NormalizedCacheObject>>,
    // shouldPersist: (operation: string, dataId: string, value?: object): boolean => {
    //   // debugger;
    //   return true;
    // },
    // denormalize: (value: any): any => {
    //   // debugger;

    //   try {
    //     return JSON.parse(value);
    //   } catch {
    //     return value;
    //   }
    // },
    // }).restore(initialState) as InMemoryCache;
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__,
    link: concat(authLink.concat(errorLink), httpLink),
    cache,
    ...clientParams,
  });
};

const initApollo = (options: CreateClientProps): ApolloClient<NormalizedCacheObject> => {
  if (__SERVER__) {
    return createClient(options);
  }

  if (!browserApolloClient) {
    browserApolloClient = createClient(options);
  }

  return browserApolloClient;
};

export const withApolloClient = (
  MainApp: NextComponentType<AppContext, ApolloInitialProps, ApolloAppProps>,
): NextComponentType<AppContext, ApolloInitialProps, ApolloAppProps> =>
  class Apollo extends React.Component<ApolloAppProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    // eslint-disable-next-line react/static-property-placement
    static displayName = 'withApolloClient(MainApp)';

    public static async getInitialProps({ AppTree, Component, router, ctx }: AppContext): Promise<ApolloInitialProps> {
      const appProps =
        typeof MainApp.getInitialProps === 'function'
          ? await MainApp.getInitialProps({ AppTree, Component, router, ctx })
          : { pageProps: { apolloState: null } };

      if (__SERVER__) {
        const user: User | undefined = (ctx.req as Request)?.session?.passport?.user as User;
        const language = user?.settings?.lng || lngFromReq(ctx?.req) || 'en';
        const isMobile = checkMobile({ ua: ctx.req?.headers['user-agent'] }) ?? false;
        const context: UserContext = { user, isMobile, language };
        const apolloClient = initApollo({ cookie: ctx?.req?.headers?.cookie });

        try {
          const { getDataFromTree } = await import('@apollo/react-ssr');

          await getDataFromTree(
            <AppTree
              {...appProps}
              disableGeneration
              ctx={ctx}
              Component={Component}
              router={router}
              // apolloState={apolloState}
              apolloClient={apolloClient}
              context={context}
            />,
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          let message = true;
          if (error instanceof ApolloError) {
            // eslint-disable-next-line no-confusing-arrow
            message = error.graphQLErrors.some(({ extensions }): boolean =>
              extensions
                ? extensions.code === GQLErrorCode.UNAUTHENTICATED ||
                  extensions.code === GQLErrorCode.UNAUTHENTICATED_LOGIN ||
                  extensions.code === GQLErrorCode.UNAUTHORIZED
                : false,
            );
          } else if (error?.status === 401) {
            message = false;
          }
          if (message) {
            logger!.error('withApolloClient getDataFromTree', error.toString(), 'getDataFromTree');
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();

        // TODO: Не получается сделать чтобы отображалось одинаково на серваке и на клиенте. Посмотреть.
        context.user = undefined;

        return {
          ...appProps,
          context,
          apolloState: apolloClient.cache.extract(),
        };
      }

      const language = appProps.initialLanguage;

      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      return { ...appProps, context: { isMobile: false, language } };
    }

    public constructor(props: any) {
      super(props);
      this.apolloClient = initApollo({ initialState: props.apolloState });
    }

    public render(): React.ReactElement {
      if (__SERVER__) {
        const res = this.props.ctx?.res as Response;
        if (res) {
          logger = res.locals?.nestLogger;
        }
      }

      return <MainApp {...this.props} apolloClient={this.apolloClient} />;
    }
  };
