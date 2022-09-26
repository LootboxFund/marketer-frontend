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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
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
