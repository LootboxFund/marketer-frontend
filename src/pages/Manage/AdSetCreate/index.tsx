import type {
  ListConquestPreviewsResponse,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React from 'react';
import { LIST_CONQUEST_PREVIEWS } from './api.gql';
import styles from './index.less';

const AdSetCreate: React.FC = () => {
  const { data, loading, error } = useQuery<
    { listConquestPreviews: ListConquestPreviewsResponse },
    QueryListConquestPreviewsArgs
  >(LIST_CONQUEST_PREVIEWS, {
    variables: { advertiserID: 'p7BpSqP6U4n4NEanEcFt' },
    onCompleted: (data) => {
      if (data?.listConquestPreviews.__typename === 'ListConquestPreviewsResponseSuccess') {
        const conquests = data.listConquestPreviews.conquests;
        console.log(conquests);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listConquestPreviews.__typename === 'ResponseError') {
    return <span>{data?.listConquestPreviews.error?.message || ''}</span>;
  }

  return (
    <PageContainer>
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <span>AdSetCreate</span>
        </div>
      )}
    </PageContainer>
  );
};

export default AdSetCreate;
