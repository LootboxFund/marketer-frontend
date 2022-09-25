import type {
  AdSet,
  ViewAdSetResponse,
  QueryListConquestPreviewsArgs,
  QueryViewAdSetArgs,
  ListAdsOfAdvertiserResponse,
  QueryListAdsOfAdvertiserArgs,
  Ad,
  OfferPreview,
  ListCreatedOffersResponse,
  QueryListCreatedOffersArgs,
  MutationEditAdSetArgs,
  EditAdSetResponseSuccess,
  ResponseError,
  EditAdSetPayload,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import CreateAdSetForm from '@/components/CreateAdSetForm';
import { $Vertical, $Horizontal, $ColumnGap, $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import { useParams } from '@umijs/max';
import { AdID, AdSetID, AdvertiserID, OfferID } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import { Image } from 'antd';
import React, { useState } from 'react';
import { LIST_ADSETS_PREVIEWS } from '../AdSetsPage/api.gql';
import { LIST_ADS_PREVIEWS } from '../AdsPage/api.gql';
import { LIST_CREATED_OFFERS } from '../OffersPage/api.gql';
import { EDIT_AD_SET, VIEW_AD_SET } from './api.gql';
import styles from './index.less';

const AdSetPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const { adSetID } = useParams();
  const [adSet, setAdSet] = useState<AdSet>();
  // GET AD SET
  const { data, loading, error } = useQuery<{ viewAdSet: ViewAdSetResponse }, QueryViewAdSetArgs>(
    VIEW_AD_SET,
    {
      variables: { adSetID: adSetID || ('' as AdSetID) },
      onCompleted: (data) => {
        if (data?.viewAdSet.__typename === 'ViewAdSetResponseSuccess') {
          const adSet = data.viewAdSet.adSet;
          console.log(adSet);
          setAdSet(adSet);
        }
      },
    },
  );
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
      variables: { advertiserID },
      onCompleted: (data) => {
        if (data?.listCreatedOffers.__typename === 'ListCreatedOffersResponseSuccess') {
          const offers = data.listCreatedOffers.offers;
          // console.log(offers);
          setOffers(offers);
        }
      },
    },
  );
  // EDIT AD SET
  const [editAdSetMutation] = useMutation<
    { editOffer: ResponseError | EditAdSetResponseSuccess },
    MutationEditAdSetArgs
  >(EDIT_AD_SET, {
    refetchQueries: [
      {
        query: VIEW_AD_SET,
        variables: { adSetID: (adSetID || '') as AdSetID },
      },
      { query: LIST_ADSETS_PREVIEWS, variables: { advertiserID } },
    ],
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewAdSet.__typename === 'ResponseError') {
    return <span>{data?.viewAdSet.error?.message || ''}</span>;
  }
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

  const editAdSet = async (payload: Omit<EditAdSetPayload, 'id'>) => {
    if (!adSet) return;
    console.log(`Got a fat ad set...`);
    console.log(payload);
    const res = await editAdSetMutation({
      variables: {
        payload: {
          ...payload,
          id: adSet.id,
        },
      },
    });
    if (!res?.data || res?.data?.editOffer?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editOffer?.error?.message || words.anErrorOccured);
    }
  };

  const breadLine = [
    { title: 'Manage', route: '/manage' },
    { title: 'Ad Sets', route: '/manage/adsets' },
    { title: adSet?.name || '', route: `/manage/adsets/id/${adSet?.id}` },
  ];
  const maxWidth = '1000px';
  const renderHelpText = () => {
    return (
      <$InfoDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
    );
  };
  return (
    <div style={{ maxWidth }}>
      {loading || !adSet ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{adSet.name}</h1>
          <br />
          {renderHelpText()}
          <$Horizontal>
            <CreateAdSetForm
              onSubmitEdit={editAdSet}
              mode="view-edit"
              adSet={{
                ...adSet,
                id: adSet.id as AdSetID,
                description: adSet.description || '',
                advertiserID:
                  (adSet.advertiserID as AdvertiserID) || (advertiserID as AdvertiserID),
                adIDs: adSet.adIDs as AdID[],
                offerIDs: adSet.offerIDs as OfferID[],
                thumbnail: adSet.thumbnail || '',
              }}
              advertiserID={advertiserID as AdvertiserID}
              listOfAds={ads}
              listOfOffers={offers}
            />
            <$ColumnGap />
            <Image width={200} src={adSet.thumbnail || ''} />
          </$Horizontal>
        </div>
      )}
    </div>
  );
};

export default AdSetPage;
