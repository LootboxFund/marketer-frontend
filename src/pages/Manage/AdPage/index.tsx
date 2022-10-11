import type {
  ViewAdResponse,
  QueryListConquestPreviewsArgs,
  QueryViewAdArgs,
  Ad,
  EditAdPayload,
  EditAdResponseSuccess,
  ResponseError,
  MutationEditAdArgs,
} from '@/api/graphql/generated/types';
import { Image } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { EDIT_AD, VIEW_AD } from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import { AdID, AdvertiserID } from '@wormgraph/helpers';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import CreateAdForm, { AdSampleCallToActions } from '@/components/CreateAdForm';
import { $ColumnGap, $Horizontal, $InfoDescription } from '@/components/generics';
import { LIST_ADS_PREVIEWS } from '../AdsPage/api.gql';
import DeviceSimulator from '@/components/DeviceSimulator';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const AdPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const { adID } = useParams();
  const [ad, setAd] = useState<Ad>();
  // VIEW AD
  const { data, loading, error } = useQuery<{ viewAd: ViewAdResponse }, QueryViewAdArgs>(VIEW_AD, {
    variables: { adID: adID as AdID },
    onCompleted: (data) => {
      if (data?.viewAd.__typename === 'ViewAdResponseSuccess') {
        const ad = data.viewAd.ad;

        setAd(ad);
      }
    },
  });
  // EDIT AD
  const [editAdMutation] = useMutation<
    { editAd: ResponseError | EditAdResponseSuccess },
    MutationEditAdArgs
  >(EDIT_AD, {
    refetchQueries: [
      { query: VIEW_AD, variables: { adID: adID as AdID } },
      { query: LIST_ADS_PREVIEWS, variables: { advertiserID } },
    ],
  });
  const editAd = async (payload: Omit<EditAdPayload, 'id'>) => {
    const res = await editAdMutation({
      variables: {
        payload: {
          ...payload,
          id: adID as AdID,
        },
      },
    });
    if (!res?.data || res?.data?.editAd?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editAd?.error?.message || words.anErrorOccured);
    }
  };

  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewAd.__typename === 'ResponseError') {
    return <span>{data?.viewAd.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Manage', route: '/manage' },
    { title: 'Creatives', route: '/manage/ads' },
    { title: ad?.name || '', route: `/manage/ads/id/${ad?.id}` },
  ];

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`Here you can manage your Ad Creative and preview how it will appear on devices. You can customize the image, video, theme color and call to action.`}
        {` `}To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <div>
      {loading || !ad ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{ad.name}</h1>
          {renderHelpText()}
          <div style={{ minWidth: '1000px', maxWidth: '1000px' }}>
            <CreateAdForm
              ad={{
                id: ad.id,
                advertiserID: advertiserID as AdvertiserID,
                name: ad.name,
                description: ad.description || '',
                status: ad.status,
                placement: ad.placement,
                publicInfo: ad.publicInfo,
                creative: {
                  creativeType: ad.creative.creativeType,
                  creativeLinks: ad.creative.creativeLinks,
                  callToAction: ad.creative.callToAction as AdSampleCallToActions,
                  thumbnail: ad.creative.thumbnail,
                  infographicLink: ad.creative.infographicLink || '',
                  aspectRatio: ad.creative.aspectRatio,
                  themeColor: ad.creative.themeColor,
                },
              }}
              advertiserID={advertiserID as AdvertiserID}
              mode="view-edit"
              onSubmitEdit={editAd}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdPage;
