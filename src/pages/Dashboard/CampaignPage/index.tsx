import type {
  Conquest,
  GetConquestResponse,
  MutationUpdateConquestArgs,
  QueryGetConquestArgs,
  ResponseError,
  TournamentPreview,
  UpdateConquestPayload,
  UpdateConquestResponseSuccess,
} from '@/api/graphql/generated/types';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import CreateCampaignForm from '@/components/CreateCampaignForm';
import { $Horizontal } from '@/components/generics';
import { useMutation, useQuery } from '@apollo/client';
import { Card, Empty, Image } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GET_CONQUEST, UPDATE_CONQUEST } from './api.gql';
import styles from './index.less';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt';

const Template: React.FC = () => {
  const { campaignID } = useParams();

  const [conquest, setConquest] = useState<Conquest>();
  const [tournamentPreviews, setTournamentPreviews] = useState<TournamentPreview[]>([]);

  const { data, loading, error } = useQuery<
    { getConquest: GetConquestResponse },
    QueryGetConquestArgs
  >(GET_CONQUEST, {
    variables: { advertiserID, conquestID: campaignID || '' },
    onCompleted: (data) => {
      if (data?.getConquest.__typename === 'GetConquestResponseSuccess') {
        const conquest = data.getConquest.conquest;
        const tournaments = data.getConquest.tournaments;
        console.log(conquest);
        console.log(tournaments);
        setConquest(conquest);
        setTournamentPreviews(tournaments);
      }
    },
  });
  const [updateConquestMutation] = useMutation<
    { updateConquest: ResponseError | UpdateConquestResponseSuccess },
    MutationUpdateConquestArgs
  >(UPDATE_CONQUEST, {
    refetchQueries: [
      { query: GET_CONQUEST, variables: { advertiserID, conquestID: campaignID || '' } },
    ],
  });
  if (!campaignID) {
    return <span>Campaign ID not found</span>;
  }
  const updateConquest = async (payload: Omit<UpdateConquestPayload, 'id'>) => {
    const res = await updateConquestMutation({
      variables: {
        payload: {
          ...payload,
          id: campaignID,
        },
        advertiserID: advertiserID,
      },
    });
    if (!res?.data || res?.data?.updateConquest?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.updateConquest?.error?.message || words.anErrorOccured);
    }
  };
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.getConquest.__typename === 'ResponseError') {
    return <span>{data?.getConquest.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Campaigns', route: '/dashboard/campaigns' },
    { title: conquest?.title || '', route: `/dashboard/campaigns/id/${conquest?.id}` },
  ];
  return (
    <div>
      {loading || !conquest ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{conquest.title}</h1>
          <br />
          <$Horizontal style={{ maxWidth: '1000px' }}>
            <CreateCampaignForm
              conquest={{
                title: conquest.title || '',
                description: conquest.description || '',
                startDate: conquest.startDate || 0,
                endDate: conquest.endDate || 0,
                status: conquest.status,
              }}
              onSubmit={updateConquest}
              mode="view-edit"
            />
            <Image width={200} src={conquest.image || ''} />
          </$Horizontal>
          <br />
          <br />
          <h2>Tournaments</h2>
          <br />
          {tournamentPreviews.length > 0 ? (
            <div className="tournaments_grid">
              {tournamentPreviews.map((tp) => {
                return (
                  <Card
                    key={tp.id}
                    hoverable
                    style={{ flex: 1, maxWidth: '250px' }}
                    cover={<img alt="example" src={tp.coverPhoto || ''} />}
                  >
                    <Meta title={tp.title} />
                  </Card>
                );
              })}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      )}
    </div>
  );
};

export default Template;
