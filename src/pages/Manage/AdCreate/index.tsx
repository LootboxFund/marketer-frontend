import {
  CreateAdPayload,
  CreateAdResponseSuccess,
  CreativeType,
  ListConquestPreviewsResponse,
  MutationCreateAdArgs,
  QueryListConquestPreviewsArgs,
  ResponseError,
} from '@/api/graphql/generated/types';
import CreateAdForm from '@/components/CreateAdForm';
import DeviceSimulator from '@/components/DeviceSimulator';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useMutation, useQuery } from '@apollo/client';
import { AdvertiserID, AspectRatio } from '@wormgraph/helpers';
import Spin from 'antd/lib/spin';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CREATE_AD } from './api.gql';
import styles from './index.less';
import { $ColumnGap, placeholderImage } from '@/components/generics';
import { LIST_ADS_PREVIEWS } from '../AdsPage/api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const AD_PREVIEW = {
  themeColor: '#000000',
  callToAction: 'Learn More',
  creativeType: CreativeType.Image,
  creativeLinks: [placeholderImage],
  aspectRatio: AspectRatio.Portrait9x16,
};

const AdCreate: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  console.log(advertiserUser);
  console.log(advertiserID);
  // do the rest
  const [createAdMutation] = useMutation<
    { createAd: ResponseError | CreateAdResponseSuccess },
    MutationCreateAdArgs
  >(CREATE_AD, {
    refetchQueries: [{ query: LIST_ADS_PREVIEWS, variables: { advertiserID } }],
  });

  const createAd = async (payload: CreateAdPayload) => {
    const res = await createAdMutation({
      variables: {
        payload: {
          advertiserID: payload.advertiserID,
          description: payload.description,
          name: payload.name,
          placement: payload.placement,
          publicInfo: payload.publicInfo,
          status: payload.status,
          creative: payload.creative,
        },
      },
    });
    if (!res?.data || res?.data?.createAd?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createAd?.error?.message || words.anErrorOccured);
    }
    if (res?.data?.createAd?.__typename === 'CreateAdResponseSuccess') {
      history.push(`/manage/ads/id/${res?.data?.createAd?.ad?.id}`);
    }
  };

  return (
    <PageContainer>
      <div className={styles.content}>
        <div style={{ width: '1000px', maxWidth: '1000px' }}>
          <CreateAdForm
            onSubmitCreate={createAd}
            mode="create"
            advertiserID={advertiserID as AdvertiserID}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default AdCreate;
