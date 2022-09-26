import type {
  Ad,
  ListAdsOfAdvertiserResponse,
  QueryListAdsOfAdvertiserArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import {
  $Horizontal,
  $Vertical,
  placeholderImage,
  $ColumnGap,
  $InfoDescription,
} from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Button, Card, Empty, Input } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { Link } from 'umi';
import { LIST_ADS_PREVIEWS } from './api.gql';
import styles from './index.less';

const AdsPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const [ads, setAds] = React.useState<Ad[]>([]);
  const [searchString, setSearchString] = useState('');
  const { data, loading, error } = useQuery<
    { listAdsOfAdvertiser: ListAdsOfAdvertiserResponse },
    QueryListAdsOfAdvertiserArgs
  >(LIST_ADS_PREVIEWS, {
    variables: { advertiserID },
    onCompleted: (data) => {
      if (data?.listAdsOfAdvertiser.__typename === 'ListAdsOfAdvertiserResponseSuccess') {
        const res = data.listAdsOfAdvertiser.ads;
        console.log(res);
        setAds(res);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listAdsOfAdvertiser.__typename === 'ResponseError') {
    return <span>{data?.listAdsOfAdvertiser.error?.message || ''}</span>;
  }

  const filterBySearchString = (ad: Ad) => {
    return (
      ad.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      (ad && ad.name && ad.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1)
    );
  };

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
      {loading ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <$Vertical>
          {renderHelpText()}
          <$Horizontal justifyContent="space-between">
            <Input.Search
              placeholder="Find Ad Variants"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <$Horizontal>
              <Button>
                <Link to="/manage/adsets">Manage Ad Sets</Link>
              </Button>
              <$ColumnGap />
              <Button type="primary">
                <Link to="/manage/ads/create">New Creative</Link>
              </Button>
            </$Horizontal>
          </$Horizontal>
          <br />
          {!ads || ads.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not made any Ad Creatives yet.
                    Get started by creating one now!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/manage/ads/create">
                <Button type="primary">New Ad Creative</Button>
              </Link>
            </Empty>
          ) : null}
          <div className={styles.content}>
            {ads.filter(filterBySearchString).map((ad) => {
              const imageToDisplay = ad.creative.thumbnail || placeholderImage;
              return (
                <Link key={ad.id} to={`/manage/ads/id/${ad.id}`}>
                  <Card
                    hoverable
                    className={styles.card}
                    cover={<img alt="example" src={imageToDisplay} className={styles.cardImage} />}
                  >
                    <Meta title={ad.name} />
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

export default AdsPage;
