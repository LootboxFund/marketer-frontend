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
import SwitchToHostButton from '@/components/SwitchToHostButton';

const MyEventsPage: React.FC = () => {
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
        {`Quickly search for events without remembering campaigns. This page lists all the events you have been involved in.`}
        To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3ODqYvd" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
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
            <$Horizontal spacing={2}>
              <SwitchToHostButton buttonText="Host Own Event" />
              <Popconfirm
                title={
                  <span>
                    {`To add other peoples events into your campaigns, visit the Marketplace and copy
                    an Event ID to add it to a campaign. `}
                    <a href="https://google.com" target="_blank" rel="noreferrer">
                      View Tutorial
                    </a>
                  </span>
                }
                onConfirm={() => {
                  history.push('/marketplace/events');
                }}
                okText="Visit Marketplace"
                cancelText="Cancel"
              >
                <Button type="primary">Add Marketplace Event</Button>
              </Popconfirm>
            </$Horizontal>
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

export default MyEventsPage;
