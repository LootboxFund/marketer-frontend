import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Card } from 'antd';
import React from 'react';
import styles from './index.less';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  action: JSX.Element;
}> = ({ title, action, index, desc }) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 4px 0 rgba(35,49,128,0.02), 0 4px 8px 0 rgba(49,69,179,0.02)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'rgba(0,0,0,0.65)',
        textAlign: 'justify',
        lineHeight: ' 22px',
        padding: '16px 19px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.85)',
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(0,0,0,0.65)',
          textAlign: 'left',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      {action}
    </div>
  );
};

const GettingStarted: React.FC = () => {
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: '#1A1A1A',
            }}
          >
            Grow Your Community
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(0,0,0,0.65)',
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            {`Grow your community with friendly online competitions in collaboration with gaming communities, influencers, and content creators. Watch the below tutorial video before you start.`}
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              title="Plan Your Campaign"
              desc={`Plan based on company goals. For example "Indonesian Expansion" or "Spring 2023 Sale".`}
              action={<Link to="/dashboard/campaigns/create">Create Campaign {'>'}</Link>}
            />
            <InfoCard
              index={2}
              title="Partner with Affiliates"
              desc="Find partners to help you run community events around your campagins."
              action={<Link to="/marketplace/welcome">Visit Marketplace {'>'}</Link>}
            />
            <InfoCard
              index={3}
              title="Grow Your Community"
              desc="Measure your growth from events and increase ROI with funnel optimization."
              action={<Link to="/company/progress">Learn More {'>'}</Link>}
            />
          </div>
        </div>
      </Card>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
          height: 'auto',
          minHeight: '500px',
        }}
      >
        <div style={{ maxWidth: '1980px' }}>
          <iframe
            className={styles.video}
            width="100%"
            src="https://www.youtube.com/embed/e0hlP84HeMU"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Card>
    </PageContainer>
  );
};

export default GettingStarted;
