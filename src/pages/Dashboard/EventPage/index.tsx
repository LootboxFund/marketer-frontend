import type {
  TournamentResponse,
  QueryTournamentArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Image } from 'antd';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { VIEW_TOURNAMENT } from './api.gql';
import styles from './index.less';
import { useParams } from '@umijs/max';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { TournamentID } from '@wormgraph/helpers';
import { $ColumnGap, $Horizontal, $InfoDescription } from '@/components/generics';
import CreateEventForm from '@/components/CreateEventForm';

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
    { title: tournament?.title || '', route: `/dashboard/events/id/${tournament?.id}` },
  ];
  const maxWidth = '1000px';

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`View in-depth details about an Event to help make informed decisions. `}
        To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <div style={{ maxWidth }}>
      {loading || !tournament ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <$Horizontal justifyContent="space-between">
            <h1>{tournament.title}</h1>
            <a
              href={`https://www.lootbox.fund/watch?tournament=${tournament.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button type="primary">View Event</Button>
            </a>
          </$Horizontal>
          {renderHelpText()}
          <$Horizontal justifyContent="flex-start" style={{ width: '100%' }}>
            <CreateEventForm
              tournament={{
                id: tournament.id,
                title: tournament.title,
                description: tournament.description,
                tournamentDate: tournament.tournamentDate,
                tournamentLink: tournament.tournamentLink || '',
                coverPhoto: tournament.coverPhoto || '',
                magicLink: tournament.magicLink || '',
                prize: tournament.prize || '',
                communityURL: tournament.communityURL || '',
              }}
              mode="view-only"
            />
            <$ColumnGap />
            <Image width={200} src={tournament.coverPhoto || ''} />
          </$Horizontal>
        </div>
      )}
    </div>
  );
};

export default EventPage;
