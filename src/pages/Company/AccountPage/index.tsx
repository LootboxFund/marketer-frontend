import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Spin, Image } from 'antd';
import { history, useModel } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';
import { useAuth } from '@/api/firebase/useAuth';
import { stringify } from 'querystring';
import { useMutation, useQuery } from '@apollo/client';
import {
  AdvertiserAdminViewResponse,
  MutationUpdateAdvertiserDetailsArgs,
  ResponseError,
  UpdateAdvertiserDetailsPayload,
  UpdateAdvertiserDetailsResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/pages/User/Login/api.gql';
import { $Horizontal } from '@/components/generics';
import EditAdvertiserForm from '../../../components/EditAdvertiserForm/index';
import { AdvertiserAdminViewResponseSuccess } from '../../../api/graphql/generated/types';
import { AdvertiserID } from '@wormgraph/helpers';
import { UPDATE_ADVERTISER } from './api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const AccountPage: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const { logout } = useAuth();
  const [advertiser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();
  // GET ADVERTISER
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
  // UPDATE ADVERTISER
  const [updateAdvertiserMutation] = useMutation<
    { updateAdvertiser: ResponseError | UpdateAdvertiserDetailsResponseSuccess },
    MutationUpdateAdvertiserDetailsArgs
  >(UPDATE_ADVERTISER, {
    refetchQueries: [{ query: GET_ADVERTISER }],
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.advertiserAdminView.__typename === 'ResponseError') {
    return <span>{data?.advertiserAdminView.error?.message || ''}</span>;
  } else if (!data) {
    return null;
  }
  const updateAdvertiser = async (payload: UpdateAdvertiserDetailsPayload) => {
    const res = await updateAdvertiserMutation({
      variables: {
        payload: {
          name: payload.name,
          description: payload.description,
          avatar: payload.avatar,
          publicContactEmail: payload.publicContactEmail,
        },
        advertiserID: advertiserID,
      },
    });
    if (!res?.data || res?.data?.updateAdvertiser?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.updateAdvertiser?.error?.message || words.anErrorOccured);
    }
  };
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
  const maxWidth = '1000px';
  return (
    <PageContainer>
      {loading || !advertiser ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <$Horizontal style={{ maxWidth }}>
            <EditAdvertiserForm
              advertiser={{
                id: advertiser.id as AdvertiserID,
                name: advertiser.name,
                description: advertiser.description || '',
                avatar: advertiser.avatar,
                publicContactEmail: advertiser.publicContactEmail || '',
              }}
              onSubmit={updateAdvertiser}
              mode="view-edit"
            />
            <Image width={200} src={advertiser.avatar || ''} />
          </$Horizontal>
          <br />
          <Button onClick={() => loginOut()} type="ghost">
            Logout
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default AccountPage;
