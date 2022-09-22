import type {
  AdSet,
  ListAdSetsOfAdvertiserResponse,
  QueryListAdSetsOfAdvertiserArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $Horizontal, $Vertical, placeholderImage, $ColumnGap } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Button, Card, Input } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { Link } from 'umi';
import { LIST_ADSETS_PREVIEWS } from './api.gql';
import styles from './index.less';

const AdSetsPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const [adSets, setAdSets] = React.useState<AdSet[]>([]);
  const [searchString, setSearchString] = useState('');
  const { data, loading, error } = useQuery<
    { listAdSetsOfAdvertiser: ListAdSetsOfAdvertiserResponse },
    QueryListAdSetsOfAdvertiserArgs
  >(LIST_ADSETS_PREVIEWS, {
    variables: { advertiserID },
    onCompleted: (data) => {
      if (data?.listAdSetsOfAdvertiser.__typename === 'ListAdSetsOfAdvertiserResponseSuccess') {
        const res = data.listAdSetsOfAdvertiser.adSets;
        setAdSets(res);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listAdSetsOfAdvertiser.__typename === 'ResponseError') {
    return <span>{data?.listAdSetsOfAdvertiser.error?.message || ''}</span>;
  }

  const filterBySearchString = (adSet: AdSet) => {
    return (
      adSet.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      adSet.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
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
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Find Ad Sets"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <$Horizontal>
              <Button>
                <Link to="/manage/ads">Manage Creatives</Link>
              </Button>
              <$ColumnGap />
              <Button type="primary">
                <Link to="/manage/adsets/create">New Ad Set</Link>
              </Button>
            </$Horizontal>
          </$Horizontal>
          <br />
          <div className={styles.content}>
            {adSets.filter(filterBySearchString).map((adSet) => {
              const imageToDisplay =
                adSet.thumbnail || (adSet.ads || [])[0]?.creative?.thumbnail || placeholderImage;
              return (
                <Link key={adSet.id} to={`/manage/adsets/id/${adSet.id}`}>
                  <Card
                    hoverable
                    className={styles.card}
                    cover={<img alt="example" src={imageToDisplay} className={styles.cardImage} />}
                  >
                    <Meta title={adSet.name} />
                  </Card>
                </Link>
              );
            })}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default AdSetsPage;
