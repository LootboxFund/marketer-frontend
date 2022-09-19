import type {
  CreateConquestPayload,
  CreateConquestResponseSuccess,
  ListConquestPreviewsResponse,
  MutationCreateConquestArgs,
  QueryListConquestPreviewsArgs,
  ResponseError,
  UpdateConquestPayload,
} from '@/api/graphql/generated/types';
import CreateCampaignForm from '@/components/CreateCampaignForm';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { LIST_CONQUEST_PREVIEWS } from '../CampaignsPage/api.gql';
import { history } from '@umijs/max';
import { CREATE_CONQUEST } from './api.gql';
import styles from './index.less';
import { AdvertiserID } from '@wormgraph/helpers';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt';

const CampaignCreate: React.FC = () => {
  const [createConquestMutation] = useMutation<
    { createConquest: ResponseError | CreateConquestResponseSuccess },
    MutationCreateConquestArgs
  >(CREATE_CONQUEST, {
    refetchQueries: [{ query: LIST_CONQUEST_PREVIEWS, variables: { advertiserID } }],
  });

  const createConquest = async (payload: Omit<UpdateConquestPayload, 'id'>) => {
    const res = await createConquestMutation({
      variables: {
        advertiserID,
        payload: {
          title: payload.title || 'Untitled Campaign',
        },
      },
    });
    if (!res?.data || res?.data?.createConquest?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createConquest?.error?.message || words.anErrorOccured);
    }
    if (res?.data?.createConquest?.__typename === 'CreateConquestResponseSuccess') {
      history.push(`/dashboard/campaigns/id/${res?.data?.createConquest?.conquest?.id}`);
    }
  };

  return (
    <PageContainer>
      <div className={styles.content}>
        <div style={{ maxWidth: '800px' }}>
          <CreateCampaignForm
            onSubmit={createConquest}
            mode="create"
            advertiserID={advertiserID as AdvertiserID}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default CampaignCreate;
