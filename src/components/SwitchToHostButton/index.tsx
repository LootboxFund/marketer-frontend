import { useAuth } from '@/api/firebase/useAuth';
import {
  AffiliateAdminViewResponse,
  QueryAffiliatePublicViewArgs,
} from '@/api/graphql/generated/types';
import { useLazyQuery } from '@apollo/client';
import { Button, Popconfirm } from 'antd';
import { useState } from 'react';
import { GET_AFFILIATE_ADMIN_VIEW } from './api.gql';
import { manifest } from '../../manifest';

export type SwitchToHostButtonProps = {
  buttonType?: 'primary' | 'default' | 'link' | 'text' | 'ghost';
  buttonText?: string;
};

const SwitchToHostButton: React.FC<SwitchToHostButtonProps> = ({ buttonType, buttonText }) => {
  const [loading, setLoading] = useState(false);
  const { upgradeToAffiliate } = useAuth();
  // GET AFFILIATE
  const [getAffiliate] = useLazyQuery<AffiliateAdminViewResponse, QueryAffiliatePublicViewArgs>(
    GET_AFFILIATE_ADMIN_VIEW,
  );
  const onConfirm = async () => {
    setLoading(true);
    const { data: res } = await getAffiliate();
    const data = res as unknown as { affiliateAdminView: AffiliateAdminViewResponse };

    if (data?.affiliateAdminView.__typename === 'ResponseError') {
      await upgradeToAffiliate();
      setTimeout(() => {
        window.open(`${manifest.microfrontends.dashboard.promoter}/user/logout`, '_blank');
        setLoading(false);
      }, 1000);
    } else if (data?.affiliateAdminView.__typename === 'AffiliateAdminViewResponseSuccess') {
      window.open(`${manifest.microfrontends.dashboard.promoter}/user/logout`, '_blank');
      setLoading(false);
    }
  };
  return (
    <Popconfirm
      title="To host your own events, you will need to switch to the Event Organizer App and login there with the same account. Would you like to open it in a new tab?"
      onConfirm={onConfirm}
      okText="Confirm"
      cancelText="Cancel"
    >
      <Button loading={loading} type={buttonType || 'ghost'}>
        {buttonText || 'Switch to Host'}
      </Button>
    </Popconfirm>
  );
};

export default SwitchToHostButton;
