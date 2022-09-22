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

const EventPage: React.FC = () => {
  const { tournamentID } = useParams();
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [tournament, setTournament] = useState<Tournament>();
  const { data, loading, error } = useQuery<
    { viewTournament: TournamentResponse },
    QueryTournamentArgs
  >(VIEW_TOURNAMENT, {
    variables: { id: tournamentID },
    onCompleted: (data) => {
      if (data?.viewTournament.__typename === 'TournamentResponseSuccess') {
        const tournament = data.viewTournament.tournament;
        console.log(tournament);
        setTournament(tournament);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewTournament.__typename === 'ResponseError') {
    return <span>{data?.viewTournament.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Events', route: '/dashboard/events' },
    { title: tournament?.title || '', route: `/dashboard/event/id/${tournament?.id}` },
  ];

  return (
    <PageContainer>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{tournament.title}</h1>
          <br />
        </div>
      )}
    </PageContainer>
  );
};

export default EventPage;
