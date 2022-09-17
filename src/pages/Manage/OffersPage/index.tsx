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
import { Button, Card, Input } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { $Horizontal, $Vertical } from '@/components/generics';

const OffersPage: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const [offers, setOffers] = useState<OfferPreview[]>([]);
  const { data, loading, error } = useQuery<
    { listCreatedOffers: ListCreatedOffersResponse },
    QueryListCreatedOffersArgs
  >(LIST_CREATED_OFFERS, {
    variables: { advertiserID: 'p7BpSqP6U4n4NEanEcFt' },
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
              placeholder="Find Offer"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button>
              <Link to="/manage/offers/create">Create Offer</Link>
            </Button>
          </$Horizontal>
          <div className={styles.content}>
            {offers.filter(filterBySearchString).map((offer) => (
              <Link key={offer.id} to={`/manage/offers/id/${offer.id}`}>
                <Card
                  hoverable
                  style={{ flex: 1 }}
                  cover={<img alt="example" src={offer.image || ''} />}
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
