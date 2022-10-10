import type {
  ListCreatedOffersResponse,
  OfferPreview,
  QueryListCreatedOffersArgs,
} from '@/api/graphql/generated/types';
import { Link } from 'umi';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_CREATED_OFFERS } from './api.gql';
import styles from './index.less';
import { Button, Card, Empty, Input } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const OffersPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const [searchString, setSearchString] = useState('');
  const [offers, setOffers] = useState<OfferPreview[]>([]);
  const { data, loading, error } = useQuery<
    { listCreatedOffers: ListCreatedOffersResponse },
    QueryListCreatedOffersArgs
  >(LIST_CREATED_OFFERS, {
    variables: { advertiserID },
    onCompleted: (data) => {
      if (data?.listCreatedOffers.__typename === 'ListCreatedOffersResponseSuccess') {
        const offers = data.listCreatedOffers.offers;
        console.log(offers);
        setOffers(offers);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listCreatedOffers.__typename === 'ResponseError') {
    return <span>{data?.listCreatedOffers.error?.message || ''}</span>;
  }

  const filterBySearchString = (offer: OfferPreview) => {
    return (
      offer.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      offer.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };

  const renderHelpText = () => {
    return (
      <$InfoDescription>
        {`This page lists all the promotional offers you've made for attracting new users. Click the "Create Offer" button to add more.`}
        {` `}To learn more,{' '}
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
              placeholder="Find Offer"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Link to="/manage/offers/create">
              <Button type="primary">Create Offer</Button>
            </Link>
          </$Horizontal>
          {!offers || offers.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not made any offers yet.
                    Get started by creating one now!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/manage/offers/create">
                <Button>Create Offer</Button>
              </Link>
            </Empty>
          ) : null}
          <div className={styles.content}>
            {offers.filter(filterBySearchString).map((offer) => (
              <Link key={offer.id} to={`/manage/offers/id/${offer.id}`}>
                <Card
                  hoverable
                  className={styles.card}
                  cover={<img alt="example" src={offer.image || ''} className={styles.cardImage} />}
                >
                  <Meta title={offer.title} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default OffersPage;
