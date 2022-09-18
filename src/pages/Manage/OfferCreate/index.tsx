import type {
  CreateConquestPayload,
  CreateOfferResponseSuccess,
  CreateOfferPayload,
  EditOfferPayload,
  ListConquestPreviewsResponse,
  MutationCreateOfferArgs,
  QueryListConquestPreviewsArgs,
  ResponseError,
  UpdateConquestPayload,
} from '@/api/graphql/generated/types';
import CreateOfferForm from '@/components/CreateOfferForm';
import { PageContainer } from '@ant-design/pro-components';
import { useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { history } from '@umijs/max';
import { CREATE_OFFER } from './api.gql';
import styles from './index.less';
import { LIST_CREATED_OFFERS } from '../OffersPage/api.gql';
import { AdvertiserID } from '@wormgraph/helpers';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt';

const OfferCreate: React.FC = () => {
  const [createOfferMutation] = useMutation<
    { createOffer: ResponseError | CreateOfferResponseSuccess },
    MutationCreateOfferArgs
  >(CREATE_OFFER, {
    refetchQueries: [{ query: LIST_CREATED_OFFERS, variables: { advertiserID } }],
  });

  const createOffer = async (payload: Omit<EditOfferPayload, 'id'> | CreateOfferPayload) => {
    const res = await createOfferMutation({
      variables: {
        advertiserID,
        payload: {
          title: payload.title || 'Untitled Offer',
          description: payload.description || '',
          image: payload.image || '',
          advertiserID,
          maxBudget: payload.maxBudget || 1000,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status,
          // @ts-ignore
          affiliateBaseLink: payload.affiliateBaseLink,
          // @ts-ignore
          mmp: payload.mmp,
        },
      },
    });
    if (!res?.data || res?.data?.createOffer?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createOffer?.error?.message || words.anErrorOccured);
    }
    history.push('/manage/offers');
  };

  return (
    <PageContainer>
      <div className={styles.content}>
        <CreateOfferForm
          onSubmit={createOffer}
          mode="create"
          advertiserID={advertiserID as AdvertiserID}
        />
      </div>
    </PageContainer>
  );
};

export default OfferCreate;
