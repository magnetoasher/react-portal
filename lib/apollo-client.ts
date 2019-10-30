/** @format */

// #region Imports NPM
import fetch from 'isomorphic-fetch';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { PersistentStorage, PersistedData } from 'apollo-cache-persist/types';
import { concat, ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';
import { HttpLink, createHttpLink } from 'apollo-link-http';
// import { WebSocketLink } from 'apollo-link-ws';
// #endregion
// #region Imports Local
import stateResolvers from './state-link';
// #endregion

let apollo: ApolloClient<NormalizedCacheObject>;

const create = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  // Create an http link:
  let httpLink: ApolloLink;

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Cookie: cookie,
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }): any => {
    if (graphQLErrors) {
      // TODO: реализовать https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error
      graphQLErrors.map(({ message, locations, path }): any =>
        console.error('[GraphQL error]: Path:', path, 'Message:', message, 'Location:', locations),
      );
    }
    if (networkError) {
      console.error('[Network error]:', networkError);
    }
  });

  let clientParams = {};
  const cache = new InMemoryCache().restore(initialState);

  if (__SERVER__) {
    global.fetch = fetch;

    httpLink = createHttpLink({
      uri: `http://localhost:${process.env.PORT}/graphql`,
    });
  } else {
    // const subscriptionsUri = `${window.location.origin.replace(
    //   'http',
    //   'ws',
    // )}/graphql`; // __WEBSOCKET_URI__
    // Create a WebSocket link:
    // const wsLink = new WebSocketLink({
    //   uri: subscriptionsUri,
    //   options: {
    //     reconnect: true,
    //     // connectionParams: async () => {
    //     //   return { token: localStorage.getItem(SESSION) };
    //     // },
    //     connectionCallback: (errors: Error[], _result: any): any => {
    //       if (errors) {
    //         console.error('[Error in webSocket]:', errors);
    //       }
    //     },
    //   },
    // });

    httpLink = createHttpLink({
      uri: `/graphql`,
    });

    clientParams = {
      resolvers: stateResolvers,
    };

    try {
      // See above for additional options, including other storage providers.
      persistCache({
        cache,
        storage: window.localStorage as PersistentStorage<PersistedData<NormalizedCacheObject>>,
      });
    } catch (error) {
      console.error('Error restoring Apollo cache', error);
    }
  }

  return new ApolloClient({
    connectToDevTools: !__SERVER__,
    ssrMode: __SERVER__, // Disables forceFetch on the server (so queries are only run once)
    link: concat(authLink.concat(errorLink), httpLink),
    cache,
    ...clientParams,
  });
};

export const apolloClient = (initialState = {}, cookie?: string): ApolloClient<NormalizedCacheObject> => {
  if (__SERVER__) {
    return create(initialState, cookie);
  }

  if (!apollo) {
    apollo = create(initialState, cookie);
  }

  return apollo;
};
