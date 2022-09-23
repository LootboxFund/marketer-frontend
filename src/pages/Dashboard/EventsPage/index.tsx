import type {
  ListEventsOfAdvertiserResponse,
  QueryListEventsOfAdvertiserArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_HISTORICAL_EVENTS } from './api.gql';
import styles from './index.less';
import { TournamentPreview } from '../../../api/graphql/generated/types';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input, message } from 'antd';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';

const EventsPage: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [tournaments, setTournaments] = useState<TournamentPreview[]>([]);
  const { data, loading, error } = useQuery<
    { listEventsOfAdvertiser: ListEventsOfAdvertiserResponse },
    QueryListEventsOfAdvertiserArgs
  >(LIST_HISTORICAL_EVENTS, {
    variables: { advertiserID },
    onCompleted: (data) => {
      if (data?.listEventsOfAdvertiser.__typename === 'ListEventsOfAdvertiserResponseSuccess') {
        const tournaments = data.listEventsOfAdvertiser.tournaments;

        setTournaments(tournaments);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listEventsOfAdvertiser.__typename === 'ResponseError') {
    return <span>{data?.listEventsOfAdvertiser.error?.message || ''}</span>;
  }

  const filterBySearchString = (tournament: TournamentPreview) => {
    return (
      tournament.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      tournament.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <$Vertical>
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Find Event"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button onClick={() => message.info('Add events from the Campaigns Page')}>
              Add Event
            </Button>
          </$Horizontal>
          <br />
          <div className={styles.content}>
            {tournaments.filter(filterBySearchString).map((tournament) => (
              <Link key={tournament.id} to={`/dashboard/events/id/${tournament.id}`}>
                <Card
                  hoverable
                  className={styles.card}
                  cover={
                    <img
                      alt="example"
                      src={tournament.coverPhoto || ''}
                      className={styles.cardImage}
                    />
                  }
                >
                  <Meta title={tournament.title} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default EventsPage;
