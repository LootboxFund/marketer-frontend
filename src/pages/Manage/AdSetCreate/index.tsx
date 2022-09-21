import type {
  Ad,
  CreateAdSetPayload,
  CreateAdSetResponseSuccess,
  ListAdsOfAdvertiserResponse,
  ListConquestPreviewsResponse,
  ListCreatedOffersResponse,
  MutationCreateAdSetArgs,
  OfferPreview,
  QueryListAdsOfAdvertiserArgs,
  QueryListConquestPreviewsArgs,
  QueryListCreatedOffersArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import { AdvertiserID } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import { history } from '@umijs/max';
import React, { useState } from 'react';
import { LIST_ADSETS_PREVIEWS } from '../AdSetsPage/api.gql';
import { CREATE_AD_SET } from './api.gql';
import styles from './index.less';
import CreateAdSetForm from '@/components/CreateAdSetForm';
import { $Vertical } from '@/components/generics';
import { LIST_ADS_PREVIEWS } from '../AdsPage/api.gql';
import { LIST_CREATED_OFFERS } from '../OffersPage/api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const AdSetCreate: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  // CREATE AD SET
  const [createAdSetMutation] = useMutation<
    { createAdSet: ResponseError | CreateAdSetResponseSuccess },
    MutationCreateAdSetArgs
  >(CREATE_AD_SET, {
    refetchQueries: [{ query: LIST_ADSETS_PREVIEWS, variables: { advertiserID } }],
  });
  // LIST ADS
  const [ads, setAds] = React.useState<Ad[]>([]);
  const {
    data: listAdsData,
    loading: listAdsLoading,
    error: listAdsError,
  } = useQuery<{ listAdsOfAdvertiser: ListAdsOfAdvertiserResponse }, QueryListAdsOfAdvertiserArgs>(
    LIST_ADS_PREVIEWS,
    {
      variables: { advertiserID },
      onCompleted: (data) => {
        if (data?.listAdsOfAdvertiser.__typename === 'ListAdsOfAdvertiserResponseSuccess') {
          const res = data.listAdsOfAdvertiser.ads;
          // console.log(res);
          setAds(res);
        }
      },
    },
  );
  // LIST OFFERS
  const [offers, setOffers] = useState<OfferPreview[]>([]);
  const {
    data: listOffersData,
    loading: listOffersLoading,
    error: listOffersError,
  } = useQuery<{ listCreatedOffers: ListCreatedOffersResponse }, QueryListCreatedOffersArgs>(
    LIST_CREATED_OFFERS,
    {
      variables: { advertiserID: 'p7BpSqP6U4n4NEanEcFt' },
      onCompleted: (data) => {
        if (data?.listCreatedOffers.__typename === 'ListCreatedOffersResponseSuccess') {
          const offers = data.listCreatedOffers.offers;
          // console.log(offers);
          setOffers(offers);
        }
      },
    },
  );

  if (listOffersError) {
    return <span>{listOffersError?.message || ''}</span>;
  } else if (listOffersData?.listCreatedOffers.__typename === 'ResponseError') {
    return <span>{listOffersData?.listCreatedOffers.error?.message || ''}</span>;
  }
  if (listAdsError) {
    return <span>{listAdsError?.message || ''}</span>;
  } else if (listAdsData?.listAdsOfAdvertiser.__typename === 'ResponseError') {
    return <span>{listAdsData?.listAdsOfAdvertiser.error?.message || ''}</span>;
  }

  const createAdSet = async (payload: CreateAdSetPayload) => {
    const res = await createAdSetMutation({
      variables: {
        payload: {
          name: payload.name,
          description: payload.description,
          advertiserID,
          status: payload.status,
          placement: payload.placement,
          adIDs: payload.adIDs,
          offerIDs: payload.offerIDs,
        },
      },
    });
    if (!res?.data || res?.data?.createAdSet?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createAdSet?.error?.message || words.anErrorOccured);
    }
    if (res?.data?.createAdSet?.__typename === 'CreateAdSetResponseSuccess') {
      history.push(`/manage/adsets/id/${res?.data?.createAdSet?.adSet?.id}`);
    }
  };
  // console.log(ads);
  // console.log(offers);
  return (
    <PageContainer>
      {listAdsLoading && listOffersLoading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <$Vertical style={{ width: '800px', maxWidth: '800px' }}>
            <CreateAdSetForm
              onSubmitCreate={createAdSet}
              mode="create"
              advertiserID={advertiserID as AdvertiserID}
              listOfAds={ads}
              listOfOffers={offers}
            />
          </$Vertical>
        </div>
      )}
    </PageContainer>
  );
};

export default AdSetCreate;
