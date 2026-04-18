import { ApolloClient, InMemoryCache } from '@apollo/client';

if (!process.env.REACT_APP_GRAPHQL_URL) {
  throw new Error('REACT_APP_GRAPHQL_URL is not configured');
}

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URL,
  cache: new InMemoryCache(),
});
