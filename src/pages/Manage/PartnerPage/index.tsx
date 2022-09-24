import type {
  Affiliate,
  AffiliatePublicViewResponse,
  QueryAffiliatePublicViewArgs,
} from '@/api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { PageContainer } from '@ant-design/pro-components';
import { useQuery } from '@apollo/client';
import { useParams } from '@umijs/max';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { GET_PARTNER } from './api.gql';
import styles from './index.less';

const PartnerPage: React.FC = () => {
  const { partnerID } = useParams();
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [partner, setPartner] = useState<Affiliate>();
  const { data, loading, error } = useQuery<
    { affiliatePublicView: AffiliatePublicViewResponse },
    QueryAffiliatePublicViewArgs
  >(GET_PARTNER, {
    variables: { affiliateID: partnerID || '' },
    onCompleted: (data) => {
      if (data?.affiliatePublicView.__typename === 'AffiliatePublicViewResponseSuccess') {
        const partner = data.affiliatePublicView.affiliate;
        console.log(partner);
        setPartner(partner);
      }
    },
  });
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.affiliatePublicView.__typename === 'ResponseError') {
    return <span>{data?.affiliatePublicView.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Manage', route: '/manage' },
    { title: 'Partners', route: '/manage/partners' },
    { title: partner?.name || '', route: `/manage/partners/id/${partner?.id}` },
  ];

  return (
    <div>
      {loading || !partner ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{partner.name}</h1>
          <br />
          <p>{JSON.stringify(partner, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default PartnerPage;
