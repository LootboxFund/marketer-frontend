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
import { Avatar, Button, Card, Input, message, Popconfirm, Popover, Space, Table } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { BROWSE_ALL_AFFILIATES } from './api.gql';
import styles from './index.less';
import { AffiliateID, formatBigNumber, OrganizerRank, rankInfoTable } from '@wormgraph/helpers';
import { ColumnsType } from 'antd/lib/table';

type DataType = {
  avatar: string;
  description: string;
  id: AffiliateID;
  name: string;
  publicContactEmail: string;
  rank: OrganizerRank;
  website: string;
  audienceSize: number;
};

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
        {`The Outsourcing Marketplace lets you hire event organizers from gaming communities, influencers & streamers.`}
        {` `}To learn more,{' '}
        <span>
          <a href="https://lootbox.fyi/3fwaSqj" target="_blank" rel="noreferrer">
            click here for a tutorial.
          </a>
        </span>
      </$InfoDescription>
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_, record) => <Avatar src={record.avatar} size="default" />,
    },
    {
      title: 'Promoter',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <$Vertical>
          <span>{record.name}</span>
        </$Vertical>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'audienceSize',
      key: 'audienceSize',
      render: (_, record) => (
        <$Vertical>
          <span>{formatBigNumber(record.audienceSize, 1)}</span>
        </$Vertical>
      ),
    },
    {
      title: 'Biography',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      render: (_, record) => {
        return (
          <Popover content={record.description} title={record.name}>
            <span>{record.description.slice(0, 200)}</span>
          </Popover>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        console.log(record);
        return (
          <Space size="middle">
            <Popconfirm
              key={`invite-${record.id}`}
              title={
                <span>
                  {`To invite ${record.name} to your Event, copy their PromoterID "${record.id}" and add them from your Event Page. `}
                  <a>View Tutorial</a>
                </span>
              }
              onConfirm={() => {
                navigator.clipboard.writeText(record.id);
                message.success('Copied to clipboard');
              }}
              okText="Copy Promoter ID"
            >
              <Button type="primary">Invite</Button>
            </Popconfirm>
            <Button key={`view-${record.id}`} disabled={!record.website}>
              <a href={record.website || ''} target="_blank" rel="noreferrer">
                Socials
              </a>
            </Button>
          </Space>
        );
      },
    },
  ];
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
            <Table
              // @ts-ignore
              columns={columns}
              dataSource={affiliates.filter(filterBySearchString).map((affiliate) => {
                return {
                  avatar: affiliate.avatar || '',
                  description: affiliate.description || '',
                  id: affiliate.id,
                  name: affiliate.name,
                  publicContactEmail: affiliate.publicContactEmail || '',
                  rank: affiliate.rank || rankInfoTable.ClayRank1,
                  website: affiliate.website || '',
                  audienceSize: affiliate.audienceSize || 0,
                };
              })}
            />
          </div>
        </$Vertical>
      )}
    </PageContainer>
  );
};

export default OutsourcePage;
