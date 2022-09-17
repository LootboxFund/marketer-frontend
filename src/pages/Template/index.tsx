import { BattleFeedResponse, QueryBattleFeedArgs } from '@/api/graphql/generated/types';
import Footer from '@/components/Footer';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { FormattedMessage, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React from 'react';
import { QUERY_BATTLE_FEED } from './api.gql';
import styles from './index.less';

const Template: React.FC = () => {
  const intl = useIntl();

  // const { data, loading, error } = useQuery<
  //   { battleFeed: BattleFeedResponse },
  //   QueryBattleFeedArgs
  // >(QUERY_BATTLE_FEED, {
  //   variables: { first: 6 },
  //   onCompleted: (data) => {
  //     if (data?.battleFeed?.__typename === 'BattleFeedResponseSuccess') {
  //       const nodes = data.battleFeed.edges;
  //       console.log(nodes);
  //     }
  //   },
  // });

  // if (error) {
  //   return <span>{error?.message || ''}</span>;
  // } else if (data?.battleFeed?.__typename === 'ResponseError') {
  //   return <span>{data?.battleFeed?.error?.message || ''}</span>;
  // }

  return (
    <PageContainer>
      <div className={styles.content}>
        <span>Hello World</span>
      </div>
      <Footer />
    </PageContainer>
  );
};

export default Template;
