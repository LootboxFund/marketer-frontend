import type {
  ListConquestPreviewsResponse,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $InfoDescription } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Empty } from 'antd';
import Spin from 'antd/lib/spin';
import React from 'react';
import { LIST_CONQUEST_PREVIEWS } from './api.gql';
import styles from './index.less';

const BillingPage: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const renderHelpText = () => {
    return (
      <$InfoDescription>
        This is where you can preload your company wallet and view historical marketing spend. To
        learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3NxwAXi" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
  };
  return (
    <PageContainer>
      {renderHelpText()}
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Coming Soon"
        style={{ padding: '100px', border: '1px solid rgba(0,0,0,0.1)' }}
      />
    </PageContainer>
  );
};

export default BillingPage;
