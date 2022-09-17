import type {
  ConquestPreview,
  ListConquestPreviewsResponse,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { Link } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Card from 'antd/lib/card/Card';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_CONQUEST_PREVIEWS } from './api.gql';
import styles from './index.less';

const CampaignsPage: React.FC = () => {
  const [conquests, setConquests] = useState<ConquestPreview[]>([]);

  const { data, loading, error } = useQuery<
    { listConquestPreviews: ListConquestPreviewsResponse },
    QueryListConquestPreviewsArgs
  >(LIST_CONQUEST_PREVIEWS, {
    variables: { advertiserID: 'p7BpSqP6U4n4NEanEcFt' },
    onCompleted: (data) => {
      if (data?.listConquestPreviews.__typename === 'ListConquestPreviewsResponseSuccess') {
        const conquests = data.listConquestPreviews.conquests;
        setConquests(conquests);
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
          {conquests.map((conquest) => (
            <Link key={conquest.id} to={`/dashboard/campaigns/cid/${conquest.id}`}>
              <Card
                hoverable
                style={{ flex: 1 }}
                cover={<img alt="example" src={conquest.image || ''} />}
              >
                <Meta title={conquest.title} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default CampaignsPage;
