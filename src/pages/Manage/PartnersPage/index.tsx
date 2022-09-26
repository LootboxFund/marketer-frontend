import type {
  ListConquestPreviewsResponse,
  ListPartnersOfAdvertiserResponse,
  QueryListConquestPreviewsArgs,
  QueryListPartnersOfAdvertiserArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { history, Link } from '@umijs/max';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { LIST_PARTNERS } from './api.gql';
import styles from './index.less';
import { Affiliate } from '../../../api/graphql/generated/types';
import { $Horizontal, $InfoDescription, $Vertical } from '@/components/generics';
import { Button, Card, Empty, Input, message, Popconfirm } from 'antd';
import Meta from 'antd/lib/card/Meta';
import { formatBigNumber } from '@wormgraph/helpers';

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
              placeholder="Find Partner"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Popconfirm
              key={`invite-more`}
              title={`To invite more partners, visit the Outsourcing Marketplace`}
              onConfirm={() => {
                history.push(`/marketplace/outsource`);
              }}
              okText="Visit Marketplace"
            >
              <Button>Add Partner</Button>
            </Popconfirm>
          </$Horizontal>
          <br />
          {!partners || partners.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You do not have any partners yet.
                    Visit the marketplace to start whitelisting partners to offers!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/marketplace/outsource">
                <Button type="primary">Visit Marketplace</Button>
              </Link>
            </Empty>
          ) : null}
          <div className={styles.content}>
            {partners.filter(filterBySearchString).map((affiliate) => (
              // <Link key={affiliate.id} to={`/dashboard/partners/id/${affiliate.id}`}>
              <Card
                key={affiliate.id}
                className={styles.card}
                cover={
                  <img alt="example" src={affiliate.avatar || ''} className={styles.cardImage} />
                }
                actions={[
                  <Popconfirm
                    key={`invite-${affiliate.id}`}
                    title={`To invite ${affiliate.name} to your Event, copy their PromoterID "${affiliate.id}" and add them from your Event Page`}
                    onConfirm={() => {
                      navigator.clipboard.writeText(affiliate.id);
                      message.success('Copied to clipboard');
                    }}
                    okText="Copy Promoter ID"
                  >
                    <Button type="primary" style={{ width: '90%' }}>
                      Invite
                    </Button>
                  </Popconfirm>,
                  <Button key={`view-${affiliate.id}`} disabled={!affiliate.website}>
                    <a href={affiliate.website || ''} target="_blank" rel="noreferrer">
                      View Socials{' '}
                    </a>
                  </Button>,
                ]}
              >
                <Meta
                  title={affiliate.name}
                  description={`${formatBigNumber(affiliate.audienceSize || 0, 1)} Audience`}
                />
              </Card>
              // </Link>
            ))}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default PartnersPage;
