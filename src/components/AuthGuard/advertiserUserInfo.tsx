import { ADVERTISER_ID_COOKIE } from '@/api/constants';
import {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
} from '@/api/graphql/generated/types';
import { GET_ADVERTISER } from '@/components/LoginAccount/api.gql';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useCookies } from 'react-cookie';

export const useAdvertiserUser = () => {
  const [cookies, setCookie] = useCookies([ADVERTISER_ID_COOKIE]);
  const savedAdvertiserID = cookies[ADVERTISER_ID_COOKIE];
  const [advertiserUser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();
  const { data, loading, error } = useQuery<{ advertiserAdminView: AdvertiserAdminViewResponse }>(
    GET_ADVERTISER,
    {
      onCompleted: (data) => {
        if (data?.advertiserAdminView.__typename === 'AdvertiserAdminViewResponseSuccess') {
          const advertiser = data.advertiserAdminView;
          setAdvertiserUser(advertiser);
          setCookie(ADVERTISER_ID_COOKIE, advertiser.id, { path: '/' });
        }
      },
    },
  );
  return {
    advertiserUser: advertiserUser || { id: savedAdvertiserID, name: '', avatar: '' },
    loading,
    error,
  };
};
