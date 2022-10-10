import { useAuth } from '@/api/firebase/useAuth';
import type {
  AdvertiserAdminViewResponse,
  AdvertiserAdminViewResponseSuccess,
  Affiliate,
  AffiliateAdminViewResponse,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { $InfoDescription } from '@/components/generics';
import { GET_ADVERTISER } from '@/pages/User/Login/api.gql';
import { SmileOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { Timeline } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import styles from './index.less';

const Tier1 = [
  <Timeline.Item key="1.0" color="green" position="right">
    <h4>Marketing Intern - Tier 1</h4>
  </Timeline.Item>,
  <Timeline.Item key="1.1" color="green" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      {`Watch the "Getting Started" Video (5 mins)`}
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.2" color="green" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Explore the Marketplace (3 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.3" color="blue" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Create your First Offer (4 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="1.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Meet the Lootbox Team (20 mins)
    </a>
  </Timeline.Item>,
];

const Tier2 = [
  <Timeline.Item key="2.0" color="#CECECE" position="right">
    <h4>Community Builder - Tier 2</h4>
    <span>Access to Marketplace</span>
  </Timeline.Item>,
  <Timeline.Item key="2.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Partner with Promoters (5 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Launch your First Community Event (14 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Launch your First Ad (30 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Run Multiple Events Together (14 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="2.5" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Support Your Community (Ongoing)
    </a>
  </Timeline.Item>,
];

const Tier3 = [
  <Timeline.Item key="3.0" color="#CECECE" position="right">
    <h4>Nation Builder - Tier 3</h4>
    <span>Access to Ad Retargeting</span>
    <br />
    <span>Access to Public Events</span>
  </Timeline.Item>,
  <Timeline.Item key="3.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Strategize with Lootbox Team (90 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Optimize your Funnel (7 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      {`Setup Ad Retargeting (90 mins)`}
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Recruit more Partners (7 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.5" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Increase Community Budget (30 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="3.6" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Scale Your Events Nationwide (90 days)
    </a>
  </Timeline.Item>,
];

const Tier4 = [
  <Timeline.Item key="4.0" color="#CECECE" position="right">
    <h4>Global Expansion - Tier 4</h4>
    <span>Enterprise Support</span>
  </Timeline.Item>,
  <Timeline.Item key="4.1" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Strategize with Lootbox Team (90 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.2" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Recruit Partners Worldwide (60 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.3" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Regionalize your Funnels (30 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.4" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Increase Community Budget (45 mins)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.5" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Scale your Events Globally (180 days)
    </a>
  </Timeline.Item>,
  <Timeline.Item key="4.6" color="#CECECE" position="left">
    <a href="https://google.ca" target="_blank" rel="noreferrer">
      Ecosystem Sustainability (Ongoing)
    </a>
  </Timeline.Item>,
];

const ProgressPage: React.FC = () => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const { logout } = useAuth();
  const [advertiser, setAdvertiserUser] = useState<AdvertiserAdminViewResponseSuccess>();
  // GET ADVERTISER
  const { data, loading, error } = useQuery<{ advertiserAdminView: AdvertiserAdminViewResponse }>(
    GET_ADVERTISER,
    {
      onCompleted: (data) => {
        if (data?.advertiserAdminView.__typename === 'AdvertiserAdminViewResponseSuccess') {
          const advertiser = data.advertiserAdminView;
          setAdvertiserUser(advertiser);
        }
      },
    },
  );
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.advertiserAdminView.__typename === 'ResponseError') {
    return <span>{data?.advertiserAdminView.error?.message || ''}</span>;
  } else if (!data) {
    return null;
  }
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
        <div style={{ maxWidth: '800px' }}>
          <div className={styles.content}>
            {renderHelpText()}
            <br />
            <br />
            <Timeline mode="alternate">
              {Tier1.map((item) => item)}
              {Tier2.map((item) => item)}
              {Tier3.map((item) => item)}
              {Tier4.map((item) => item)}
            </Timeline>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ProgressPage;
