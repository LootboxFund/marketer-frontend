import type {
  BrowseAllAffiliatesResponse,
  MarketplacePreviewAffiliate,
  QueryAffiliatePublicViewArgs,
  QueryListConquestPreviewsArgs,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $InfoDescription, $Vertical } from '@/components/generics';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { Button, Card, Input, message, Popconfirm } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ALL_AFFILIATES } from './api.gql';
import styles from './index.less';
import { formatBigNumber } from '@wormgraph/helpers';

const OutsourcePage: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: affiliateID } = advertiserUser;
  const [searchString, setSearchString] = useState('');
  const [affiliates, setAffiliates] = useState<MarketplacePreviewAffiliate[]>([]);
  const { data, loading, error } = useQuery<{ browseAllAffiliates: BrowseAllAffiliatesResponse }>(
    BROWSE_ALL_AFFILIATES,
    {
      onCompleted: (data) => {
        if (data?.browseAllAffiliates.__typename === 'BrowseAllAffiliatesResponseSuccess') {
          const affiliates = data.browseAllAffiliates.affiliates;
          setAffiliates(affiliates);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.browseAllAffiliates.__typename === 'ResponseError') {
    return <span>{data?.browseAllAffiliates.error?.message || ''}</span>;
  }

  const filterBySearchString = (affiliate: MarketplacePreviewAffiliate) => {
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
          <Input.Search
            placeholder="Filter Partners"
            allowClear
            onChange={(e) => setSearchString(e.target.value)}
            onSearch={setSearchString}
            style={{ width: 200 }}
          />
          <br />
          <div className={styles.content}>
            {affiliates.filter(filterBySearchString).map((affiliate) => {
              return (
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
                        View Socials
                      </a>
                    </Button>,
                  ]}
                >
                  <Meta
                    title={affiliate.name}
                    description={`${formatBigNumber(affiliate.audienceSize || 0, 1)} Audience`}
                  />
                </Card>
              );
            })}
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default OutsourcePage;
