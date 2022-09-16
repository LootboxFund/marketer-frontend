import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { manifest } from '@/manifest';
import { auth } from '../firebase/app';

const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === 'dev'
      ? 'http://localhost:8080/graphql'
      : manifest.cloudRun.containers.lootboxServer.fullRoute,
});

const authLink = setContext(async (_, { headers }) => {
  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken(/* forceRefresh */ true);
  } catch (err) {
    token = undefined;
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  name: 'LootboxWidgets',
  version: '1.0',
});

export default client;
