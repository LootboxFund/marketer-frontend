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
