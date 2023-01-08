import type {
  BattleFeedResponse,
  BattleFeedResponseSuccess,
  QueryBattleFeedArgs,
  Tournament,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Card, Input, message, Pagination } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useMemo, useState } from 'react';
import { QUERY_BATTLE_FEED } from './api.gql';
import styles from './index.less';
import { $InfoDescription, $Vertical } from '@/components/generics';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';

const EventsGallery: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const [pageSize, setPageSize] = useState<number>(12);
  const [pageNumber, setPageNumber] = useState(1);
  const { id: advertiserID } = advertiserUser;
  const [searchString, setSearchString] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [lastTournament, setLastTournament] = useState<null | string>(null);
  const { data, loading, error } = useQuery<
    { battleFeed: BattleFeedResponse },
    QueryBattleFeedArgs
  >(QUERY_BATTLE_FEED, {
    variables: { first: 10000, after: lastTournament },
    onCompleted: (data) => {
      if (data?.battleFeed?.__typename === 'BattleFeedResponseSuccess') {
        const nodes = data.battleFeed.edges;
        setTournaments([...tournaments, ...nodes.map((node) => node.node)]);
      }
    },
  });

  const filterBySearchString = (tournament: Tournament) => {
    return (
      tournament.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      tournament.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const { paginatedData } = useMemo(() => {
    let paginatedData: Tournament[] = [];
    if (searchString.length > 0) {
      paginatedData = tournaments.filter(filterBySearchString);
    } else {
      paginatedData = tournaments.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    }
    return { paginatedData };
  }, [tournaments, pageNumber, pageSize, searchString, filterBySearchString]);

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`The Events Marketplace lets you find existing gaming competitions and other community events which you can advertiser in.`}
        {` `}To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3T8cQL4" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
  };

  const handleOnPageChange = (pageNumber: number, pageSize: number) => {
    setPageNumber(pageNumber);
    setPageSize(pageSize);
  };

  if (error) {
    return <span>{error?.message || 'An error occurred'}</span>;
  } else if (data?.battleFeed?.__typename === 'ResponseError') {
    return <span>{data?.battleFeed?.error?.message || 'An error occurred'}</span>;
  }

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
            {paginatedData.map((tournament) => (
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
      <br />
      <br />
      <Pagination
        defaultCurrent={1}
        total={tournaments.length}
        pageSize={pageSize}
        onChange={handleOnPageChange}
        style={{ textAlign: 'center' }}
      />
    </PageContainer>
  );
};

export default EventsGallery;
