import { Button, Spin } from 'antd';
import { COLORS } from '@wormgraph/helpers';
import { PropsWithChildren, useState } from 'react';
import { useAuth } from '@/api/firebase/useAuth';
import { useQuery } from '@apollo/client';
import { history, Link, useModel } from '@umijs/max';
import {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/pages/User/Login/api.gql';
import { $Vertical, $Horizontal } from '@/components/generics';

/**
 * strict = forces login
 */
type AuthGuardProps = PropsWithChildren<{ strict?: boolean } & any>;

const AuthGuard = ({ children, strict, ...props }: AuthGuardProps) => {
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

  if (!user) {
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
          <br />
          <a href={`${window.location.origin}/user/login`}>
            <Button>LOGIN</Button>
          </a>
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
