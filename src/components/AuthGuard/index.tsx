import { Button, ConfigProvider, Spin } from 'antd';
import { COLORS } from '@wormgraph/helpers';
import { PropsWithChildren, useState } from 'react';
import { useAuth } from '@/api/firebase/useAuth';
import { useQuery } from '@apollo/client';
import { history, Link, useModel } from '@umijs/max';
import enUS from 'antd/es/locale/en_US';
import {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/components/LoginAccount/api.gql';
import { $Vertical, $Horizontal } from '@/components/generics';
import { ADVERTISER_ID_COOKIE } from '../../api/constants';
import { useCookies } from 'react-cookie';
import RegisterAccount from '../RegisterAccount';
import Login from '@/pages/User/Login';
import { IntlProvider } from '@ant-design/pro-components';

/**
 * strict = forces login
 */
type AuthGuardProps = PropsWithChildren<{ strict?: boolean } & any>;

const AuthGuard = ({ children, strict, ...props }: AuthGuardProps) => {
  const [cookies, setCookie] = useCookies([ADVERTISER_ID_COOKIE]);
  const [advertiserUser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();

  const { user } = useAuth();

  const { data, loading, error } = useQuery<{ advertiserAdminView: AdvertiserAdminViewResponse }>(
    GET_ADVERTISER,
    {
      onCompleted: (data) => {
        if (data?.advertiserAdminView.__typename === 'AdvertiserAdminViewResponseSuccess') {
          const advertiser = data.advertiserAdminView;
          setAdvertiserUser(advertiser);
        }
      },
    },
  );

  // if (user && !cookies[ADVERTISER_ID_COOKIE]) {
  //   console.log('hello');
  //   if (window.location.pathname !== `/user/login` && window.location.pathname !== `/user/logout`) {
  //     console.log('world');
  //     return (
  //       <$Horizontal
  //         justifyContent="center"
  //         verticalCenter
  //         style={{ width: '100vw', height: '100vh' }}
  //       >
  //         <RegisterAccount
  //           isModalOpen={true}
  //           setIsModalOpen={() => {}}
  //           initialView="confirm_upgrade"
  //         />
  //       </$Horizontal>
  //     );
  //   }
  // }
  const shouldRedirectToLogin =
    (user === undefined && cookies[ADVERTISER_ID_COOKIE] === undefined) ||
    (!user && !cookies[ADVERTISER_ID_COOKIE]);

  if (shouldRedirectToLogin) {
    if (window.location.pathname !== `/user/login`) {
      window.location.href = '/user/login';
      return;
    }
  }
  if (!user && cookies[ADVERTISER_ID_COOKIE]) {
    if (window.location.pathname === `/user/login`) {
      return children;
    }
    return (
      <$Horizontal
        justifyContent="center"
        verticalCenter
        style={{ width: '100vw', height: '100vh' }}
      >
        <$Vertical>
          <Spin style={{ margin: 'auto' }} />
        </$Vertical>
      </$Horizontal>
    );
  }

  if (loading) {
    return <Spin style={{ margin: 'auto' }} />;
  }

  return children;
};

export default AuthGuard;
