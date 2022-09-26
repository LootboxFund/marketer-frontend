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
import { history, useModel } from '@umijs/max';
import { TournamentPreview } from '../../../api/graphql/generated/types';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { Button, Card, Empty, Input, message, Popconfirm } from 'antd';
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

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </$InfoDescription>
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
          {renderHelpText()}
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Find Event"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Popconfirm
              title="Events must first be added to a campaign. Select a campaign from the campaigns page to get started."
              onConfirm={() => {
                history.push('/dashboard/campaigns');
              }}
              okText="Go to Campaigns"
              cancelText="Cancel"
            >
              <Button>Add Event</Button>
            </Popconfirm>
          </$Horizontal>
          <br />
          {!tournaments || tournaments.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You do not have any events yet.
                    Add your first event from the campaigns page!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/dashboard/campaigns">
                <Button type="primary">Go To Campaigns</Button>
              </Link>
            </Empty>
          ) : null}
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
