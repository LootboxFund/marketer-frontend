import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Spin, Image, Popconfirm } from 'antd';
import { history, useModel } from '@umijs/max';
import React, { useState } from 'react';
import styles from './index.less';
import { useAuth } from '@/api/firebase/useAuth';
import { stringify } from 'querystring';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  AdvertiserAdminViewResponse,
  AffiliatePublicViewResponse,
  MutationUpdateAdvertiserDetailsArgs,
  QueryAffiliatePublicViewArgs,
  ResponseError,
  UpdateAdvertiserDetailsPayload,
  UpdateAdvertiserDetailsResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/components/LoginAccount/api.gql';
import { $Horizontal, $InfoDescription, $Vertical, $ColumnGap } from '@/components/generics';
import EditAdvertiserForm from '../../../components/EditAdvertiserForm/index';
import { AdvertiserAdminViewResponseSuccess } from '../../../api/graphql/generated/types';
import { AdvertiserID } from '@wormgraph/helpers';
import { UPDATE_ADVERTISER } from './api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import SwitchToHostButton from '@/components/SwitchToHostButton';

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
    return (
      <$Vertical>
        <span>{data?.advertiserAdminView.error?.message || ''}</span>
        <Link to="/user/logout">
          <Button style={{ marginTop: '20px' }}>Log Out</Button>
        </Link>
      </$Vertical>
    );
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
          website: payload.website,
          visibility: payload.visibility,
        },
        advertiserID: advertiserID,
      },
    });
    if (!res?.data || res?.data?.updateAdvertiser?.__typename === 'ResponseError') {
      throw new Error(
        res?.data?.updateAdvertiser?.__typename === 'ResponseError'
          ? res?.data?.updateAdvertiser?.error?.message
          : 'An error occurred',
      );
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
  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is your advertiser profile page. Be sure to fill out all your details so that you
        appear in the marketplace for partners to work with. To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3WvNEkD" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
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
          {renderHelpText()}
          <$Horizontal style={{ maxWidth }}>
            {advertiser && (
              <EditAdvertiserForm
                advertiser={{
                  id: advertiser.id as AdvertiserID,
                  name: advertiser.name,
                  description: advertiser.description || '',
                  avatar: advertiser.avatar,
                  publicContactEmail: advertiser.publicContactEmail || '',
                  website: advertiser.website || '',
                  visibility: advertiser.visibility,
                }}
                onSubmit={updateAdvertiser}
                mode="view-edit"
              />
            )}

            <Image width={200} src={advertiser.avatar || ''} />
          </$Horizontal>
          <br />
          <$Horizontal>
            <SwitchToHostButton />
            <$ColumnGap />
            <Button onClick={() => loginOut()} type="ghost">
              Logout
            </Button>
          </$Horizontal>
        </div>
      )}
    </PageContainer>
  );
};

export default AccountPage;
