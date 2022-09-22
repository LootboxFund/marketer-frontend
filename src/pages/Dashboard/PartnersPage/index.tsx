import type {
  ListConquestPreviewsResponse,
  ListPartnersOfAdvertiserResponse,
  QueryListConquestPreviewsArgs,
  QueryListPartnersOfAdvertiserArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_PARTNERS } from './api.gql';
import styles from './index.less';
import { Affiliate } from '../../../api/graphql/generated/types';
import { $Horizontal, $Vertical } from '@/components/generics';
import { Button, Card, Input, message } from 'antd';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';

const PartnersPage: React.FC = () => {
  const [searchString, setSearchString] = useState('');
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [partners, setPartners] = useState<Affiliate[]>([]);
  const { data, loading, error } = useQuery<
    { listPartnersOfAdvertiser: ListPartnersOfAdvertiserResponse },
    QueryListPartnersOfAdvertiserArgs
  >(LIST_PARTNERS, {
    variables: { advertiserID },
    onCompleted: (data) => {
      if (data?.listPartnersOfAdvertiser.__typename === 'ListPartnersOfAdvertiserResponseSuccess') {
        const partners = data.listPartnersOfAdvertiser.partners;
        console.log(partners);
        setPartners(partners);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.listPartnersOfAdvertiser.__typename === 'ResponseError') {
    return <span>{data?.listPartnersOfAdvertiser.error?.message || ''}</span>;
  }

  const filterBySearchString = (affiliate: Affiliate) => {
    return (
      affiliate.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      affiliate.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1
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
              placeholder="Find Partner"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button
              onClick={() => message.info('To add a new partner, email support@lootbox.fund')}
            >
              Add Partner
            </Button>
          </$Horizontal>
          <br />
          <div className={styles.content}>
            {partners.filter(filterBySearchString).map((affiliate) => (
              <Link key={affiliate.id} to={`/dashboard/partner/id/${affiliate.id}`}>
                <Card
                  hoverable
                  className={styles.card}
                  cover={
                    <img alt="example" src={affiliate.avatar || ''} className={styles.cardImage} />
                  }
                >
                  <Meta title={affiliate.name} />
                </Card>
              </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default PartnersPage;
