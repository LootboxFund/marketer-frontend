import type {
  TournamentResponse,
  QueryTournamentArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_TOURNAMENT } from './api.gql';
import styles from './index.less';
import { useParams } from '@umijs/max';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { TournamentID } from '@wormgraph/helpers';

const EventPage: React.FC = () => {
  const { eventID } = useParams();
  console.log(`eventID`);
  console.log(eventID);
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [tournament, setTournament] = useState<Tournament>();
  const { data, loading, error } = useQuery<
    { tournament: TournamentResponse },
    QueryTournamentArgs
  >(VIEW_TOURNAMENT, {
    variables: { id: eventID || '' },
    onCompleted: (data) => {
      if (data?.tournament.__typename === 'TournamentResponseSuccess') {
        const tournament = data.tournament.tournament;
        setTournament(tournament);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.tournament.__typename === 'ResponseError') {
    return <span>{data?.tournament.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Events', route: '/dashboard/events' },
    { title: tournament?.title || '', route: `/dashboard/event/id/${tournament?.id}` },
  ];

  return (
    <div>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{tournament.title}</h1>
          <br />
          <p>{JSON.stringify(tournament, null, '\t')}</p>
        </div>
      )}
    </div>
  );
};

export default EventPage;
