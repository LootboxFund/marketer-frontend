import type {
  BattleFeedResponse,
  BattleFeedResponseSuccess,
  ListConquestPreviewsResponse,
  QueryBattleFeedArgs,
  QueryListConquestPreviewsArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Button, Card, Input, message } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { QUERY_BATTLE_FEED } from './api.gql';
import styles from './index.less';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';

const EventsGallery: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [searchString, setSearchString] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [lastTournament, setLastTournament] = useState<null | string>(null);
  const { data, loading, error } = useQuery<
    { battleFeed: BattleFeedResponse },
    QueryBattleFeedArgs
  >(QUERY_BATTLE_FEED, {
    variables: { first: 6, after: lastTournament },
    onCompleted: (data) => {
      if (data?.battleFeed?.__typename === 'BattleFeedResponseSuccess') {
        const nodes = data.battleFeed.edges;
        setTournaments([...tournaments, ...nodes.map((node) => node.node)]);
      }
    },
  });

  const startsToday = 'Starts today';

  const battleFinished = 'Battle finished';

  if (error) {
    return <span>{error?.message || 'An error occurred'}</span>;
  } else if (data?.battleFeed?.__typename === 'ResponseError') {
    return <span>{data?.battleFeed?.error?.message || 'An error occurred'}</span>;
  }

  const { pageInfo } = (data?.battleFeed as BattleFeedResponseSuccess) || {};

  const handleMore = () => {
    setLastTournament(pageInfo?.endCursor || null);
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`The Events Marketplace lets you find existing gaming competitions and other community events which you can advertiser in. Use this if you do NOT want to be the main advertiser.`}
        {` `}To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
        </span>
      </$InfoDescription>
    );
  };

  const filterBySearchString = (tournament: Tournament) => {
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
          {renderHelpText()}

          <Input.Search
            placeholder="Find Event"
            allowClear
            onChange={(e) => setSearchString(e.target.value)}
            onSearch={setSearchString}
            style={{ width: 200 }}
          />
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
                  actions={[
                    <EyeOutlined key="view" />,
                    <CopyOutlined
                      key="copy"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(tournament.id);
                        message.success('Copied Event ID to clipboard');
                      }}
                    />,
                  ]}
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

export default EventsGallery;
