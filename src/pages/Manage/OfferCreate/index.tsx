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
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $InfoDescription } from '@/components/generics';

const OfferCreate: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
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
    if (res?.data?.createOffer?.__typename === 'CreateOfferResponseSuccess') {
      history.push(`/manage/offers/id/${res?.data?.createOffer?.offer?.id}`);
    }
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`An Offer is a promotional incentive to attract new users to your company. Event partners will promote your Offer to their audience. Tracking software is required.`}
        {` `}To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };

  return (
    <PageContainer>
      {renderHelpText()}
      <CreateOfferForm
        onSubmit={createOffer}
        mode="create"
        advertiserID={advertiserID as AdvertiserID}
      />
    </PageContainer>
  );
};

export default OfferCreate;
