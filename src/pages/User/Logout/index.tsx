import { useAuth } from '@/api/firebase/useAuth';
import { PageContainer } from '@ant-design/pro-components';
import Spin from 'antd/lib/spin';
import React, { useEffect } from 'react';
import { history, useModel } from '@umijs/max';
import { stringify } from 'querystring';
import { ApolloProvider } from '@apollo/client';
import client from '@/api/graphql/client';
import { CookiesProvider } from 'react-cookie';

const Logout: React.FC = () => {
  const { logout } = useAuth();

  const loginOut = async () => {
    await logout();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  useEffect(() => {
    loginOut();
  }, []);

  return (
    <PageContainer>
      <Spin />
    </PageContainer>
  );
};

const WrappedLogout: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <CookiesProvider>
        <Logout />
      </CookiesProvider>
    </ApolloProvider>
  );
};

export default WrappedLogout;
