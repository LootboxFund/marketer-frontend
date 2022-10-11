import type {
  ConquestPreview,
  ListConquestPreviewsResponse,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Card from 'antd/lib/card/Card';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_CONQUEST_PREVIEWS } from './api.gql';
import styles from './index.less';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { Button, Empty, Input } from 'antd';
import { Link } from 'umi';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const CampaignsPage: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [conquests, setConquests] = useState<ConquestPreview[]>([]);

  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;

  const { data, loading, error } = useQuery<
    { listConquestPreviews: ListConquestPreviewsResponse },
    QueryListConquestPreviewsArgs
  >(LIST_CONQUEST_PREVIEWS, {
    variables: { advertiserID },
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

  const filterBySearchString = (conquest: ConquestPreview) => {
    return (
      conquest.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      conquest.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`Campaigns help organize your community events under company goals. Click the "Create Campaign" button to make a new one.`}{' '}
        To learn more,{' '}
        <span>
          <a>click here for a tutorial.</a>
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
              placeholder="Find Campaign"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button>
              <Link to="/dashboard/campaigns/create">Create Campaign</Link>
            </Button>
          </$Horizontal>
          {!conquests || conquests.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not created any campaigns yet.
                    Create your first campaign now!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/dashboard/campaigns/create">
                <Button type="primary">Create Campaign</Button>
              </Link>
            </Empty>
          ) : null}
          <div className={styles.content}>
            {conquests.filter(filterBySearchString).map((conquest) => (
              <Link key={conquest.id} to={`/dashboard/campaigns/id/${conquest.id}`}>
                <Card
                  hoverable
                  className={styles.card}
                  cover={
                    <img alt="example" src={conquest.image || ''} className={styles.cardImage} />
                  }
                >
                  <Meta title={conquest.title} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default CampaignsPage;
