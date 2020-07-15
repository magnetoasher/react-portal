/** @format */

//#region Imports NPM
import React from 'react';
import { NextComponentType } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { ApolloClient, ApolloError } from 'apollo-client';
import { from, split, ApolloLink } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { onError } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SchemaLink } from 'apollo-link-schema';
import { createUploadLink } from 'apollo-upload-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { Request, Response } from 'express';
import { lngFromReq } from 'next-i18next/dist/commonjs/utils';
import { isMobile as checkMobile } from 'is-mobile';
import { Logger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { User, UserContext } from '@lib/types';
// import { nextI18next } from './i18n-client';
import { CURRENT_USER } from './queries';
import stateResolvers from './state-link';
import getRedirect from './get-redirect';
import { AppContextMy, AppInitialPropsMy } from './types';
import { AUTH_PAGE, FONT_SIZE_NORMAL } from './constants';
//#endregion

interface CreateClientProps {
  initialState?: NormalizedCacheObject;
  cookie?: string;
  secure?: boolean;
}

let configService: ConfigService | undefined;
let logger: Console | Logger = console;
let browserApolloClient: ApolloClient<NormalizedCacheObject>;

const createClient = ({ initialState, secure, cookie }: CreateClientProps): ApolloClient<NormalizedCacheObject> => {
  const errorMiddleware = onError(({ graphQLErrors, networkError /* , response, operation */ }) => {
    if (__SERVER__) {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message /* , path, locations, extensions */ }): void => {
          logger.error(message, message, 'GraphQL ErrorLink', { error: message });
        });
      }
      if (networkError) {
        logger.error(networkError, networkError.toString(), 'GraphQL NetworkError', { error: networkError });
      }
    } else {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions /* , locations, path, */ }): void => {
          logger.error('GraphQL ErrorLink', message);

          if (extensions?.exception?.code >= 401 && extensions?.exception?.code <= 403) {
            Router.push({ pathname: AUTH_PAGE, query: { redirect: getRedirect(window.location.pathname) } });
          }
        });
      }
      if (networkError) {
        logger.error('GraphQL NetworkError', networkError.toString());
      }
    }
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    if (cookie) {
      operation.setContext({
        headers: {
          cookie,
          // Authorization: `Bearer`,
        },
      });
    }

    return forward(operation);
  });

  let clientParameters = {};
  let link: ApolloLink;

  const cache = new InMemoryCache().restore(initialState || {});

  if (__SERVER__) {
    const schema = configService?.schema;

    if (0 && schema) {
      link = new SchemaLink({ schema });
    } else {
      // eslint-disable-next-line global-require
      global.fetch = require('node-fetch');

      let fetchOptions: Record<string, any> | undefined;
      if (secure) {
        const https = require('https');

        fetchOptions = {
          agent: new https.Agent({ rejectUnauthorized: false }),
        };
      }

      link = new HttpLink({
        uri: `${secure ? 'https:' : 'http:'}//localhost:${process.env.PORT}/graphql`,
        credentials: 'same-origin',
        fetchOptions,
      });
    }
  } else {
    const httpLink = createUploadLink({
      uri: '/graphql',
      credentials: 'same-origin',
    });
    const wsLink = new WebSocketLink({
      uri: `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/graphql`,
      options: {
        reconnect: true,
      },
    });

    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      httpLink,
    );

    clientParameters = {
      resolvers: stateResolvers,
    };
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__,
    link: from([errorMiddleware, authMiddleware, link]),
    cache,
    ...clientParameters,
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
  MainApp: NextComponentType<AppContext, AppInitialPropsMy, AppContextMy>,
): NextComponentType<AppContext, AppInitialPropsMy, AppContextMy> =>
  class Apollo extends React.Component<AppContextMy> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    static displayName = 'withApolloClient(App)';

    public static async getInitialProps({ AppTree, Component, router, ctx }: AppContext): Promise<AppInitialPropsMy> {
      const appProps =
        typeof MainApp.getInitialProps === 'function'
          ? await MainApp.getInitialProps({ AppTree, Component, router, ctx })
          : { pageProps: { apollo: null } };

      if (__SERVER__) {
        const request = ctx.req as Request;
        const response = ctx.res as Response;
        if (response.finished) {
          return appProps;
        }

        configService = response.locals?.config as ConfigService;
        logger = response.locals?.logger as Logger;
        const secure = response.locals?.secure as boolean;

        const user: User | undefined = request.session?.passport?.user as User;
        const language = user?.settings?.lng || lngFromReq(request) || 'en';
        const isMobile = checkMobile({ ua: request.headers['user-agent'] }) ?? false;
        const context: UserContext = {
          fontSize: user?.settings?.fontSize || FONT_SIZE_NORMAL,
          isMobile,
          language,
        };
        const apolloClient = initApollo({
          cookie: request.headers?.cookie,
          secure,
        });

        if (user) {
          try {
            await apolloClient.query({
              query: CURRENT_USER,
            });
          } catch (error) {
            logger.error(`withApolloClient "writeQuery": ${error.toString()}`, error.toString(), 'withApolloClient', [
              { error },
            ]);
          }
        }

        try {
          const { getDataFromTree } = await import('@apollo/react-ssr');

          await getDataFromTree(
            <AppTree
              {...appProps}
              // disableGeneration
              ctx={ctx}
              Component={Component}
              router={router}
              apolloClient={apolloClient}
              context={context}
            />,
          );
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          if (
            error instanceof ApolloError &&
            !error.graphQLErrors.some(
              (graphQLError) =>
                graphQLError.extensions?.exception?.status >= 401 && graphQLError.extensions?.exception?.status <= 403,
            )
          ) {
            logger.error(
              `withApolloClient "getDataFromTree": ${error.toString()}`,
              error.toString(),
              'withApolloClient',
              { error },
            );
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();

        return {
          ...appProps,
          context,
          apollo: apolloClient.cache.extract(),
          secure,
        };
      }

      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      return {
        ...appProps,
        context: { isMobile: false, language: appProps.initialLanguage },
      };
    }

    public constructor(props: AppContextMy) {
      super(props);

      if (__SERVER__ && props.apolloClient) {
        this.apolloClient = props.apolloClient;
      } else {
        this.apolloClient = initApollo({
          initialState: props.apollo,
          secure: props.secure,
        });
      }
    }

    public render(): React.ReactElement {
      if (__SERVER__ && (this.props.ctx?.res as Response)?.locals.logger) {
        logger = (this.props.ctx?.res as Response)?.locals.logger;
      }

      return <MainApp {...this.props} apolloClient={this.apolloClient} />;
    }
  };
